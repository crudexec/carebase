"use client";

import { useEffect, useState, useRef } from "react";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Rich text editor components
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Heading2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  alpForm?: any; // Replace with proper type
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
  visitType: "first" | "second";
}

// First visit schema
const firstVisitSchema = z.object({
  formalIntakeAssessment: z.string().min(1, "This field is required"),
  personalLifestyleSummary: z.string().min(1, "This field is required"),
});

// Second visit schema
const secondVisitSchema = z.object({
  transitionalYouthChecklist: z.string().min(1, "This field is required"),
  alpGoalsAndPlan: z.string().min(1, "This field is required"),
  circleSupportMember: z.string().min(1, "This field is required"),
});

// Define types for each visit type
type FirstVisitFormValues = z.infer<typeof firstVisitSchema>;
type SecondVisitFormValues = z.infer<typeof secondVisitSchema>;

// Rich text editor component
const RichTextEditor = ({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Add a comment",
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Format commands
  const execCommand = (command: string, value = "") => {
    if (disabled) return;
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  // Apply heading format
  const applyHeading = (level: number) => {
    execCommand("formatBlock", `h${level}`);
  };

  // Editor styles
  const editorStyles = {
    container: {
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      overflow: "hidden",
    },
    editor: {
      width: "100%",
      minHeight: "200px",
      padding: "1rem",
      outline: "none",
      overflowY: "auto" as const,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.5rem",
      borderTop: "1px solid #e2e8f0",
    },
    button: {
      color: "#64748b",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0.25rem",
      borderRadius: "0.25rem",
      transition: "color 0.2s, background-color 0.2s",
    },
    buttonHover: {
      color: "#334155",
      backgroundColor: "#f1f5f9",
    },
    error: {
      color: "#ef4444",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
      paddingLeft: "1rem",
      paddingBottom: "0.5rem",
    },
  };

  // CSS for editor content
  const editorCss = `
    [contenteditable="true"]:empty:before {
      content: attr(data-placeholder);
      color: #94a3b8;
      pointer-events: none;
    }

    [contenteditable="true"]:focus {
      outline: none;
    }

    [contenteditable="true"] ul {
      list-style-type: disc;
      padding-left: 1.5rem;
    }

    [contenteditable="true"] ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
    }

    [contenteditable="true"] h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 1rem 0;
    }

    [contenteditable="true"] h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0.875rem 0;
    }

    [contenteditable="true"] h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0.75rem 0;
    }

    [contenteditable="true"] h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0.625rem 0;
    }

    [contenteditable="true"] h5 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }

    [contenteditable="true"] h6 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0.375rem 0;
    }

    [contenteditable="true"] p {
      margin: 0.5rem 0;
    }
  `;

  return (
    <div style={editorStyles.container}>
      <style>{editorCss}</style>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        style={{
          ...editorStyles.editor,
          border: error ? "1px solid #ef4444" : "none",
        }}
        onInput={handleInput}
        data-placeholder={placeholder}
      />

      {!disabled && (
        <div style={editorStyles.toolbar}>
          <button
            type="button"
            style={editorStyles.button}
            onMouseOver={(e) =>
              Object.assign(e.currentTarget.style, editorStyles.buttonHover)
            }
            onMouseOut={(e) => {
              e.currentTarget.style.color = editorStyles.button.color;
              e.currentTarget.style.backgroundColor = "";
            }}
            onClick={() => execCommand("bold")}
            aria-label="Bold"
          >
            <BoldIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            style={editorStyles.button}
            onMouseOver={(e) =>
              Object.assign(e.currentTarget.style, editorStyles.buttonHover)
            }
            onMouseOut={(e) => {
              e.currentTarget.style.color = editorStyles.button.color;
              e.currentTarget.style.backgroundColor = "";
            }}
            onClick={() => execCommand("italic")}
            aria-label="Italic"
          >
            <ItalicIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            style={editorStyles.button}
            onMouseOver={(e) =>
              Object.assign(e.currentTarget.style, editorStyles.buttonHover)
            }
            onMouseOut={(e) => {
              e.currentTarget.style.color = editorStyles.button.color;
              e.currentTarget.style.backgroundColor = "";
            }}
            onClick={() => execCommand("insertUnorderedList")}
            aria-label="Bullet List"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            style={editorStyles.button}
            onMouseOver={(e) =>
              Object.assign(e.currentTarget.style, editorStyles.buttonHover)
            }
            onMouseOut={(e) => {
              e.currentTarget.style.color = editorStyles.button.color;
              e.currentTarget.style.backgroundColor = "";
            }}
            onClick={() => execCommand("insertOrderedList")}
            aria-label="Numbered List"
          >
            <ListOrderedIcon className="w-5 h-5" />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                style={{
                  ...editorStyles.button,
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
                onMouseOver={(e) =>
                  Object.assign(e.currentTarget.style, editorStyles.buttonHover)
                }
                onMouseOut={(e) => {
                  e.currentTarget.style.color = editorStyles.button.color;
                  e.currentTarget.style.backgroundColor = "";
                }}
                aria-label="Heading"
              >
                <Heading2 className="w-5 h-5" />
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => applyHeading(level)}
                  >
                    {`Heading ${level}`}
                  </button>
                ))}
                <button
                  type="button"
                  className="px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => execCommand("formatBlock", "p")}
                >
                  Normal text
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {error && <p style={editorStyles.error}>{error}</p>}
    </div>
  );
};

const AlpVisitAssessment = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  alpForm,
  isViewing,
  isEditing,
  username = "Client",
  visitType,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  // Define form hooks outside the conditional block
  const firstVisitForm = useForm<FirstVisitFormValues>({
    resolver: zodResolver(firstVisitSchema),
    defaultValues: {
      formalIntakeAssessment: "",
      personalLifestyleSummary: "",
    },
  });

  const secondVisitForm = useForm<SecondVisitFormValues>({
    resolver: zodResolver(secondVisitSchema),
    defaultValues: {
      transitionalYouthChecklist: "",
      alpGoalsAndPlan: "",
      circleSupportMember: "",
    },
  });

  const {
    control: firstVisitControl,
    handleSubmit: firstVisitHandleSubmit,
    formState: { errors: firstVisitErrors },
    reset: firstVisitReset,
    getValues: firstVisitGetValues,
  } = firstVisitForm;

  const {
    control: secondVisitControl,
    handleSubmit: secondVisitHandleSubmit,
    formState: { errors: secondVisitErrors },
    reset: secondVisitReset,
    getValues: secondVisitGetValues,
  } = secondVisitForm;

  // Load existing data if available
  useEffect(() => {
    if (alpForm?.assessment && !isFormDisabled) {
      if (visitType === "first") {
        firstVisitReset(alpForm.assessment);
      } else {
        secondVisitReset(alpForm.assessment);
      }
    }
  }, [alpForm, isFormDisabled, visitType, firstVisitReset, secondVisitReset]);

  // Conditional rendering based on visit type
  if (visitType === "first") {
    // Handle form submission for first visit
    const onSubmit = async (data: FirstVisitFormValues) => {
      try {
        const token = localStorage.getItem("token") as string;

        // Here you would send the HTML content to your backend
        // The HTML includes all formatting tags that can be rendered later

        handleNewCompletedSection(currentIndex);
        handleChangeIndex(currentIndex + 1);
      } catch (err) {
        console.error("ERROR SUBMITTING ASSESSMENT", err);
        toast({
          variant: "destructive",
          description: "Failed to submit form",
        });
      }
    };

    // Handle draft submission for first visit
    const handleDraftSubmit = async () => {
      try {
        setIsSubmittingDraft(true);
        const token = localStorage.getItem("token") as string;
        const formData = firstVisitGetValues();

        // Save the HTML content to your backend or localStorage
        localStorage.setItem("firstVisitDraft", JSON.stringify(formData));

        toast({
          description: "Draft saved successfully",
        });
      } catch (err) {
        console.error("ERROR SAVING DRAFT", err);
        toast({
          variant: "destructive",
          description: "Failed to save draft",
        });
      } finally {
        setIsSubmittingDraft(false);
      }
    };

    return (
      <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
        <h3 className="text-[#0F172A] text-[24px] font-[600]">Assessment</h3>

        <form
          className="flex flex-col gap-7"
          onSubmit={firstVisitHandleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              Section 1: Conduct Formal Intake Assessment
            </h4>
            <Controller
              name="formalIntakeAssessment"
              control={firstVisitControl}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={firstVisitErrors.formalIntakeAssessment?.message}
                  disabled={isFormDisabled}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              Section 2: Develop Personal Lifestyle Summary
            </h4>
            <Controller
              name="personalLifestyleSummary"
              control={firstVisitControl}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={firstVisitErrors.personalLifestyleSummary?.message}
                  disabled={isFormDisabled}
                />
              )}
            />
          </div>

          <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
            <Button
              variant="light"
              onClick={() => handleChangeIndex(currentIndex - 1)}
              type="button"
              disabled={currentIndex === 1}
              data-testid="previous-section-button"
            >
              <DoubleArrowLeftIcon className="w-5 h-5" />
              Previous Section
            </Button>

            {!isFormDisabled && (
              <Button
                variant="light"
                type="button"
                data-testid="save-draft-button"
                onClick={handleDraftSubmit}
                disabled={isSubmittingDraft}
                isLoading={isSubmittingDraft}
              >
                Save Draft
              </Button>
            )}

            {isFormDisabled ? (
              <Button
                onClick={() => handleChangeIndex(currentIndex + 1)}
                data-testid="next-section-button"
              >
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            ) : (
              <Button type="submit" data-testid="next-section-button">
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </form>
      </section>
    );
  } else {
    // Handle form submission for second visit
    const onSubmit = async (data: SecondVisitFormValues) => {
      try {
        const token = localStorage.getItem("token") as string;

        // Here you would send the HTML content to your backend
        // The HTML includes all formatting tags that can be rendered later

        handleNewCompletedSection(currentIndex);
        handleChangeIndex(currentIndex + 1);
      } catch (err) {
        console.error("ERROR SUBMITTING ASSESSMENT", err);
        toast({
          variant: "destructive",
          description: "Failed to submit form",
        });
      }
    };

    // Handle draft submission for second visit
    const handleDraftSubmit = async () => {
      try {
        setIsSubmittingDraft(true);
        const token = localStorage.getItem("token") as string;
        const formData = secondVisitGetValues();

        // Save the HTML content to your backend or localStorage
        localStorage.setItem("secondVisitDraft", JSON.stringify(formData));

        toast({
          description: "Draft saved successfully",
        });
      } catch (err) {
        console.error("ERROR SAVING DRAFT", err);
        toast({
          variant: "destructive",
          description: "Failed to save draft",
        });
      } finally {
        setIsSubmittingDraft(false);
      }
    };

    return (
      <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
        <h3 className="text-[#0F172A] text-[24px] font-[600]">
          Assessment (Making It Happen Components)
        </h3>

        <form
          className="flex flex-col gap-7"
          onSubmit={secondVisitHandleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              Section 1: Summarize The Transitional Youth Checklist
            </h4>
            <Controller
              name="transitionalYouthChecklist"
              control={secondVisitControl}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={secondVisitErrors.transitionalYouthChecklist?.message}
                  disabled={isFormDisabled}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              Section 2: Agree On ALP Goals And Develop ALP Plan
            </h4>
            <Controller
              name="alpGoalsAndPlan"
              control={secondVisitControl}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={secondVisitErrors.alpGoalsAndPlan?.message}
                  disabled={isFormDisabled}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              Section 3: Coordinate Circle Of Support Member
            </h4>
            <Controller
              name="circleSupportMember"
              control={secondVisitControl}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={secondVisitErrors.circleSupportMember?.message}
                  disabled={isFormDisabled}
                />
              )}
            />
          </div>

          <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
            <Button
              variant="light"
              onClick={() => handleChangeIndex(currentIndex - 1)}
              type="button"
              disabled={currentIndex === 1}
              data-testid="previous-section-button"
            >
              <DoubleArrowLeftIcon className="w-5 h-5" />
              Previous Section
            </Button>

            {!isFormDisabled && (
              <Button
                variant="light"
                type="button"
                data-testid="save-draft-button"
                onClick={handleDraftSubmit}
                disabled={isSubmittingDraft}
                isLoading={isSubmittingDraft}
              >
                Save Draft
              </Button>
            )}

            {isFormDisabled ? (
              <Button
                onClick={() => handleChangeIndex(currentIndex + 1)}
                data-testid="next-section-button"
              >
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            ) : (
              <Button type="submit" data-testid="next-section-button">
                Next Section <DoubleArrowRightIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </form>
      </section>
    );
  }
};

export default AlpVisitAssessment;
