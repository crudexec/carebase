"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md text-center">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-8" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
