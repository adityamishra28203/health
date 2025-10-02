# Hospital Portal - Standalone Application

This is a completely separate application for hospital management, independent from the patient portal.

## Architecture

```
hospital-portal/
├── frontend/           # Hospital Portal Frontend (Next.js)
├── backend/           # Hospital Portal Backend (NestJS)
├── api-gateway/       # API Gateway for hospital services
├── database/          # Database schemas and migrations
├── docs/             # Documentation
└── k8s/              # Kubernetes manifests
```

## Purpose

The Hospital Portal is designed exclusively for:
- **Hospital Administrators**: Manage hospital information, staff, settings
- **Hospital Staff**: Doctors, nurses, technicians managing patients and documents
- **Hospital IT**: System administration and user management

## Key Features

### Hospital Management
- Hospital registration and verification
- Hospital profile and settings management
- Staff user management (doctors, nurses, technicians)
- Role-based access control (RBAC)

### Patient Management (Hospital Perspective)
- Search and link patients (via ABHA ID)
- Manage patient consents and permissions
- Upload and manage patient documents
- View patient health records (with consent)

### Document Management
- Secure document upload and storage
- Document encryption and blockchain anchoring
- Document sharing with patients
- Audit trails and compliance

### Analytics & Reporting
- Hospital performance metrics
- Patient statistics and trends
- Document management reports
- Compliance and audit reports

## Security & Compliance

- **HIPAA Compliance**: Patient data protection
- **ABDM Integration**: Ayushman Bharat Digital Mission
- **Data Encryption**: AES-256 encryption for all sensitive data
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete activity tracking

## API Integration

The Hospital Portal communicates with:
- **Patient Portal APIs**: For patient data (with consent)
- **Document Service**: For secure document management
- **Blockchain Service**: For document integrity
- **Notification Service**: For alerts and updates

## No Cross-Portal Access

- Hospital staff cannot access patient portal features
- Patients cannot access hospital portal features
- All interactions happen through secure, consent-based APIs
- Complete separation of concerns and data

## Deployment

This is a standalone application that can be deployed independently:
- Separate domain/subdomain
- Independent scaling
- Separate security policies
- Independent monitoring and logging
