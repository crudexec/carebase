"use client";

import { Suspense, useState } from "react";
import FormInput from "@/components/input-fields/FormInput";
import SubmitButton from "@/app/(auth)/submit-button";
import { ResetPasswordFormData } from "@/utils/schemas/AuthValidationSchema";
import Image from "next/image";
import { useFormState } from "react-dom";
import { handleCreateNewPassword } from "./actions";
import { validationEngine, validateForm } from "@/utils/validators";
import { ResetPasswordSchema } from "@/utils/schemas";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const initialState = {
  status: "",
  message: "",
};

const CreateNewPasswordForm = () => {
  const [stage, setStage] = useState(1);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const { storedValue } = useLocalStorage<string>("token");

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    const newPassword = formData.get("newPassword")?.toString()!;
    const confirmPassword = formData.get("confirmPassword")?.toString()!;

    if (newPassword !== confirmPassword) {
      setError({
        field: ["First", "Second"],
        message: ["First And Second password must match"],
      });

      return { status: "error", message: "" };
    }

    const data: ResetPasswordFormData = {
      oldPassword: newPassword,
      newPassword: confirmPassword,
    };

    const validationResult = validationEngine(
      data,
      validateForm,
      ResetPasswordSchema
    );
    if (validationResult.field.length > 0) {
      setError(validationResult);

      return { status: "error", message: "" };
    }

    setError({
      field: [],
      message: [],
    });

    const savedToken = storedValue as string;

    try {
      const response = await handleCreateNewPassword(
        data.newPassword,
        token ?? savedToken ?? ""
      );

      if (!response.status) {
        return {
          message: response.errorMessage,
          status: "error",
        };
      }

      setStage(2);

      return {
        message: "Password changed successfully! Redirecting you now",
        status: "success",
      };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const [state, formAction] = useFormState(handleFormSubmit, initialState);

  return (
    <main className="w-full flex justify-center items-center h-screen">
      {stage == 1 && (
        <form
          action={formAction}
          className="w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] flex flex-col items-center gap-5 justify-center"
        >
          <div className="w-[60px] h-[60px] bg-[#F0F4FF] rounded-full flex items-center justify-center">
            <Image
              src="/assets/images/auth/authKey.svg"
              width={30}
              height={30}
              alt="key icon"
            />
          </div>

          <h1 className="text-[30px] font-[700] text-[#0F172A]">
            Set New Password
          </h1>
          <p className="text-[16px] font-[400] text-[#64748B] mb-5">
            Set a strong password to protect your account
          </p>

          <div className="w-full flex flex-col justify-center gap-5">
            <div className="w-full flex flex-col items-center gap-1">
              <FormInput
                name="newPassword"
                placeholder="Enter password"
                type="password"
                labelText="New Password"
                errorMessage={error.message.find((message) =>
                  message.includes("First")
                )}
                isError={!!error.field.find((field) => field.includes("First"))}
              />
              {error.field.includes("First") && (
                <p className="text-[14px] text-[#64748B] font-[400] text-left w-full mx-auto">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            <div className="w-full flex flex-col items-center gap-1">
              <FormInput
                name="confirmPassword"
                placeholder="Enter password"
                type="password"
                labelText="Confirm Password"
                errorMessage={error.message.find((message) =>
                  message.includes("Second")
                )}
                isError={
                  !!error.field.find((field) => field.includes("Second"))
                }
              />
              {error.field.includes("Second") && (
                <p className="text-[14px] text-[#64748B] font-[400] text-left w-full mx-auto">
                  Must be at least 8 characters
                </p>
              )}
            </div>
          </div>
          <SubmitButton buttonText="Reset Password" />

          {state.message.length > 1 && (
            <p
              className={`text-center font-[600] text-[14px] ${
                state.status === "success" ? "text-green-500" : "text-red-600"
              } `}
            >
              {state.message}
            </p>
          )}
        </form>
      )}

      {stage == 2 && (
        <div className="w-[90%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] flex flex-col items-center gap-5">
          <Image
            src="/assets/images/dashboard/checkmark.svg"
            width={60}
            height={60}
            alt="checkmark icon"
          />
          <h1 className="text-[36px] text-center font-[700] text-[#101828] leading-[40px]">
            Password Reset <br /> Successful!
          </h1>
          <p className="text-[16px] font-[400] text-[#64748B] mb-5 text-center">
            Your password has been successfully changed.
            <br /> Please login with your new password
          </p>

          <Link
            href="/login"
            className="px-5 py-4 bg-[#2563EB] hover:bg-[#2564ebd9] rounded-[6px] h-fit w-[90%] text-[#F8FAFC] text-[14px] font-[400] active:bg-[#4274e0f3] flex items-center justify-center text-center gap-5"
          >
            Continue to Login
          </Link>
        </div>
      )}
    </main>
  );
};

const CreateNewPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-[16px] font-[400] text-[#64748B]">Loading...</p>
        </div>
      }
    >
      <CreateNewPasswordForm />
    </Suspense>
  );
};

export default CreateNewPassword;
