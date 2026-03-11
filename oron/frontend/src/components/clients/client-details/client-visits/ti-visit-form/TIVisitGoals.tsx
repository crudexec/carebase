"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import FormBanner from "@/components/banner/FormBanner";
import FormInput from "@/components/input-fields/FormInput";
import FormSelect from "@/components/input-fields/FormSelect";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { MultiSelect } from "@/components/input-fields/MultiSelect";
import { SingleRespiteForm } from "@/types/Respite";
import { useRouter } from "next/navigation";
import moment from "moment";
import { retrieveClientTreatmentPlanGoals } from "@/use-cases/clients";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

const locationOptions = [
  { label: "At TI Center", value: "ti_center" },
  { label: "In Community", value: "community" },
];

const communityLocationOptions = [
  { label: "Mall", value: "mall" },
  { label: "Park", value: "park" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Library", value: "library" },
  { label: "Store", value: "store" },
];

const circumstanceOptions = [
  { label: "On arrival at TI Center", value: "arrival" },
  { label: "During snack time", value: "snack_time" },
  // Add more options as needed
];

const clientResponseOptions = [
  { label: "Calm", value: "calm" },
  { label: "Agitated", value: "agitated" },
  { label: "Cooperative", value: "cooperative" },
  { label: "Resistant", value: "resistant" },
];

const consequentlyClientOptions = [
  { label: "Completed task successfully", value: "completed_successfully" },
  { label: "Needed additional support", value: "needed_support" },
  { label: "Refused to participate", value: "refused" },
];

const clientRewardOptions = [
  { label: "Verbal praise", value: "verbal_praise" },
  { label: "Preferred activity", value: "preferred_activity" },
  { label: "Token reward", value: "token" },
  { label: "Break time", value: "break" },
];

const goalsSchema = z.object({
  forms: z.array(
    z.object({
      location: z.string().min(1, "Please select the location"),
      communityLocation: z.string().optional(),
      circumstances: z
        .array(z.string())
        .min(1, "Please select at least one circumstance"),
      totalTime: z.string().min(1, "Please enter the total time"),
      clientResponse: z.string().min(1, "Please select client's response"),
      consequentlyClient: z
        .string()
        .min(1, "Please select consequently client"),
      clientReward: z.string().min(1, "Please select client's reward"),
      comments: z.string().optional(),
      tableData: z.array(
        z.object({
          taskAnalysis: z.string(),
          response: z.string(),
          prompt: z.string(),
          opportunities: z.string(),
          success: z.string(),
        })
      ),
    })
  ),
});

type GoalsFormData = z.infer<typeof goalsSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  clientId: string;
  admin?: boolean;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

interface TableData {
  id: string;
  taskAnalysis: string;
  response: string;
  prompt: string;
  opportunities: string;
  success: string;
}

const responseOptions = [
  "Independent",
  "Verbal Prompt",
  "Gestural Prompt",
  "Partial Physical",
  "Full Physical",
  "N/A",
];

const promptOptions = [
  "Verbal",
  "Gestural",
  "Partial Physical",
  "Full Physical",
  "N/A",
];

const opportunityOptions = ["1", "2", "3", "4", "5", "N/A"];
const successOptions = ["Yes", "No", "N/A"];

const TIVisitGoals = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  clientId,
  admin,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const router = useRouter();
  const token = localStorage.getItem("token") as string;
  const { data: treatmentPlanGoals, isLoading: isLoadingTreatmentPlanGoals } =
    useQuery({
      queryKey: ["tiTreatmentPlanGoals", clientId],
      queryFn: async () =>
        retrieveClientTreatmentPlanGoals(token, clientId, "ti"),
    });
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      forms: [
        {
          location: "",
          communityLocation: "",
          circumstances: [],
          totalTime: "",
          clientResponse: "",
          consequentlyClient: "",
          clientReward: "",
          comments: "",
          tableData: Array(4).fill({
            taskAnalysis: "Stop activity at the sound of fire alarm",
            response: "",
            prompt: "",
            opportunities: "",
            success: "",
          }),
        },
      ],
    },
  });

  const onSubmit = async (data: GoalsFormData) => {
    try {
      toast({
        variant: "success",
        description: `${username} on ${moment().format(
          "dddd, MMMM Do, YYYY"
        )} successfully submitted.`,
      });
      router.push(
        admin ? `/admin/clients/${clientId}` : `/clients/${clientId}`
      );
    } catch (err) {
      console.error("ERROR SUBMITTING GOALS", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      // TODO: Implement draft submission
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

  if (isLoadingTreatmentPlanGoals) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <FormBanner
        text={`Please provide information on how you implemented the goals as identified in ${username} individualized treatment plan. Please indicate whether ${username} participated in the task(s); the most intense prompt you gave ${username} for the task to develop the identified skill and the number of times ${username} was successful out of the opportunities provided for each task. Select N/A for tasks not performed`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {watch("forms").map((formData, formIndex) => (
          <div
            key={formIndex}
            className="flex flex-col gap-7 h-fit w-full border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
          >
            <h3 className="text-[#0F172A] text-[24px] font-[600]">
              Goal {formIndex + 1}
            </h3>
            <p className="text-[#475467]">
              During a safety emergency, {username} will exit the home within 3
              minutes to a designated location (from unable) to model prompts in
              completing this task independently on a bi-monthly basis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Target Skill:
                </h4>
                <p className="text-[#475467]">[Target Skill]</p>
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Short Term Objective:
                </h4>
                <p className="text-[#475467]">[Short Term Objective]</p>
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Reinforcers:
                </h4>
                <p className="text-[#475467]">[Reinforcers]</p>
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Materials:
                </h4>
                <p className="text-[#475467]">[Materials]</p>
              </div>
            </div>

            <div>
              <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                Implementation Procedure:
              </h4>
              <p className="text-[#475467]">[Implementation procedure]</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Where Was This Activity Practiced?
                </h4>
                <Controller
                  name={`forms.${formIndex}.location`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      labelText=""
                      placeholder="Please select"
                      selectContent={locationOptions}
                      isError={!!errors.forms?.[formIndex]?.location}
                      errorMessage={
                        errors.forms?.[formIndex]?.location?.message
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Specify Where In The Community
                </h4>
                <Controller
                  name={`forms.${formIndex}.communityLocation`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      labelText=""
                      placeholder="Select options"
                      selectContent={communityLocationOptions}
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                Indicate Circumstances/ Antecedant Leading To Activity
              </h4>
              <Controller
                name={`forms.${formIndex}.circumstances`}
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    labelText=""
                    placeholder="Select circumstances"
                    options={circumstanceOptions.map((opt) => opt.label)}
                    selected={field.value}
                    onChange={field.onChange}
                    isError={!!errors.forms?.[formIndex]?.circumstances}
                    errorMessage={
                      errors.forms?.[formIndex]?.circumstances?.message
                    }
                    disabled={isFormDisabled}
                  />
                )}
              />
            </div>

            <div className="relative w-full border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Steps</TableHead>
                    <TableHead>Task Analysis</TableHead>
                    <TableHead>Response?</TableHead>
                    <TableHead>Prompt Used</TableHead>
                    <TableHead>Opportunities</TableHead>
                    <TableHead>Success</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="text-center">
                        {rowIndex + 1}
                      </TableCell>
                      <TableCell>{row.taskAnalysis}</TableCell>
                      <TableCell>
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={responseOptions.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                          value={row.response}
                          onValueChange={(value) => {
                            const newTableData = [...formData.tableData];
                            newTableData[rowIndex].response = value;
                            setValue(
                              `forms.${formIndex}.tableData`,
                              newTableData
                            );
                          }}
                          disabled={isFormDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={promptOptions.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                          value={row.prompt}
                          onValueChange={(value) => {
                            const newTableData = [...formData.tableData];
                            newTableData[rowIndex].prompt = value;
                            setValue(
                              `forms.${formIndex}.tableData`,
                              newTableData
                            );
                          }}
                          disabled={isFormDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={opportunityOptions.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                          value={row.opportunities}
                          onValueChange={(value) => {
                            const newTableData = [...formData.tableData];
                            newTableData[rowIndex].opportunities = value;
                            setValue(
                              `forms.${formIndex}.tableData`,
                              newTableData
                            );
                          }}
                          disabled={isFormDisabled}
                        />
                      </TableCell>
                      <TableCell>
                        <FormSelect
                          labelText=""
                          placeholder="Select"
                          selectContent={successOptions.map((opt) => ({
                            label: opt,
                            value: opt,
                          }))}
                          value={row.success}
                          onValueChange={(value) => {
                            const newTableData = [...formData.tableData];
                            newTableData[rowIndex].success = value;
                            setValue(
                              `forms.${formIndex}.tableData`,
                              newTableData
                            );
                          }}
                          disabled={isFormDisabled}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Total Time Spent On Activity (Minutes)
                </h4>
                <Controller
                  name={`forms.${formIndex}.totalTime`}
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      labelText=""
                      placeholder="Enter time here"
                      type="text"
                      isAuth={false}
                      disabled={isFormDisabled}
                      isError={!!errors.forms?.[formIndex]?.totalTime}
                      errorMessage={
                        errors.forms?.[formIndex]?.totalTime?.message
                      }
                    />
                  )}
                />
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Client&apos;s Response/ Reaction Was
                </h4>
                <Controller
                  name={`forms.${formIndex}.clientResponse`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      labelText=""
                      placeholder="Select options"
                      selectContent={clientResponseOptions}
                      isError={!!errors.forms?.[formIndex]?.clientResponse}
                      errorMessage={
                        errors.forms?.[formIndex]?.clientResponse?.message
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Consequently, Client
                </h4>
                <Controller
                  name={`forms.${formIndex}.consequentlyClient`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      labelText=""
                      placeholder="Select options"
                      selectContent={consequentlyClientOptions}
                      isError={!!errors.forms?.[formIndex]?.consequentlyClient}
                      errorMessage={
                        errors.forms?.[formIndex]?.consequentlyClient?.message
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
              <div>
                <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                  Client&apos;s Reward
                </h4>
                <Controller
                  name={`forms.${formIndex}.clientReward`}
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      labelText=""
                      placeholder="Please select"
                      selectContent={clientRewardOptions}
                      isError={!!errors.forms?.[formIndex]?.clientReward}
                      errorMessage={
                        errors.forms?.[formIndex]?.clientReward?.message
                      }
                      disabled={isFormDisabled}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <h4 className="text-[#0F172A] text-[16px] font-[600] mb-2">
                STO Comments (Optional)
              </h4>
              <Controller
                name={`forms.${formIndex}.comments`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    labelText=""
                    placeholder="Enter here..."
                    type="text"
                    isAuth={false}
                    disabled={isFormDisabled}
                  />
                )}
              />
            </div>
          </div>
        ))}

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

          <Button
            type="submit"
            data-testid="next-section-button"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Save <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </section>
  );
};

export default TIVisitGoals;
