import dynamic from "next/dynamic";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import for heavy chart component - this is our performance test!
const Overview = dynamic(
  () =>
    import("@/components/dashboard").then((mod) => ({ default: mod.Overview })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    ),
  },
);

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Test Dashboard
          </h1>
          <p className="text-gray-600">
            Testing dynamic chart loading and performance optimizations
          </p>
        </div>

        {/* Performance Test Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">✅ Bundle Splitting</h3>
            <p className="text-gray-600 text-sm">
              Charts loaded separately from main bundle
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">✅ Dynamic Imports</h3>
            <p className="text-gray-600 text-sm">
              Heavy components load on-demand
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2">✅ CSS Optimization</h3>
            <p className="text-gray-600 text-sm">
              Tailwind purged and optimized
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Dynamic Charts Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Phase 1 Performance Optimizations Active
              </h2>
              <p className="text-gray-600 mb-6">
                Switch to the "Dynamic Charts Test" tab to see lazy loading in
                action.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-left">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold text-green-800">
                    Bundle Analysis
                  </div>
                  <div className="text-sm text-green-600">
                    Configured & Ready
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-800">
                    Code Splitting
                  </div>
                  <div className="text-sm text-blue-600">Charts Separated</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800">
                    CSS Optimized
                  </div>
                  <div className="text-sm text-purple-600">Tailwind Purged</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="font-semibold text-orange-800">Caching</div>
                  <div className="text-sm text-orange-600">Headers Added</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  📊 Dynamic Chart Loading Test
                </h2>
                <div className="text-sm text-gray-600">
                  Watch for skeleton → chart transition
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  The chart below is loaded dynamically using React.lazy and
                  dynamic imports. You should see a skeleton loader first, then
                  the chart appears.
                </p>
                <div className="border rounded-lg p-4">
                  <Overview />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Performance Benefits:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Main bundle loads without heavy chart library</li>
                    <li>• Charts load only when this tab is accessed</li>
                    <li>• Better Time to Interactive (TTI)</li>
                    <li>• Improved perceived performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Testing Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
