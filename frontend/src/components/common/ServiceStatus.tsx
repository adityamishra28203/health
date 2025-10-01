'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Shield,
  FileText,
  Building2,
  Heart,
  Server,
  Globe,
  Lock
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  url: string;
  responseTime?: number;
  lastCheck: string;
  description: string;
  icon: React.ReactNode;
}

const SERVICES: ServiceStatus[] = [
  {
    name: 'Hospital Service',
    status: 'healthy',
    url: 'http://localhost:3003/api/v1/hospitals/health',
    responseTime: 45,
    lastCheck: new Date().toISOString(),
    description: 'Hospital management and patient linking',
    icon: <Building2 className="h-4 w-4" />
  },
  {
    name: 'Patient Service',
    status: 'healthy',
    url: 'http://localhost:3001/api/v1/patients/health',
    responseTime: 32,
    lastCheck: new Date().toISOString(),
    description: 'Patient records and health data management',
    icon: <Heart className="h-4 w-4" />
  },
  {
    name: 'Document Service',
    status: 'healthy',
    url: 'http://localhost:3002/api/v1/documents/health',
    responseTime: 28,
    lastCheck: new Date().toISOString(),
    description: 'Document upload and encryption',
    icon: <FileText className="h-4 w-4" />
  },
  {
    name: 'Auth Service',
    status: 'healthy',
    url: 'http://localhost:3004/api/v1/auth/health',
    responseTime: 15,
    lastCheck: new Date().toISOString(),
    description: 'Authentication and authorization',
    icon: <Shield className="h-4 w-4" />
  },
  {
    name: 'Blockchain Service',
    status: 'healthy',
    url: 'http://localhost:3005/api/v1/blockchain/health',
    responseTime: 120,
    lastCheck: new Date().toISOString(),
    description: 'Blockchain verification and audit trails',
    icon: <Lock className="h-4 w-4" />
  },
  {
    name: 'Notification Service',
    status: 'healthy',
    url: 'http://localhost:3006/api/v1/notifications/health',
    responseTime: 25,
    lastCheck: new Date().toISOString(),
    description: 'Email and SMS notifications',
    icon: <Globe className="h-4 w-4" />
  }
];

export default function ServiceStatus() {
  const [services, setServices] = useState<ServiceStatus[]>(SERVICES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const checkServiceHealth = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      const startTime = Date.now();
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          ...service,
          status: 'healthy',
          responseTime,
          lastCheck: new Date().toISOString()
        };
      } else {
        return {
          ...service,
          status: 'degraded',
          responseTime,
          lastCheck: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        ...service,
        status: 'down',
        lastCheck: new Date().toISOString()
      };
    }
  };

  const refreshAllServices = async () => {
    setLoading(true);
    try {
      const updatedServices = await Promise.all(
        services.map(service => checkServiceHealth(service))
      );
      setServices(updatedServices);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error checking services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAllServices, 30000);
    return () => clearInterval(interval);
  }, [services]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Degraded
          </Badge>
        );
      case 'down':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Down
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-600" />
              <span>Service Status</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all microservices
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{healthyServices}/{totalServices}</div>
              <div className="text-sm text-gray-500">Services Online</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAllServices}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  {service.icon}
                </div>
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  {service.responseTime && (
                    <div className="text-sm text-gray-600">
                      {service.responseTime}ms
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(service.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
                {getStatusIcon(service.status)}
                {getStatusBadge(service.status)}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span>Auto-refresh: 30s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
