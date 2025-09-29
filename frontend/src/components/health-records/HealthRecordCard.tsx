'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle,
  Tag,
  Share
} from 'lucide-react';
import { HealthRecord } from '@/lib/health-records';
import { healthRecordsService } from '@/lib/health-records';

interface HealthRecordCardProps {
  record: HealthRecord;
  onView: (record: HealthRecord) => void;
  onDownload: (record: HealthRecord) => void;
  onShare: (record: HealthRecord) => void;
}

export default function HealthRecordCard({ record, onView, onDownload, onShare }: HealthRecordCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFileTypeIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('text')) return '📝';
    return '📁';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {record.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {healthRecordsService.getTypeDisplayName(record.type)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={healthRecordsService.getStatusColor(record.status)}>
              {getStatusIcon(record.status)}
              <span className="ml-1 capitalize">{record.status}</span>
            </Badge>
            {record.isEncrypted && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Encrypted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {record.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {record.description}
          </p>
        )}

        {/* File Information */}
        {record.fileName && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-lg">{getFileTypeIcon(record.mimeType)}</span>
            <span className="flex-1 truncate">{record.fileName}</span>
            {record.fileSize && (
              <span className="text-xs">
                {healthRecordsService.formatFileSize(record.fileSize)}
              </span>
            )}
          </div>
        )}

        {/* Medical Data */}
        {record.medicalData && Object.keys(record.medicalData).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4" />
              Medical Data
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(record.medicalData).slice(0, 4).map(([key, value]) => (
                <div key={key} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">{key}:</span>
                  <span className="ml-1">{String(value)}</span>
                </div>
              ))}
              {Object.keys(record.medicalData).length > 4 && (
                <div className="text-xs text-gray-500 col-span-2">
                  +{Object.keys(record.medicalData).length - 4} more fields
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {record.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{record.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Record: {formatDate(record.recordDate)}</span>
          </div>
          {record.expiryDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Expires: {formatDate(record.expiryDate)}</span>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        {record.blockchainTxHash && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Blockchain Verified</span>
            </div>
            <div className="font-mono text-xs truncate mt-1">
              {record.blockchainTxHash.slice(0, 20)}...
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(record)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {record.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(record)}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(record)}
              className="text-xs"
            >
              <Share className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
          
          <div className="text-xs text-gray-400">
            {formatDate(record.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

