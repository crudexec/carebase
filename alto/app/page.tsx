import Link from "next/link";

// Temporary performance testing page to avoid redirect loops
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Healthcare App - Performance Testing
        </h1>
        <p className="text-gray-600 mb-8">
          Performance optimizations are now active. Choose a section to test:
        </p>
        <div className="space-y-4">
          <Link
            href="/test-dashboard"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 Test Dashboard (with Dynamic Charts)
          </Link>
          <Link
            href="/login"
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/patient"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Patient Management
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          ✅ Phase 1 optimizations active: Bundle splitting, dynamic imports,
          CSS optimization
        </p>
      </div>
    </div>
  );
}
