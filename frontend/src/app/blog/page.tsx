import React from 'react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            HealthWallet Blog
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Stay updated with the latest insights on health technology, data security, and patient empowerment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  The Future of Health Data Security
                </h2>
                <p className="text-gray-600 text-sm mb-3">December 20, 2024</p>
                <p className="text-gray-600">
                  Explore how blockchain technology is revolutionizing health data security and patient privacy.
                </p>
              </article>
              
              <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Patient Rights in the Digital Age
                </h2>
                <p className="text-gray-600 text-sm mb-3">December 18, 2024</p>
                <p className="text-gray-600">
                  Understanding your rights and how to take control of your health information online.
                </p>
              </article>
              
              <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  HIPAA Compliance in 2024
                </h2>
                <p className="text-gray-600 text-sm mb-3">December 15, 2024</p>
                <p className="text-gray-600">
                  Latest updates on HIPAA regulations and how they affect digital health platforms.
                </p>
              </article>
              
              <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Interoperability in Healthcare
                </h2>
                <p className="text-gray-600 text-sm mb-3">December 12, 2024</p>
                <p className="text-gray-600">
                  How HealthWallet is breaking down barriers between different healthcare systems.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
