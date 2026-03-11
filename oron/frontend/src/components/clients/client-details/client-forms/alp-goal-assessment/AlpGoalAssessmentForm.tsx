"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Button from "@/components/button/Button";
import { submitAlpGoalAssessment } from "../../../../../actions/clients/alp-form/goalAssessment";
import { useRouter } from "next/navigation";

const goalAssessmentSchema = z.object({
  postEducation: z.boolean(),
  supportedEmployment: z.boolean(),
  creativeSelfEmployment: z.boolean(),
  ddaEligibility: z.boolean(),
  adultDayHabilitation: z.boolean(),
  housingLiving: z.boolean(),
  naturalSupports: z.boolean(),
  homeLivingSkills: z.object({
    laundry: z.boolean(),
    hygiene: z.boolean(),
    dressing: z.boolean(),
    timeManagement: z.boolean(),
    householdChores: z.boolean(),
    homeMaintenance: z.boolean(),
    mealPreparation: z.boolean(),
    shopping: z.boolean(),
  }),
  developingRelationships: z.boolean(),
  completedAssessment: z.boolean(),
});

type GoalAssessmentFormData = z.infer<typeof goalAssessmentSchema>;

interface Props {
  clientId: string;
  admin?: boolean;
}

const AlpGoalAssessmentForm = ({ clientId, admin }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalAssessmentFormData>({
    resolver: zodResolver(goalAssessmentSchema),
    defaultValues: {
      postEducation: false,
      supportedEmployment: false,
      creativeSelfEmployment: false,
      ddaEligibility: false,
      adultDayHabilitation: false,
      housingLiving: false,
      naturalSupports: false,
      homeLivingSkills: {
        laundry: false,
        hygiene: false,
        dressing: false,
        timeManagement: false,
        householdChores: false,
        homeMaintenance: false,
        mealPreparation: false,
        shopping: false,
      },
      developingRelationships: false,
      completedAssessment: false,
    },
  });

  const onSubmit = async (data: GoalAssessmentFormData) => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token") as string;

      const requestBody: any = {};

      const { status, errorMessage } = await submitAlpGoalAssessment(
        token,
        requestBody,
        clientId,
        method,
        ""
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        description: "Assessment submitted successfully",
      });

      router.push(
        admin ? `/admin/clients/${clientId}` : `/clients/${clientId}`
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        description: "Failed to submit assessment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-5">
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 divide-y">
            {/* Post-Education */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Post-Education Model
                  </h4>
                </div>
                <div>
                  <Controller
                    name="postEducation"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="postEducation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="postEducation">
                          To attain Post-Secondary Education
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Supported Employment */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Supported Employment
                  </h4>
                </div>
                <div>
                  <Controller
                    name="supportedEmployment"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="supportedEmployment"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="supportedEmployment">
                          To engage in supported employment
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Creative Self-Employment */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Creative Self-Employment
                  </h4>
                </div>
                <div>
                  <Controller
                    name="creativeSelfEmployment"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="creativeSelfEmployment"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="creativeSelfEmployment">
                          To engage in creative self-employment
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* DDA Eligibility */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    DDA Eligibility Determination Status
                  </h4>
                </div>
                <div>
                  <Controller
                    name="ddaEligibility"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ddaEligibility"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="ddaEligibility">
                          To determine DDA eligibility application status
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Adult Day Habilitation */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Adult Day Habilitation Program
                  </h4>
                </div>
                <div>
                  <Controller
                    name="adultDayHabilitation"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="adultDayHabilitation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="adultDayHabilitation">
                          To select a Day Habilitaion Program for Adults
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Housing/Living Arrangement */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Housing/Living Arrangement
                  </h4>
                </div>
                <div>
                  <Controller
                    name="housingLiving"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="housingLiving"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="housingLiving">
                          To choose appropriate Housing/Living Arrangements
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Natural Supports */}
            <div className="border-b">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Natural Supports
                  </h4>
                </div>
                <div>
                  <Controller
                    name="naturalSupports"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="naturalSupports"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="naturalSupports">
                          To receive Natural Supports
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Home Living Skills */}
            <div>
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Home Living Skills
                  </h4>
                </div>
                <div className="space-y-4">
                  <Controller
                    name="homeLivingSkills.laundry"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="laundry"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="laundry">To do Laundry</Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.hygiene"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hygiene"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="hygiene">
                          To maintain Good Hygiene
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.dressing"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dressing"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="dressing">
                          To Get Dressed Independently
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.timeManagement"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="timeManagement"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="timeManagement">
                          To attain Time Management skills
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.householdChores"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="householdChores"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="householdChores">
                          To perform Household Chores
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.homeMaintenance"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="homeMaintenance"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="homeMaintenance">
                          To perform Home Maintenance
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.mealPreparation"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mealPreparation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="mealPreparation">
                          To attain Meal Preparation skills
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="homeLivingSkills.shopping"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shopping"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="shopping">
                          To attain Shopping skills
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Developing Relationships */}
            <div className="border-t">
              <div className="p-4 md:grid md:grid-cols-2 space-y-3 md:space-y-0">
                <div>
                  <h4 className="text-[#0F172A] text-base font-medium">
                    Developing Relationships
                  </h4>
                </div>
                <div>
                  <Controller
                    name="developingRelationships"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="developingRelationships"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="developingRelationships">
                          To develop and sustain relationships
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pb-20">
          <Controller
            name="completedAssessment"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completedAssessment"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="completedAssessment" className="font-medium">
                  I have checked and completed the assessment
                </Label>
              </div>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Save And Finish
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AlpGoalAssessmentForm;
