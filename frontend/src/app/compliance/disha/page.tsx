import React from 'react';

export default function DISHACompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            DISHA Compliance
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              HealthWallet complies with the Digital Information Security in Healthcare Act (DISHA) 
              to ensure the security and confidentiality of health information in India.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key DISHA Provisions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Mandatory consent for data collection and processing</li>
              <li>Data localization requirements</li>
              <li>Breach notification protocols</li>
              <li>Data subject rights and access controls</li>
              <li>Penalties for non-compliance</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Our Compliance Measures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Localization</h3>
                <p className="text-gray-600">
                  All health data is stored and processed within India&apos;s borders as required by DISHA.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Consent Management</h3>
                <p className="text-gray-600">
                  Comprehensive consent tracking and management system for all data processing activities.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Breach Response</h3>
                <p className="text-gray-600">
                  Automated breach detection and notification system with 72-hour reporting requirements.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Trails</h3>
                <p className="text-gray-600">
                  Complete audit logs for all data access and processing activities as mandated by DISHA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
