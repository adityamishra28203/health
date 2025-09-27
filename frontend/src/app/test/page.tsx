export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black mb-4">Test Page</h1>
      <p className="text-lg text-gray-600 mb-4">This is a simple test page to verify the frontend is working.</p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800">Success!</h2>
        <p className="text-blue-600">If you can see this, the frontend is working correctly.</p>
      </div>
      <div className="mt-8">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Test Button
        </button>
      </div>
    </div>
  );
}
