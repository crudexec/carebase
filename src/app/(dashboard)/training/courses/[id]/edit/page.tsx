"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TrainingCategory, UserRole } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileQuestion,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const CATEGORY_OPTIONS: { value: TrainingCategory; label: string }[] = [
  { value: "ORIENTATION", label: "Orientation" },
  { value: "CLINICAL_SKILLS", label: "Clinical Skills" },
  { value: "SAFETY", label: "Safety" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "INFECTION_CONTROL", label: "Infection Control" },
  { value: "PATIENT_RIGHTS", label: "Patient Rights" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "EMERGENCY_PROCEDURES", label: "Emergency Procedures" },
  { value: "SPECIALTY_CARE", label: "Specialty Care" },
  { value: "PROFESSIONAL_DEVELOPMENT", label: "Professional Development" },
  { value: "LEADERSHIP", label: "Leadership" },
  { value: "TECHNOLOGY", label: "Technology" },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "CARER", label: "Carer" },
  { value: "STAFF", label: "Staff" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "OPS_MANAGER", label: "Ops Manager" },
  { value: "CLINICAL_DIRECTOR", label: "Clinical Director" },
  { value: "ADMIN", label: "Admin" },
];

type Lesson = {
  id: string;
  title: string;
  content: string;
  moduleId: string | null;
  videoUrl: string | null;
  estimatedMinutes: number;
  orderIndex: number;
};

type CourseModule = {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isRequired: boolean;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: TrainingCategory;
  durationMinutes: number;
  ceuCredits: number;
  contactHours: number;
  learningObjectives: string[];
  materials: string[];
  requiresAssessment: boolean;
  passingScore: number | null;
  isRecurring: boolean;
  recurrenceMonths: number | null;
  prerequisites: string[];
  requiredForRoles: UserRole[];
  requiredForNewHires: boolean;
  newHireDueDays: number | null;
  isActive: boolean;
};

type QuizQuestion = {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTIPLE_SELECT";
  options: { id: string; text: string }[];
  correctIds: string[];
  explanation?: string;
  points: number;
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function emptyQuestion(): QuizQuestion {
  const first = makeId();
  const second = makeId();
  return {
    question: "",
    type: "MULTIPLE_CHOICE",
    options: [
      { id: first, text: "" },
      { id: second, text: "" },
    ],
    correctIds: [first],
    explanation: "",
    points: 1,
  };
}

export default function EditTrainingCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [unassignedLessons, setUnassignedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonMinutes, setLessonMinutes] = useState(5);
  const [lessonContent, setLessonContent] = useState("");

  const [quizTitle, setQuizTitle] = useState("Final Quiz");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState("");
  const [quizTimeLimit, setQuizTimeLimit] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes, lessonsRes, quizRes] = await Promise.all([
        fetch(`/api/training/courses/${courseId}`),
        fetch(`/api/training/courses/${courseId}/modules`),
        fetch(`/api/training/courses/${courseId}/lessons`),
        fetch(`/api/training/courses/${courseId}/quiz`),
      ]);

      if (!courseRes.ok) throw new Error("Course not found");

      const courseData = await courseRes.json();
      const moduleData = modulesRes.ok ? await modulesRes.json() : [];
      const lessonData = lessonsRes.ok ? await lessonsRes.json() : [];
      const quizData = quizRes.ok ? await quizRes.json() : { quiz: null };

      setCourse(courseData);
      setModules(moduleData);
      setUnassignedLessons(lessonData.filter((lesson: Lesson) => !lesson.moduleId));

      if (quizData.quiz) {
        setQuizTitle(quizData.quiz.title);
        setQuizDescription(quizData.quiz.description ?? "");
        setQuizPassingScore(quizData.quiz.passingScore);
        setQuizMaxAttempts(quizData.quiz.maxAttempts?.toString() ?? "");
        setQuizTimeLimit(quizData.quiz.timeLimit?.toString() ?? "");
        setQuestions(quizData.quiz.questions.map((question: QuizQuestion) => ({
          question: question.question,
          type: question.type,
          options: question.options,
          correctIds: question.correctIds ?? [],
          explanation: question.explanation ?? "",
          points: question.points,
        })));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function saveSettings() {
    if (!course) return;
    setSavingSettings(true);
    try {
      const response = await fetch(`/api/training/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, format: "ONLINE_SELF_PACED" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      const updated = await response.json();
      setCourse((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success("Course settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  async function addModule() {
    if (!moduleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    setSavingContent(true);
    try {
      const response = await fetch(`/api/training/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: moduleTitle.trim(),
          description: moduleDescription.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to add module");
      setModuleTitle("");
      setModuleDescription("");
      toast.success("Module added");
      fetchAll();
    } catch {
      toast.error("Failed to add module");
    } finally {
      setSavingContent(false);
    }
  }

  function startEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setLessonModuleId(lesson.moduleId ?? "");
    setLessonTitle(lesson.title);
    setLessonVideoUrl(lesson.videoUrl ?? "");
    setLessonMinutes(lesson.estimatedMinutes);
    setLessonContent(lesson.content);
  }

  function resetLessonForm() {
    setEditingLesson(null);
    setLessonModuleId("");
    setLessonTitle("");
    setLessonVideoUrl("");
    setLessonMinutes(5);
    setLessonContent("");
  }

  async function saveLesson() {
    if (!lessonTitle.trim() || !lessonContent.trim()) {
      toast.error("Lesson title and content are required");
      return;
    }

    setSavingContent(true);
    try {
      const response = await fetch(
        editingLesson
          ? `/api/training/courses/${courseId}/lessons/${editingLesson.id}`
          : `/api/training/courses/${courseId}/lessons`,
        {
          method: editingLesson ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            content: lessonContent.trim(),
            moduleId: lessonModuleId || null,
            videoUrl: lessonVideoUrl.trim() || null,
            estimatedMinutes: lessonMinutes,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save lesson");
      }

      toast.success(editingLesson ? "Lesson updated" : "Lesson added");
      resetLessonForm();
      fetchAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save lesson");
    } finally {
      setSavingContent(false);
    }
  }

  async function deleteLesson(lessonId: string) {
    setSavingContent(true);
    try {
      const response = await fetch(`/api/training/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete lesson");
      toast.success("Lesson deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setSavingContent(false);
    }
  }

  async function updateModuleOrder(module: CourseModule, currentIndex: number, nextIndex: number) {
    const target = modules[nextIndex];
    if (!target) return;

    await Promise.all([
      fetch(`/api/training/courses/${courseId}/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: target.orderIndex }),
      }),
      fetch(`/api/training/courses/${courseId}/modules/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: module.orderIndex }),
      }),
    ]);

    setModules((prev) => {
      const next = [...prev];
      next[currentIndex] = target;
      next[nextIndex] = module;
      return next;
    });
    fetchAll();
  }

  async function deleteModule(moduleId: string) {
    setSavingContent(true);
    try {
      const response = await fetch(`/api/training/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete module");
      toast.success("Module deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete module");
    } finally {
      setSavingContent(false);
    }
  }

  async function updateLessonOrder(lesson: Lesson, direction: -1 | 1) {
    const siblings = lesson.moduleId
      ? modules.find((module) => module.id === lesson.moduleId)?.lessons ?? []
      : unassignedLessons;
    const currentIndex = siblings.findIndex((item) => item.id === lesson.id);
    const target = siblings[currentIndex + direction];
    if (!target) return;

    await Promise.all([
      fetch(`/api/training/courses/${courseId}/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: target.orderIndex }),
      }),
      fetch(`/api/training/courses/${courseId}/lessons/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: lesson.orderIndex }),
      }),
    ]);
    fetchAll();
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((question, i) => (
      i === index ? { ...question, ...patch } : question
    )));
  }

  function updateOption(questionIndex: number, optionId: string, text: string) {
    setQuestions((prev) => prev.map((question, index) => {
      if (index !== questionIndex) return question;
      return {
        ...question,
        options: question.options.map((option) => (
          option.id === optionId ? { ...option, text } : option
        )),
      };
    }));
  }

  function toggleCorrect(questionIndex: number, optionId: string) {
    setQuestions((prev) => prev.map((question, index) => {
      if (index !== questionIndex) return question;
      if (question.type === "MULTIPLE_SELECT") {
        const selected = question.correctIds.includes(optionId)
          ? question.correctIds.filter((id) => id !== optionId)
          : [...question.correctIds, optionId];
        return { ...question, correctIds: selected };
      }
      return { ...question, correctIds: [optionId] };
    }));
  }

  async function saveQuiz() {
    const cleanedQuestions = questions.map((question) => ({
      ...question,
      question: question.question.trim(),
      options: question.options.map((option) => ({ ...option, text: option.text.trim() })),
      explanation: question.explanation?.trim() || undefined,
    }));

    if (cleanedQuestions.some((question) => !question.question || question.options.some((option) => !option.text) || question.correctIds.length === 0)) {
      toast.error("Every quiz question needs text, options, and a correct answer");
      return;
    }

    setSavingQuiz(true);
    try {
      const response = await fetch(`/api/training/courses/${courseId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle.trim() || "Final Quiz",
          description: quizDescription.trim() || undefined,
          passingScore: quizPassingScore,
          maxAttempts: quizMaxAttempts ? Number(quizMaxAttempts) : null,
          timeLimit: quizTimeLimit ? Number(quizTimeLimit) : null,
          questions: cleanedQuestions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save quiz");
      }

      setCourse((prev) => prev ? { ...prev, requiresAssessment: true, passingScore: quizPassingScore } : prev);
      toast.success("Quiz saved");
      fetchAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save quiz");
    } finally {
      setSavingQuiz(false);
    }
  }

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-foreground-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Training", href: "/training" },
          { label: course.title, href: `/training/courses/${course.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Training Course</h1>
          <p className="mt-1 text-foreground-secondary">
            Manage settings, modules, lessons, and quiz content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/training/courses/${course.id}/learn`}>Preview</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/training/courses/${course.id}`}>Done</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={course.description ?? ""} onChange={(e) => setCourse({ ...course, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={course.category} onChange={(e) => setCourse({ ...course, category: e.target.value as TrainingCategory })}>
                    {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery</label>
                  <div className="rounded-md border bg-background-secondary px-3 py-2 text-sm font-medium">
                    Self-paced online course
                  </div>
                </div>
                <InputBlock label="Duration Minutes" value={course.durationMinutes} onChange={(value) => setCourse({ ...course, durationMinutes: value })} />
                <InputBlock label="CEU Credits" value={course.ceuCredits} onChange={(value) => setCourse({ ...course, ceuCredits: value })} step={0.5} />
                <InputBlock label="Contact Hours" value={course.contactHours} onChange={(value) => setCourse({ ...course, contactHours: value })} step={0.5} />
              </div>

              <div className="space-y-3">
                <Checkbox
                  checked={course.requiredForNewHires}
                  onChange={(e) => setCourse({ ...course, requiredForNewHires: e.target.checked })}
                  label="Required for new hires"
                />
                {course.requiredForNewHires && (
                  <InputBlock label="Due within days" value={course.newHireDueDays ?? 30} onChange={(value) => setCourse({ ...course, newHireDueDays: value })} />
                )}
                <Checkbox
                  checked={course.isRecurring}
                  onChange={(e) => setCourse({ ...course, isRecurring: e.target.checked })}
                  label="Recurring training"
                />
                {course.isRecurring && (
                  <InputBlock label="Recurrence months" value={course.recurrenceMonths ?? 12} onChange={(value) => setCourse({ ...course, recurrenceMonths: value })} />
                )}
                <Checkbox
                  checked={course.isActive}
                  onChange={(e) => setCourse({ ...course, isActive: e.target.checked })}
                  label="Active"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Required for Roles</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const selected = course.requiredForRoles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setCourse({
                          ...course,
                          requiredForRoles: selected
                            ? course.requiredForRoles.filter((item) => item !== role.value)
                            : [...course.requiredForRoles, role.value],
                        })}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${selected ? "bg-primary text-white" : "bg-background-secondary text-foreground-secondary"}`}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Modules & Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                <Input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title" />
                <Input value={moduleDescription} onChange={(e) => setModuleDescription(e.target.value)} placeholder="Optional description" />
                <Button onClick={addModule} disabled={savingContent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>

              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="rounded-lg border">
                    <div className="flex items-center justify-between gap-3 border-b p-3">
                      <div>
                        <p className="font-medium">{module.title}</p>
                        {module.description && <p className="text-sm text-foreground-secondary">{module.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateModuleOrder(module, index, index - 1)} title="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateModuleOrder(module, index, index + 1)} title="Move down">
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded text-error hover:bg-error/10" onClick={() => deleteModule(module.id)} title="Delete module">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {module.lessons.length ? module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3">
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-foreground-tertiary">{lesson.estimatedMinutes} min</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateLessonOrder(lesson, -1)} title="Move lesson up">
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateLessonOrder(lesson, 1)} title="Move lesson down">
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => startEditLesson(lesson)}>Edit</Button>
                            <button className="p-1.5 rounded text-error hover:bg-error/10" onClick={() => deleteLesson(lesson.id)} title="Delete lesson">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <p className="p-3 text-sm text-foreground-tertiary">No lessons in this module yet.</p>
                      )}
                    </div>
                  </div>
                ))}

                {unassignedLessons.length > 0 && (
                  <div className="rounded-lg border">
                    <div className="border-b p-3">
                      <p className="font-medium">Unassigned Lessons</p>
                    </div>
                    <div className="divide-y">
                      {unassignedLessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateLessonOrder(lesson, -1)} title="Move lesson up">
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-background-secondary" onClick={() => updateLessonOrder(lesson, 1)} title="Move lesson down">
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => startEditLesson(lesson)}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border bg-background-secondary p-4 space-y-3">
                <h3 className="font-medium">{editingLesson ? "Edit Lesson" : "Add Lesson"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title" />
                  <Select value={lessonModuleId} onChange={(e) => setLessonModuleId(e.target.value)}>
                    <option value="">No module</option>
                    {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
                  </Select>
                  <Input value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)} placeholder="Video URL (optional)" />
                  <Input type="number" min={1} value={lessonMinutes} onChange={(e) => setLessonMinutes(Number(e.target.value))} />
                </div>
                <Textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} placeholder="Lesson content. HTML is supported." rows={8} />
                <div className="flex justify-end gap-2">
                  {editingLesson && <Button variant="ghost" onClick={resetLessonForm}>Cancel Edit</Button>}
                  <Button onClick={saveLesson} disabled={savingContent}>
                    {savingContent ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {editingLesson ? "Update Lesson" : "Add Lesson"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Quiz Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Quiz title" />
              <Textarea value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Quiz description" rows={2} />
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" min={0} max={100} value={quizPassingScore} onChange={(e) => setQuizPassingScore(Number(e.target.value))} title="Passing score" />
                <Input type="number" min={1} value={quizMaxAttempts} onChange={(e) => setQuizMaxAttempts(e.target.value)} placeholder="Attempts" />
                <Input type="number" min={1} value={quizTimeLimit} onChange={(e) => setQuizTimeLimit(e.target.value)} placeholder="Minutes" />
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Question {index + 1}</Badge>
                      {questions.length > 1 && (
                        <button className="text-error" onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Textarea value={question.question} onChange={(e) => updateQuestion(index, { question: e.target.value })} placeholder="Question text" rows={2} />
                    <Select value={question.type} onChange={(e) => updateQuestion(index, { type: e.target.value as QuizQuestion["type"], correctIds: [] })}>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="MULTIPLE_SELECT">Multiple Select</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </Select>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Checkbox checked={question.correctIds.includes(option.id)} onChange={() => toggleCorrect(index, option.id)} />
                          <Input value={option.text} onChange={(e) => updateOption(index, option.id, e.target.value)} placeholder="Answer option" />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuestion(index, { options: [...question.options, { id: makeId(), text: "" }] })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                    <Textarea value={question.explanation ?? ""} onChange={(e) => updateQuestion(index, { explanation: e.target.value })} placeholder="Explanation shown after answer review" rows={2} />
                  </div>
                ))}
              </div>

              <Button variant="secondary" className="w-full" onClick={() => setQuestions([...questions, emptyQuestion()])}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
              <Button className="w-full" onClick={saveQuiz} disabled={savingQuiz}>
                {savingQuiz ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
