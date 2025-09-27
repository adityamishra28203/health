# HealthWallet - Blockchain Health Records & Insurance Platform

A comprehensive blockchain-powered health records and insurance platform built with modern web technologies. This platform enables secure, decentralized management of medical records with complete user control and privacy.

## 🚀 Features

- **🔐 End-to-End Encryption**: Military-grade security for all health data
- **⛓️ Blockchain Verification**: Tamper-proof record authenticity using blockchain
- **📱 Mobile-First Design**: Responsive design for all devices
- **🌐 Multi-language Support**: English and Hindi language support
- **🏥 HIPAA & DISHA Compliant**: Full compliance with health data regulations
- **💳 Insurance Integration**: Seamless insurance claims processing
- **📊 Analytics Dashboard**: Comprehensive health data analytics
- **🔔 Real-time Notifications**: Instant updates and alerts

## 🏗️ Architecture

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### Backend
- **NestJS** - Scalable Node.js framework
- **MongoDB** - NoSQL database for health records
- **Redis** - Caching and session management
- **JWT** - Secure authentication
- **Multer** - File upload handling

### Blockchain
- **Ethereum** - Smart contracts for record verification
- **IPFS** - Decentralized file storage
- **Ganache** - Local blockchain development

### Infrastructure
- **Docker** - Containerized deployment
- **Nginx** - Reverse proxy and load balancing
- **Kubernetes** - Container orchestration (optional)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### **Deploy to Vercel (Recommended)**

#### **Frontend + Backend on Vercel**

1. **Deploy Frontend:**
   - Go to [Vercel.com](https://vercel.com)
   - Import GitHub repository
   - Set Root Directory to `frontend`
   - Deploy

2. **Deploy Backend:**
   - Create new Vercel project
   - Set Root Directory to `backend`
   - Configure environment variables
   - Deploy

3. **Update URLs:**
   - Update frontend environment variables with backend URL
   - Redeploy frontend

**See [VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md) for detailed instructions.**

### **Local Development**

#### 1. Clone the Repository

```bash
git clone https://github.com/adityamishra28203/health.git
cd health
```

#### 2. Environment Setup

Create environment files for each service:

#### Backend Environment (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/healthwallet
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...

# IPFS
IPFS_URL=http://localhost:5001

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend Environment (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_URL=http://localhost:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=http://localhost:8545
```

#### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install mobile dependencies (optional)
cd ../mobile
npm install
```

#### 4. Start with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 5. Manual Development Setup

#### Start Backend
```bash
cd backend
npm run start:dev
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

#### Start Mobile (Expo)
```bash
cd mobile
npm start
```

## 🔧 Development Setup

### Backend Development

1. **Database Setup**
   ```bash
   cd backend
   # Start MongoDB locally or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Start Redis
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

2. **Run Migrations**
   ```bash
   npm run migration:run
   ```

3. **Seed Database**
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

### Frontend Development

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Mobile Development

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Start Development Server**
   ```bash
   cd mobile
   npm start
   ```

3. **Run on Device**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal

## 🐳 Docker Deployment

### Production Deployment

1. **Build Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Scale Services**
   ```bash
   docker-compose up -d --scale backend=3 --scale frontend=2
   ```

### Kubernetes Deployment

1. **Apply Configurations**
   ```bash
   kubectl apply -f deployment/k8s/
   ```

2. **Check Status**
   ```bash
   kubectl get pods
   kubectl get services
   ```

## 📁 Project Structure

```
blockchain-health-wallet/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── blockchain/     # Blockchain integration
│   │   ├── health-records/ # Health records management
│   │   ├── insurance/      # Insurance claims
│   │   ├── notifications/  # Notification system
│   │   ├── users/          # User management
│   │   └── schemas/        # Database schemas
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities and configs
│   ├── Dockerfile
│   └── package.json
├── mobile/                 # React Native Mobile App
│   ├── src/
│   │   ├── components/    # Mobile components
│   │   ├── screens/       # App screens
│   │   └── services/      # API services
│   └── package.json
├── contracts/              # Smart Contracts
│   └── HealthRecord.sol
├── deployment/             # Deployment configs
│   ├── k8s/               # Kubernetes manifests
│   ├── nginx.conf         # Nginx configuration
│   └── mongo-init.js      # MongoDB initialization
├── docker-compose.yml      # Development setup
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different access levels for users
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Blockchain Verification**: Immutable record verification
- **HIPAA Compliance**: Healthcare data protection standards
- **DISHA Compliance**: Indian healthcare data regulations

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:e2e
```

### Mobile Testing
```bash
cd mobile
npm run test
```

## 📊 API Documentation

The API documentation is available at:
- **Development**: http://localhost:3001/api/docs
- **Production**: https://your-domain.com/api/docs

### Key Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /health-records` - Get user's health records
- `POST /health-records` - Create new health record
- `GET /insurance/claims` - Get insurance claims
- `POST /insurance/claims` - Submit insurance claim

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

#### Backend (.env)
```bash
MONGODB_URI=mongodb://mongodb:27017/healthwallet
REDIS_URL=redis://redis:6379
JWT_SECRET=your-production-jwt-secret
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001
PORT=3001
NODE_ENV=production
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_IPFS_URL=https://ipfs.your-domain.com
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
```

### Production Checklist

- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipeline
- [ ] Configure load balancing
- [ ] Set up database clustering
- [ ] Configure security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@healthwallet.com
- **Documentation**: https://docs.healthwallet.com
- **Issues**: https://github.com/your-org/blockchain-health-wallet/issues

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [NestJS](https://nestjs.com/) for the scalable Node.js framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📈 Roadmap

- [ ] Mobile app improvements
- [ ] Advanced analytics dashboard
- [ ] AI-powered health insights
- [ ] Integration with more insurance providers
- [ ] Multi-chain blockchain support
- [ ] Voice-to-text health record input
- [ ] Telemedicine integration
- [ ] Wearable device integration

---

**HealthWallet** - Your Health Data, Your Control 🏥💙