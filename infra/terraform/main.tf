# SecureHealth Enterprise Infrastructure
# Terraform configuration for AWS EKS-based microservices platform

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket = "securehealth-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
    
    dynamodb_table = "securehealth-terraform-locks"
    encrypt        = true
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  name = "securehealth"
  environment = var.environment
  region = var.aws_region
  
  tags = {
    Environment = local.environment
    Project     = "SecureHealth"
    ManagedBy   = "Terraform"
    Owner       = "DevOps"
  }
  
  vpc_cidr = "10.0.0.0/16"
  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-${local.environment}-vpc"
  cidr = local.vpc_cidr

  azs             = local.azs
  private_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 4, k)]
  public_subnets  = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 48)]
  intra_subnets   = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 52)]

  enable_nat_gateway = true
  single_nat_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = local.tags
}

# EKS Module
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${local.name}-${local.environment}-cluster"
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  # EKS Managed Node Groups
  eks_managed_node_groups = {
    general = {
      name = "general"

      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "ON_DEMAND"

      min_size     = 2
      max_size     = 10
      desired_size = 3

      disk_size = 50
      disk_type = "gp3"

      labels = {
        role = "general"
      }

      taints = []
    }

    compute = {
      name = "compute"

      instance_types = ["c5.large", "c5.xlarge"]
      capacity_type  = "ON_DEMAND"

      min_size     = 1
      max_size     = 5
      desired_size = 2

      disk_size = 100
      disk_type = "gp3"

      labels = {
        role = "compute"
      }

      taints = [
        {
          key    = "node-type"
          value  = "compute"
          effect = "NO_SCHEDULE"
        }
      ]
    }

    storage = {
      name = "storage"

      instance_types = ["r5.large", "r5.xlarge"]
      capacity_type  = "ON_DEMAND"

      min_size     = 2
      max_size     = 6
      desired_size = 3

      disk_size = 200
      disk_type = "gp3"

      labels = {
        role = "storage"
      }

      taints = [
        {
          key    = "node-type"
          value  = "storage"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }

  # AWS Load Balancer Controller
  enable_aws_load_balancer_controller = true

  # Cluster access entry
  cluster_access_entries = {
    admin = {
      kubernetes_groups = ["system:masters"]
      principal_arn     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
    }
  }

  tags = local.tags
}

# EKS Addons
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = module.eks.cluster_name
  addon_name   = "vpc-cni"
  addon_version = "v1.13.4-eksbuild.1"
  
  resolve_conflicts = "OVERWRITE"
  
  depends_on = [module.eks]
}

resource "aws_eks_addon" "coredns" {
  cluster_name = module.eks.cluster_name
  addon_name   = "coredns"
  addon_version = "v1.10.1-eksbuild.1"
  
  resolve_conflicts = "OVERWRITE"
  
  depends_on = [module.eks]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = module.eks.cluster_name
  addon_name   = "kube-proxy"
  addon_version = "v1.28.1-eksbuild.1"
  
  resolve_conflicts = "OVERWRITE"
  
  depends_on = [module.eks]
}

resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name = module.eks.cluster_name
  addon_name   = "aws-ebs-csi-driver"
  addon_version = "v1.19.0-eksbuild.2"
  
  resolve_conflicts = "OVERWRITE"
  
  depends_on = [module.eks]
}

# RDS PostgreSQL - Primary Database
module "rds_postgres" {
  source = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${local.name}-${local.environment}-postgres"

  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "securehealth"
  username = "postgres"
  password = var.database_password
  port     = "5432"

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  skip_final_snapshot = false
  deletion_protection = local.environment == "production"

  performance_insights_enabled = true
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn

  tags = local.tags
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-${local.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.tags, {
    Name = "${local.name}-${local.environment}-db-subnet-group"
  })
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_prefix = "${local.name}-${local.environment}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.name}-${local.environment}-rds-sg"
  })
}

# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${local.name}-${local.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name}-${local.environment}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${local.name}-${local.environment}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.name}-${local.environment}-redis-sg"
  })
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${local.name}-${local.environment}-redis"
  description                = "Redis cluster for SecureHealth"

  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true

  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  tags = local.tags
}

# S3 Buckets
resource "aws_s3_bucket" "documents" {
  bucket = "${local.name}-${local.environment}-documents-${random_string.bucket_suffix.result}"

  tags = local.tags
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "documents" {
  bucket = aws_s3_bucket.documents.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "document_lifecycle"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 2555  # 7 years for compliance
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Random string for bucket suffix
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# KMS Keys
resource "aws_kms_key" "documents" {
  description             = "KMS key for document encryption"
  deletion_window_in_days = 7

  tags = local.tags
}

resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7

  tags = local.tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "eks_cluster" {
  name              = "/aws/eks/${local.name}-${local.environment}-cluster/cluster"
  retention_in_days = 7

  tags = local.tags
}

# Application Load Balancer for external access
resource "aws_lb" "external" {
  name               = "${local.name}-${local.environment}-external-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_external.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = local.environment == "production"

  tags = local.tags
}

# ALB Security Group
resource "aws_security_group" "alb_external" {
  name_prefix = "${local.name}-${local.environment}-alb-external-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.name}-${local.environment}-alb-external-sg"
  })
}

# Outputs
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "postgres_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds_postgres.db_instance_endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "s3_documents_bucket" {
  description = "S3 bucket for document storage"
  value       = aws_s3_bucket.documents.bucket
}

output "kms_documents_key_id" {
  description = "KMS key ID for document encryption"
  value       = aws_kms_key.documents.key_id
}

