"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Provider } from "@prisma/client";
import axios from "axios";
import { useStepper } from "headless-stepper";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

import AppLoader from "@/components/app-loader";
import {
  ProviderDetails,
  ProviderInformation,
  QualityImprovement,
} from "@/components/settings";
import { Button, Card, Form, Stepper } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useGetProvider, usePopulateForm } from "@/hooks";
import { providerDefaultValues, providerFormSchema } from "@/schema";
import { InferSchema } from "@/types";

const steps = [
  { label: "Provider Details" },
  { label: "Quality Improvement Organization" },
  { label: "Provider to Provider Information" },
];

const ProviderPage = () => {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const stepper = useStepper({
    steps,
  });
  const currentSchema = providerFormSchema[stepper.state.currentStep];
  type ProviderForm = InferSchema<typeof currentSchema>;
  const { authUser } = useAuth();
  const { data, mutate, isLoading } = useGetProvider(authUser?.providerId);

  const handleNextStep = async (values: ProviderForm) => {
    try {
      setLoading(true);
      await axios.put("/api/provider", values);
      mutate();
      toast.success("Success|Provider details updated successfully");
      if (stepper.state.currentStep === steps.length - 1) {
        setCompleted(true);
      }
      stepper.nextStep();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (completed) {
      setCompleted(false);
    }
    stepper.prevStep();
  };

  const methods = useForm<ProviderForm>({
    resolver: zodResolver(currentSchema),
    defaultValues: providerDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  usePopulateForm<ProviderForm, Provider>(methods.reset, data?.data);

  function onSubmit(values: ProviderForm) {
    handleNextStep(values);
  }

  return (
    <Card className="flex flex-col justify-center items-center w-[50%] mx-auto mt-12 pt-6 pb-8">
      <AppLoader loading={isLoading} />
      <div className="w-full">
        <div className="px-2 md:px-12">
          <Stepper
            withLabel
            stepper={stepper}
            steps={steps}
            completed={completed}
          />
        </div>
        <Form {...methods}>
          <form
            className="h-[590px] overflow-auto scrollbar-hide mt-6 justify-between flex flex-col w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              const isValid = await methods.trigger();
              if (isValid) onSubmit(methods.getValues());
            }}
          >
            <div className="px-4 md:px-12">
              {stepper.state.currentStep === 0 ? (
                <ProviderDetails form={methods} />
              ) : stepper.state.currentStep === 1 ? (
                <QualityImprovement form={methods} />
              ) : (
                <ProviderInformation form={methods} />
              )}
            </div>
            <div className="flex mt-4 gap-4 md:justify-end justify-center">
              {!!stepper.state.currentStep && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrevStep();
                  }}
                  leftIcon={<FaArrowLeft />}
                  type="button"
                >
                  <span>Back</span>
                </Button>
              )}
              <Button
                rightIcon={
                  stepper.state.currentStep === steps.length - 1 ? (
                    ""
                  ) : (
                    <FaArrowRight />
                  )
                }
                type="submit"
                className="md:mr-12"
                loading={loading}
              >
                <span>
                  {stepper.state.currentStep === steps.length - 1
                    ? "Submit"
                    : "Save and Continue"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default ProviderPage;
