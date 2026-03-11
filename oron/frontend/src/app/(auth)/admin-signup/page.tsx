"use client";

import { useState } from "react";
import FormHeader from "@/app/(auth)/form-header";
import FormInput from "@/components/input-fields/FormInput";
import SubmitButton from "@/app/(auth)/submit-button";
import { SignupFormData } from "@/utils/schemas/AuthValidationSchema";
import Link from "next/link";
import Image from "next/image";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { validationEngine, validateForm } from "@/utils/validators";
import { SignupSchema } from "@/utils/schemas";
import { handleAdminSignup } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import FormPanel from "@/app/(auth)/form-panel";
import PageContainer from "@/app/(auth)/page-container";

const initialState = {
  status: "",
  message: "",
};

const AdminSignupPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const handleFormSubmit = async (
    prevState: any,
    formData: FormData
  ): Promise<{ message: string; status: string }> => {
    const firstName = formData.get("firstName")?.toString()!;
    const lastName = formData.get("lastName")?.toString()!;
    const email = formData.get("email")?.toString()!;
    const password = formData.get("password")?.toString()!;
    const confirmPassword = formData.get("confirmPassword")?.toString()!;

    const data: SignupFormData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };

    const validationResult = validationEngine(data, validateForm, SignupSchema);

    if (validationResult.field.length > 0) {
      setError(validationResult);

      return { status: "error", message: "" };
    }

    if (password !== confirmPassword) {
      setError({
        field: ["Confirm Password"],
        message: ["Confirm Password do not match entered password"],
      });

      return { status: "error", message: "" };
    }

    setError({
      field: [],
      message: [],
    });

    try {
      const response = await handleAdminSignup(data, "ADMINISTRATOR");

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return {
          message: response.errorMessage,
          status: "error",
        };
      }

      router.push("/admin-login");

      return {
        message: "Account created sucessfully! Redirecting you to login",
        status: "success",
      };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const [state, formAction] = useFormState(handleFormSubmit, initialState);

  return (
    <PageContainer>
      <FormPanel>
        <form
          action={formAction}
          className="w-full md:w-[80%] mx-auto p-2 sm:p-5 flex flex-col gap-3"
        >
          <FormHeader
            heading="Admin Sign up"
            description="Create your admin account"
          />

          {state.message && (
            <div className="w-full rounded-lg border-[1px] border-[#EF4444] bg-[#FFFBFA] p-5 flex gap-3 items-start">
              <Image
                src="/assets/images/auth/alert-circle.svg"
                width={16}
                height={16}
                alt="alert icon"
                className="mt-1"
              />

              <h3 className="text-[16px] text-[#EF4444] font-[500]">
                {state.message}
              </h3>
            </div>
          )}

          <div className="w-full flex flex-col gap-6 mt-5">
            <FormInput
              name="firstName"
              placeholder="Enter your first name"
              type="text"
              labelText="First Name"
              errorMessage={error.message.find((message) =>
                message.includes("First")
              )}
              isError={!!error.field.find((field) => field.includes("First"))}
            />
            <FormInput
              name="lastName"
              placeholder="Enter your Last name"
              type="text"
              labelText="Last Name"
              errorMessage={error.message.find((message) =>
                message.includes("Last")
              )}
              isError={!!error.field.find((field) => field.includes("Last"))}
            />
            <FormInput
              name="email"
              placeholder="Enter your email address"
              type="email"
              labelText="Email Address"
              errorMessage={error.message.find((message) =>
                message.includes("email")
              )}
              isError={!!error.field.find((field) => field.includes("email"))}
            />
            <div className="flex flex-col gap-2">
              <FormInput
                name="password"
                placeholder="Enter password"
                type="password"
                labelText="Password"
                errorMessage={error.message.find((message) =>
                  message.includes("Entered Password")
                )}
                isError={
                  !!error.field.find((field) =>
                    field.includes("Entered Password")
                  )
                }
              />
              <p className="text-[14px] text-[#64748B] font-[400]">
                Must be at least 8 characters
              </p>
            </div>

            <FormInput
              name="confirmPassword"
              placeholder="Enter password again"
              type="password"
              labelText="Confirm Password"
              errorMessage={error.message.find((message) =>
                message.includes("Confirm Password")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Confirm Password")
                )
              }
            />
          </div>
          <p className="text-[14px] text-[#64748B] font-[400]">
            Must match password above
          </p>

          <SubmitButton buttonText="Create an account" />

          <p className="text-[14px] text-[#64748B] font-[400] w-full text-center mt-5">
            Already have an account?{" "}
            <Link
              href="/admin-login"
              className="text-[#2563EB] ml-5 font-[600]"
            >
              Log in
            </Link>
          </p>
        </form>
      </FormPanel>
    </PageContainer>
  );
};

export default AdminSignupPage;
