import React from 'react';

export default function HIPAACompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            HIPAA Compliance
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              HealthWallet is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA) 
              to ensure the security and privacy of your health information.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Compliance Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>End-to-end encryption of all health data</li>
              <li>Secure data storage with access controls</li>
              <li>Audit trails for all data access</li>
              <li>Regular security assessments and updates</li>
              <li>Staff training on privacy and security protocols</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Right to access your health information</li>
              <li>Right to request corrections to your records</li>
              <li>Right to request restrictions on data use</li>
              <li>Right to receive notice of privacy practices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
