# Patient Portal - Standalone Application

This is a completely separate application for patient health record management, independent from the hospital portal.

## Architecture

```
patient-portal/
├── frontend/           # Patient Portal Frontend (Next.js)
├── backend/           # Patient Portal Backend (NestJS)
├── api-gateway/       # API Gateway for patient services
├── database/          # Database schemas and migrations
├── docs/             # Documentation
└── k8s/              # Kubernetes manifests
```

## Purpose

The Patient Portal is designed exclusively for:
- **Patients**: Manage their own health records and data
- **Patient Family**: Authorized family members (with consent)
- **Patient Caregivers**: Authorized caregivers (with consent)

## Key Features

### Personal Health Management
- Personal health record (PHR) management
- Health data visualization and analytics
- Medication and treatment tracking
- Appointment scheduling and reminders

### Document Management
- Upload personal health documents
- View documents shared by hospitals
- Manage document permissions and sharing
- Secure document storage and access

### Consent Management
- Grant/revoke consent to hospitals
- Manage data sharing permissions
- Control access to health records
- Consent history and audit trails

### Hospital Integration
- Link with hospitals (via ABHA ID)
- Receive documents from hospitals
- View hospital-shared health records
- Manage hospital relationships

### Health Insights
- Health trend analysis
- Medication reminders
- Health goal tracking
- Wellness recommendations

## Security & Compliance

- **Patient Privacy**: Complete control over personal data
- **Consent Management**: Granular consent controls
- **Data Encryption**: End-to-end encryption
- **ABHA Integration**: Ayushman Bharat Health Account
- **GDPR Compliance**: Right to be forgotten, data portability

## API Integration

The Patient Portal communicates with:
- **Hospital Portal APIs**: For receiving hospital data (with consent)
- **Document Service**: For secure document management
- **Blockchain Service**: For document integrity verification
- **Notification Service**: For health reminders and alerts

## No Cross-Portal Access

- Patients cannot access hospital portal features
- Hospital staff cannot access patient portal features
- All interactions happen through secure, consent-based APIs
- Complete separation of concerns and data

## Deployment

This is a standalone application that can be deployed independently:
- Separate domain/subdomain
- Independent scaling
- Separate security policies
- Independent monitoring and logging
