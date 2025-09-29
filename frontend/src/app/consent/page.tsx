import React from 'react';

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Data Consent Management
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Manage your data sharing preferences and consent settings to control how your health information is used.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consent Options</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Medical Research</h3>
                <p className="text-gray-600 mb-3">
                  Allow your anonymized health data to be used for medical research and public health initiatives.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Manage Settings
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Insurance Sharing</h3>
                <p className="text-gray-600 mb-3">
                  Share relevant health information with your insurance provider for claim processing.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Manage Settings
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Access</h3>
                <p className="text-gray-600 mb-3">
                  Allow emergency medical personnel to access critical health information in life-threatening situations.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Manage Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
