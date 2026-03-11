"use client";

import { TreatmentPlan } from "@/types/Events";
import { IntakeType } from "@/types/IntakeForm";
import { TreatmentPlanType } from "../TreatmentPlanWrapper";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import IndependentLivingForm from "./IndependentLivingForm";
import CommunityForm from "./CommunityForm";
import RelationshipForm from "./RelationshipForm";
import EducationForm from "./EducationForm";
import FinancialForm from "./FinancialForm";
import EmploymentForm from "./EmploymentForm";
import HousingForm from "./HousingForm";
import NaturalSupportForm from "./NaturalSupportForm";
import HealthForm from "./HealthForm";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: IntakeType | undefined;
  treatmentPlanData: TreatmentPlan | undefined;
  username: string;
  clientId: string;
  formType: TreatmentPlanType;
  formId: string;
  refetchTreatmentPlan: any;
}

type TabType =
  | "independent-living"
  | "community"
  | "socialization"
  | "education"
  | "employment"
  | "financial"
  | "health"
  | "housing"
  | "natural-supports";

const defaultValues = {
  independentLiving: {
    selfAdvocacy: {
      skills: [
        { field: "choice_making_skills", value: "" },
        { field: "decision_making_skills", value: "" },
        { field: "problem_solving_skills", value: "" },
        { field: "goal_setting_attainment_skills", value: "" },
        { field: "self_regulation_skills", value: "" },
        { field: "self_advocacy_skills", value: "" },
        { field: "self_awareness_knowledge_skills", value: "" },
      ],
      potentialBarriers: "",
      relatedInfo: "",
      otherComments: "",
    },
    selfDirections: {
      skills: [
        { field: "planning_organizing_skills", value: "" },
        { field: "self_direction_skills", value: "" },
        { field: "self_motivation_skills", value: "" },
        { field: "determining_what_is_important", value: "" },
        { field: "setting_achieving_goals", value: "" },
        { field: "taking_authority", value: "" },
        { field: "taking_risks", value: "" },
        { field: "taking_responsibility", value: "" },
      ],
      potentialBarriers: "",
      relatedInfo: "",
      otherComments: "",
    },
    communication: {
      skills: [
        { field: "planning_organizing_skills", value: "" },
        { field: "augmentative_alternative_communication", value: "" },
        { field: "supports_required_for_communication", value: "" },
      ],
      potentialBarriers: "",
      relatedInfo: "",
      otherComments: "",
    },
    homeLiving: {
      skills: [
        { field: "maintaining_good_hygiene", value: "" },
        { field: "getting_dressed", value: "" },
        { field: "stay_on_schedule", value: "" },
        { field: "household_cleaning", value: "" },
        { field: "laundry", value: "" },
        { field: "home_maintenance", value: "" },
        { field: "meal_preparation", value: "" },
        { field: "shopping", value: "" },
      ],
      areasOfSupport: [
        { field: "maintaining_good_hygiene", value: "" },
        { field: "getting_dressed", value: "" },
        { field: "stay_on_schedule", value: "" },
        { field: "household_cleaning", value: "" },
        { field: "laundry", value: "" },
        { field: "home_maintenance", value: "" },
        { field: "meal_preparation", value: "" },
        { field: "shopping", value: "" },
      ],
      levelOfSupport: [
        { field: "maintaining_good_hygiene", value: "" },
        { field: "getting_dressed", value: "" },
        { field: "stay_on_schedule", value: "" },
        { field: "household_cleaning", value: "" },
        { field: "laundry", value: "" },
        { field: "home_maintenance", value: "" },
        { field: "meal_preparation", value: "" },
        { field: "shopping", value: "" },
      ],
      potentialBarriers: "",
      relatedInfo: "",
      otherComments: "",
    },
  },
  // ...other tab defaults
};

const AlpSkills = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  user,
  treatmentPlanData,
  username,
  clientId,
  formType,
  formId,
  refetchTreatmentPlan,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<TabType>("independent-living");

  const tabs = [
    { id: "independent-living", label: "Independent Living" },
    { id: "community", label: "Community" },
    { id: "socialization", label: "Socialization" },
    { id: "education", label: "Education" },
    { id: "employment", label: "Employment" },
    { id: "financial", label: "Financial" },
    { id: "health", label: "Health" },
    { id: "housing", label: "Housing" },
    { id: "natural-supports", label: "Natural Supports" },
  ];

  const handleTabChange = (tabId: TabType) => {
    setCurrentTab(tabId);
  };

  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
    setValue,
    getValues,
  } = methods;

  const values = watch();

  return (
    <FormProvider {...methods}>
      <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
        {/* Custom Tab Navigation */}
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-200 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  currentTab === tab.id
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => handleTabChange(tab.id as TabType)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {currentTab === "independent-living" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Socialization</h2>
              <IndependentLivingForm
                register={register}
                errors={errors?.independentLiving}
                values={values?.independentLiving}
              />
            </div>
          )}

          {currentTab === "community" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Community Integration And Community Membership
              </h2>
              <CommunityForm
                register={register}
                errors={errors?.independentLiving}
                values={values?.independentLiving}
              />
            </div>
          )}

          {currentTab === "socialization" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Relationship/Socialization
              </h2>
              <RelationshipForm />
            </div>
          )}

          {currentTab === "education" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Post-Secondary Education
              </h2>
              <EducationForm />
            </div>
          )}

          {currentTab === "employment" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Employment</h2>
              <EmploymentForm />
            </div>
          )}

          {currentTab === "financial" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Financial & Legal</h2>
              <FinancialForm />
            </div>
          )}

          {currentTab === "health" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Health & Safety</h2>
              <HealthForm />
            </div>
          )}

          {currentTab === "housing" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Housing & In-Home Home Supports
              </h2>
              <HousingForm />
            </div>
          )}

          {currentTab === "natural-supports" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Natural Supports & Social Inclusion
              </h2>
              <NaturalSupportForm />
            </div>
          )}
        </div>
      </section>
    </FormProvider>
  );
};

export default AlpSkills;
