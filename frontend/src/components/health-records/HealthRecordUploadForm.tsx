'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Tag, 
  Shield, 
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { healthRecordsService, CreateHealthRecordDto } from '@/lib/health-records';
import { toast } from 'sonner';

interface HealthRecordUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RECORD_TYPES = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'other', label: 'Other' },
];

export default function HealthRecordUploadForm({ onSuccess, onCancel }: HealthRecordUploadFormProps) {
  const [formData, setFormData] = useState<CreateHealthRecordDto>({
    title: '',
    description: '',
    type: '',
    recordDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    tags: [],
    medicalData: {},
    consentGiven: false,
    consentExpiry: '',
    isEncrypted: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [newMedicalDataKey, setNewMedicalDataKey] = useState('');
  const [newMedicalDataValue, setNewMedicalDataValue] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Record type is required';
    }

    if (!formData.recordDate) {
      newErrors.recordDate = 'Record date is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    if (!formData.consentGiven) {
      newErrors.consent = 'You must give consent to upload health records';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateHealthRecordDto, value: string | string[] | Record<string, unknown> | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 10MB'
        }));
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/dicom',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          file: 'Only PDF, images, DICOM, and text files are allowed'
        }));
        return;
      }

      setSelectedFile(file);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const addMedicalData = () => {
    if (newMedicalDataKey.trim() && newMedicalDataValue.trim()) {
      handleInputChange('medicalData', {
        ...formData.medicalData,
        [newMedicalDataKey.trim()]: newMedicalDataValue.trim()
      });
      setNewMedicalDataKey('');
      setNewMedicalDataValue('');
    }
  };

  const removeMedicalData = (key: string) => {
    const newMedicalData = { ...formData.medicalData };
    delete newMedicalData[key];
    handleInputChange('medicalData', newMedicalData);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedFile) {
      return;
    }

    setIsUploading(true);

    try {
      await healthRecordsService.uploadHealthRecord(selectedFile, formData);
      toast.success('Health record uploaded successfully!');
      onSuccess();
    } catch (error: unknown) {
      console.error('Error uploading health record:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload health record');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <Card className="card-enhanced animate-slide-in-bottom">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Upload className="h-6 w-6" />
            Upload Health Record
          </CardTitle>
          <CardDescription className="text-base">
            Upload and manage your health records with secure storage and verification
          </CardDescription>
        </CardHeader>
        <CardContent className="form-container">
          {/* File Upload */}
          <div className="form-section">
            <div className="form-field-enhanced">
              <Label htmlFor="file" className="text-sm font-semibold">Health Record File *</Label>
              <div className="flex flex-col gap-4 mt-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.dcm,.txt"
                  className="w-full"
                />
                {selectedFile && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium flex-1">{selectedFile.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {healthRecordsService.formatFileSize(selectedFile.size)}
                    </Badge>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-sm text-destructive mt-2">{errors.file}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, JPG, PNG, TIFF, DICOM, TXT (Max 10MB)
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-field-enhanced">
                <Label htmlFor="title" className="text-sm font-semibold">Record Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Blood Test Report"
                  className={`mt-1 ${errors.title ? 'border-destructive' : ''}`}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-2">{errors.title}</p>
                )}
              </div>

              <div className="form-field-enhanced">
                <Label htmlFor="type" className="text-sm font-semibold">Record Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className={`mt-1 ${errors.type ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive mt-2">{errors.type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <div className="form-field-enhanced">
              <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the health record..."
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">Optional</p>
            </div>
          </div>

          {/* Dates */}
          <div className="form-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-field-enhanced">
                <Label htmlFor="recordDate" className="text-sm font-semibold">Record Date *</Label>
                <Input
                  id="recordDate"
                  type="date"
                  value={formData.recordDate}
                  onChange={(e) => handleInputChange('recordDate', e.target.value)}
                  className={`mt-1 ${errors.recordDate ? 'border-destructive' : ''}`}
                />
                {errors.recordDate && (
                  <p className="text-sm text-destructive mt-2">{errors.recordDate}</p>
                )}
              </div>

              <div className="form-field-enhanced">
                <Label htmlFor="expiryDate" className="text-sm font-semibold">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2">Optional</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <div className="form-field-enhanced">
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag} className="btn-enhanced">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Optional</p>
            </div>
          </div>

          {/* Medical Data */}
          <div className="form-section">
            <div className="form-field-enhanced">
              <Label className="text-sm font-semibold">Medical Data</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <Input
                  value={newMedicalDataKey}
                  onChange={(e) => setNewMedicalDataKey(e.target.value)}
                  placeholder="Key (e.g., Blood Pressure)"
                />
                <Input
                  value={newMedicalDataValue}
                  onChange={(e) => setNewMedicalDataValue(e.target.value)}
                  placeholder="Value (e.g., 120/80)"
                />
                <Button type="button" variant="outline" onClick={addMedicalData} className="btn-enhanced">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.medicalData && Object.keys(formData.medicalData).length > 0 && (
                <div className="space-y-3 mt-4">
                  {Object.entries(formData.medicalData).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-sm">{key}:</span>
                      <span className="text-sm">{String(value)}</span>
                      <button
                        type="button"
                        onClick={() => removeMedicalData(key)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Optional</p>
            </div>
          </div>

          {/* Consent */}
          <div className="form-section">
            <div className="space-y-6">
              <div className="form-field-enhanced">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentGiven"
                    checked={formData.consentGiven}
                    onChange={(e) => handleInputChange('consentGiven', e.target.checked)}
                    className="mt-1 rounded border-border"
                  />
                  <div className="flex-1">
                    <Label htmlFor="consentGiven" className="text-sm font-semibold">
                      I give consent to store and process this health record *
                    </Label>
                  </div>
                </div>
                {errors.consent && (
                  <p className="text-sm text-destructive mt-2">{errors.consent}</p>
                )}
              </div>

              <div className="form-field-enhanced">
                <Label htmlFor="consentExpiry" className="text-sm font-semibold">Consent Expiry Date</Label>
                <Input
                  id="consentExpiry"
                  type="date"
                  value={formData.consentExpiry || ''}
                  onChange={(e) => handleInputChange('consentExpiry', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2">Optional</p>
              </div>

              <div className="form-field-enhanced">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="isEncrypted"
                    checked={formData.isEncrypted}
                    onChange={(e) => handleInputChange('isEncrypted', e.target.checked)}
                    className="mt-1 rounded border-border"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isEncrypted" className="text-sm font-semibold">
                      Encrypt this record for enhanced security
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="form-section">
            <Alert className="border-primary/20 bg-primary/5">
              <Shield className="h-5 w-5 text-primary" />
              <AlertDescription className="text-sm">
                Your health records are encrypted and stored securely. Only authorized healthcare providers 
                can access your records with your explicit consent.
              </AlertDescription>
            </Alert>
          </div>

          {/* Actions */}
          <div className="form-section pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button variant="outline" onClick={onCancel} disabled={isUploading} className="btn-enhanced" size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isUploading} className="btn-enhanced" size="lg">
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
