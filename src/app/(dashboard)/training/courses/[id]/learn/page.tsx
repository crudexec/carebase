"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Clock,
  Award,
  Play,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  estimatedMinutes: number;
  orderIndex: number;
  isCompleted: boolean;
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  hasPassed: boolean;
  bestScore: number | null;
  attemptsCount: number;
  canAttempt: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
  quiz: Quiz | null;
  lessonsCompleted: number;
  totalLessons: number;
}

export default function CourseLearnPage() {
  const params = useParams();
  const _router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);

      // Fetch course with lessons
      const [courseRes, lessonsRes, quizRes] = await Promise.all([
        fetch(`/api/training/courses/${courseId}`),
        fetch(`/api/training/courses/${courseId}/lessons`),
        fetch(`/api/training/courses/${courseId}/quiz`),
      ]);

      if (!courseRes.ok) {
        throw new Error("Course not found");
      }

      const courseData = await courseRes.json();
      const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];
      const quizData = quizRes.ok ? await quizRes.json() : { quiz: null };

      // Find first incomplete lesson
      const firstIncomplete = lessonsData.findIndex((l: Lesson) => !l.isCompleted);
      if (firstIncomplete > 0) {
        setCurrentLessonIndex(firstIncomplete);
      }

      setCourse({
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        lessons: lessonsData,
        quiz: quizData.quiz,
        lessonsCompleted: lessonsData.filter((l: Lesson) => l.isCompleted).length,
        totalLessons: lessonsData.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = async () => {
    if (!course || !course.lessons[currentLessonIndex]) return;

    const lesson = course.lessons[currentLessonIndex];
    if (lesson.isCompleted) {
      // Just go to next
      goToNextLesson();
      return;
    }

    setIsMarkingComplete(true);
    try {
      const response = await fetch(
        `/api/training/courses/${courseId}/lessons/${lesson.id}/complete`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to mark lesson complete");
      }

      const data = await response.json();

      // Update local state
      setCourse((prev) => {
        if (!prev) return prev;
        const updatedLessons = [...prev.lessons];
        updatedLessons[currentLessonIndex] = {
          ...updatedLessons[currentLessonIndex],
          isCompleted: true,
        };
        return {
          ...prev,
          lessons: updatedLessons,
          lessonsCompleted: data.lessonsCompleted,
        };
      });

      toast.success("Lesson completed!");
      goToNextLesson();
    } catch {
      toast.error("Failed to mark lesson complete");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const goToNextLesson = () => {
    if (course && currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: "Course" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="text-foreground-secondary">{error || "Course not found"}</p>
            <Button asChild className="mt-4">
              <Link href="/training">Back to Training</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const allLessonsComplete = course.lessonsCompleted === course.totalLessons;
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: course.title, href: `/training/courses/${course.id}` },
          { label: "Learn" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lesson List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Course Content</span>
                <Badge variant="default" className="text-xs">
                  {course.lessonsCompleted}/{course.totalLessons}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 text-left transition-colors",
                      index === currentLessonIndex
                        ? "bg-primary/5 border-l-2 border-primary"
                        : "hover:bg-background-secondary"
                    )}
                  >
                    <div className="mt-0.5">
                      {lesson.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 text-foreground-tertiary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          index === currentLessonIndex
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-foreground-tertiary flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedMinutes} min
                      </p>
                    </div>
                  </button>
                ))}

                {/* Quiz Section */}
                {course.quiz && (
                  <div
                    className={cn(
                      "p-3 border-t-2 border-dashed",
                      allLessonsComplete
                        ? "bg-primary/5"
                        : "bg-background-secondary opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {course.quiz.hasPassed ? (
                          <Award className="h-4 w-4 text-success" />
                        ) : (
                          <FileText className="h-4 w-4 text-foreground-tertiary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Final Quiz</p>
                        {course.quiz.hasPassed ? (
                          <p className="text-xs text-success">
                            Passed ({course.quiz.bestScore}%)
                          </p>
                        ) : course.quiz.bestScore ? (
                          <p className="text-xs text-foreground-tertiary">
                            Best: {course.quiz.bestScore}%
                          </p>
                        ) : (
                          <p className="text-xs text-foreground-tertiary">
                            {allLessonsComplete
                              ? "Ready to take"
                              : "Complete all lessons first"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {currentLesson ? (
            <>
              {/* Lesson Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">
                    Lesson {currentLessonIndex + 1} of {course.lessons.length}
                  </p>
                  <h1 className="text-xl font-bold">{currentLesson.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Clock className="h-4 w-4" />
                  {currentLesson.estimatedMinutes} min read
                </div>
              </div>

              {/* Video if available */}
              {currentLesson.videoUrl && (
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <a
                        href={currentLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                      >
                        <Play className="h-12 w-12" />
                        <span>Watch Video</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lesson Content */}
              <Card>
                <CardContent className="py-6">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {isLastLesson && allLessonsComplete && course.quiz && !course.quiz.hasPassed ? (
                    <Button asChild>
                      <Link href={`/training/courses/${course.id}/quiz`}>
                        Take Quiz
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={markLessonComplete}
                      disabled={isMarkingComplete}
                    >
                      {isMarkingComplete ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : currentLesson.isCompleted ? (
                        <>
                          Next Lesson
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Complete & Continue
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  No lessons available for this course yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/training/courses/${course.id}`}>
                    Back to Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
