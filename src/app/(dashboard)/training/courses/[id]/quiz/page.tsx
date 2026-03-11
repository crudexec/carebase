"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  RotateCcw,
  ChevronRight,
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

interface QuizQuestion {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTIPLE_SELECT";
  options: { id: string; text: string }[];
  points: number;
  correctIds?: string[];
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  maxAttempts: number | null;
  timeLimit: number | null;
  questions: QuizQuestion[];
  hasPassed: boolean;
  bestScore: number | null;
  attemptsCount: number;
  canAttempt: boolean;
}

interface QuizResult {
  questionId: string;
  isCorrect: boolean;
  selectedIds: string[];
  correctIds: string[];
  explanation: string | null;
}

interface AttemptResult {
  attempt: {
    id: string;
    score: number;
    passed: boolean;
    passingScore: number;
  };
  results: QuizResult[];
  totalPoints: number;
  earnedPoints: number;
}

export default function QuizPage() {
  const params = useParams();
  const _router = useRouter();
  const courseId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showingResults, setShowingResults] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);

      const [courseRes, quizRes] = await Promise.all([
        fetch(`/api/training/courses/${courseId}`),
        fetch(`/api/training/courses/${courseId}/quiz`),
      ]);

      if (!courseRes.ok) {
        throw new Error("Course not found");
      }

      const courseData = await courseRes.json();
      setCourseTitle(courseData.title);

      if (!quizRes.ok) {
        throw new Error("Failed to load quiz");
      }

      const quizData = await quizRes.json();
      if (!quizData.quiz) {
        throw new Error("No quiz available for this course");
      }

      setQuiz(quizData.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowingResults(false);
  };

  const selectAnswer = (questionId: string, optionId: string, isMultiSelect: boolean) => {
    setAnswers((prev) => {
      if (isMultiSelect) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        }
        return { ...prev, [questionId]: [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedIds: answers[q.id] || [],
      }));

      const response = await fetch(`/api/training/courses/${courseId}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await response.json();
      setResult(data);
      setShowingResults(true);

      if (data.attempt.passed) {
        toast.success("Congratulations! You passed the quiz!");
      } else {
        toast.error(`You scored ${data.attempt.score}%. Try again!`);
      }
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: "Quiz" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-error mb-4" />
            <p className="text-foreground-secondary">{error || "Quiz not found"}</p>
            <Button asChild className="mt-4">
              <Link href="/training">Back to Training</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results View
  if (showingResults && result) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: courseTitle, href: `/training/courses/${courseId}` },
            { label: "Quiz Results" },
          ]}
        />

        {/* Score Card */}
        <Card className={result.attempt.passed ? "border-success" : "border-error"}>
          <CardContent className="py-8 text-center">
            <div
              className={cn(
                "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                result.attempt.passed ? "bg-success/10" : "bg-error/10"
              )}
            >
              {result.attempt.passed ? (
                <Award className="h-10 w-10 text-success" />
              ) : (
                <XCircle className="h-10 w-10 text-error" />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {result.attempt.passed ? "Congratulations!" : "Not quite there"}
            </h1>
            <p className="text-4xl font-bold mb-2">
              {result.attempt.score}%
            </p>
            <p className="text-foreground-secondary">
              {result.earnedPoints} / {result.totalPoints} points
            </p>
            <p className="text-sm text-foreground-tertiary mt-2">
              Passing score: {result.attempt.passingScore}%
            </p>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Review Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((question, index) => {
              const questionResult = result.results.find(
                (r) => r.questionId === question.id
              );
              return (
                <div
                  key={question.id}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    questionResult?.isCorrect
                      ? "border-success/30 bg-success/5"
                      : "border-error/30 bg-error/5"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {questionResult?.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                    </div>
                  </div>

                  <div className="ml-8 space-y-2">
                    {question.options.map((option) => {
                      const isSelected = questionResult?.selectedIds.includes(option.id);
                      const isCorrect = questionResult?.correctIds.includes(option.id);

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "p-2 rounded text-sm",
                            isCorrect && "bg-success/10 text-success",
                            isSelected && !isCorrect && "bg-error/10 text-error",
                            !isSelected && !isCorrect && "text-foreground-secondary"
                          )}
                        >
                          {isCorrect && <CheckCircle className="h-3.5 w-3.5 inline mr-1.5" />}
                          {isSelected && !isCorrect && (
                            <XCircle className="h-3.5 w-3.5 inline mr-1.5" />
                          )}
                          {option.text}
                        </div>
                      );
                    })}

                    {questionResult?.explanation && (
                      <p className="text-sm text-foreground-secondary mt-2 italic">
                        {questionResult.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {!result.attempt.passed && quiz.canAttempt && (
            <Button onClick={startQuiz}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href={`/training/courses/${courseId}`}>
              Back to Course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!quizStarted) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Training", href: "/training" },
            { label: courseTitle, href: `/training/courses/${courseId}` },
            { label: "Quiz" },
          ]}
        />

        <Card>
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-foreground-secondary mb-6">{quiz.description}</p>
            )}

            <div className="flex justify-center gap-6 mb-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{quiz.questions.length}</p>
                <p className="text-foreground-secondary">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{quiz.passingScore}%</p>
                <p className="text-foreground-secondary">To Pass</p>
              </div>
              {quiz.timeLimit && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{quiz.timeLimit}</p>
                  <p className="text-foreground-secondary">Minutes</p>
                </div>
              )}
            </div>

            {quiz.hasPassed ? (
              <div className="mb-6 p-4 rounded-lg bg-success/10 text-success">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                You&apos;ve already passed this quiz with {quiz.bestScore}%
              </div>
            ) : quiz.bestScore ? (
              <div className="mb-6 p-4 rounded-lg bg-warning/10 text-warning">
                Your best score: {quiz.bestScore}% (Attempts: {quiz.attemptsCount})
              </div>
            ) : null}

            {!quiz.canAttempt ? (
              <div className="p-4 rounded-lg bg-error/10 text-error">
                Maximum attempts reached
              </div>
            ) : (
              <Button size="lg" onClick={startQuiz}>
                {quiz.attemptsCount > 0 ? "Retake Quiz" : "Start Quiz"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Taking View
  const question = quiz.questions[currentQuestion];
  const isMultiSelect = question.type === "MULTIPLE_SELECT";
  const selectedAnswers = answers[question.id] || [];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: courseTitle, href: `/training/courses/${courseId}` },
          { label: "Quiz" },
        ]}
      />

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-foreground-secondary whitespace-nowrap">
          {currentQuestion + 1} / {quiz.questions.length}
        </span>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="default">
              Question {currentQuestion + 1}
            </Badge>
            <span className="text-sm text-foreground-secondary">
              {question.points} point{question.points !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>

          {isMultiSelect && (
            <p className="text-sm text-foreground-secondary">
              Select all that apply
            </p>
          )}

          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => selectAnswer(question.id, option.id, isMultiSelect)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-foreground-tertiary"
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <p className="text-sm text-foreground-secondary">
          {answeredCount} of {quiz.questions.length} answered
        </p>

        {isLastQuestion ? (
          <Button
            onClick={submitQuiz}
            disabled={isSubmitting || answeredCount < quiz.questions.length}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={!selectedAnswers.length}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
