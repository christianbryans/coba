import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const TestDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">
      🎉 Platform Monitoring Narapidana
    </h1>
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <strong>✅ Berhasil!</strong> Development server berjalan dengan baik.
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Status Aplikasi</h2>
        <p className="text-gray-600">React + TypeScript + Tailwind CSS</p>
        <div className="mt-4">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Running
          </span>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Basic routing</li>
          <li>⚙️ Setup authentication</li>
          <li>📊 Connect dashboard</li>
          <li>🗄️ Database integration</li>
        </ul>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="*" element={<TestDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
