"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Breadcrumb, Button, Card, CardContent } from "@/components/ui";

export default function TrainingSessionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: "Self-Paced Courses" },
        ]}
      />

      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Live sessions are no longer used</h1>
          <p className="mx-auto mt-2 max-w-md text-foreground-secondary">
            This training area now supports self-paced courses with modules, lessons, quizzes, progress tracking, and certificates.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/training">View Courses</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/training/courses/new">Create Course</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
