import React from 'react';

export default function GDPRCompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            GDPR Compliance
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              HealthWallet is fully compliant with the General Data Protection Regulation (GDPR) 
              to protect the privacy and rights of EU citizens&apos; health data.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your GDPR Rights</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Access</h3>
                <p className="text-gray-600">
                  You have the right to access and receive a copy of your personal health data.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Rectification</h3>
                <p className="text-gray-600">
                  You can request correction of inaccurate or incomplete personal data.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Erasure</h3>
                <p className="text-gray-600">
                  You have the right to request deletion of your personal data under certain circumstances.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Portability</h3>
                <p className="text-gray-600">
                  You can request to receive your data in a structured, machine-readable format.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Data Protection Measures</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Privacy by design and default</li>
              <li>Data minimization principles</li>
              <li>Purpose limitation and storage limitation</li>
              <li>Technical and organizational security measures</li>
              <li>Data Protection Impact Assessments (DPIA)</li>
              <li>Regular staff training on GDPR compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
