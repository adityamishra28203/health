import React from 'react';

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Press & Media
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to the HealthWallet press center. Find our latest news, press releases, and media resources.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Latest News</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  HealthWallet Launches Revolutionary Blockchain Health Platform
                </h3>
                <p className="text-gray-600 text-sm mb-2">December 15, 2024</p>
                <p className="text-gray-600">
                  HealthWallet introduces the world&apos;s first blockchain-based health data management platform, 
                  ensuring unprecedented security and patient control.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Partnership with Leading Healthcare Providers
                </h3>
                <p className="text-gray-600 text-sm mb-2">December 10, 2024</p>
                <p className="text-gray-600">
                  HealthWallet announces strategic partnerships with major healthcare systems to expand 
                  patient data accessibility and security.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Media Kit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="border rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-2">Company Logo</h3>
                <p className="text-gray-600 text-sm">Download high-resolution logos</p>
              </button>
              <button className="border rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-2">Press Photos</h3>
                <p className="text-gray-600 text-sm">Executive and product photos</p>
              </button>
              <button className="border rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-2">Fact Sheet</h3>
                <p className="text-gray-600 text-sm">Company overview and key statistics</p>
              </button>
              <button className="border rounded-lg p-4 hover:bg-gray-50 transition-colors text-left">
                <h3 className="font-medium text-gray-900 mb-2">Contact Info</h3>
                <p className="text-gray-600 text-sm">Media contact information</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
