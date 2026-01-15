export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto animate-slideUp">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-display text-foreground mb-2">CareBase</h1>
          <p className="text-body-lg text-foreground-secondary">
            Care Agency Management System
          </p>
        </div>

        {/* Status Card */}
        <div className="card mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-body-sm text-foreground-secondary">
              System Ready
            </span>
          </div>

          <p className="text-body text-foreground-secondary mb-6">
            Streamline operations for home care service providers with
            end-to-end workflow management.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="badge-primary">Client Onboarding</span>
            <span className="badge-info">Scheduling</span>
            <span className="badge-success">Payroll</span>
            <span className="badge-warning">Incidents</span>
            <span className="badge-error">Reports</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <a href="/login" className="btn-primary">
            Sign In
          </a>
          <a href="/docs" className="btn-secondary">
            Documentation
          </a>
        </div>

        {/* Footer */}
        <p className="mt-12 text-caption text-foreground-tertiary">
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </main>
  );
}
