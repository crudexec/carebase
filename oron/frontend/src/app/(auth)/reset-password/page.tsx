"use client";

import { useState } from "react";
import FormInput from "@/components/input-fields/FormInput";
import SubmitButton from "@/app/(auth)/submit-button";
import { ResetPasswordFormData } from "@/utils/schemas/AuthValidationSchema";
import Image from "next/image";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { handlePasswordChange } from "./actions";
import { validationEngine, validateForm } from "@/utils/validators";
import { ResetPasswordSchema } from "@/utils/schemas";
import useLocalStorage from "@/hooks/useLocalStorage";

const initialState = {
  status: "",
  message: "",
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const { storedValue } = useLocalStorage<string>("token");

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    const oldPassword = formData.get("oldPassword")?.toString()!;
    const newPassword = formData.get("newPassword")?.toString()!;

    const data: ResetPasswordFormData = {
      oldPassword,
      newPassword,
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

    const token = storedValue as string;

    try {
      const response = await handlePasswordChange(data, token);

      if (!response.status) {
        return {
          message: response.errorMessage,
          status: "error",
        };
      }

      router.push("/login");
      return {
        message: "Password changes successfully! Redirecting you to login",
        status: "success",
      };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const [state, formAction] = useFormState(handleFormSubmit, initialState);

  return (
    <main className="w-full flex justify-center items-center h-screen">
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
          Change Password
        </h1>
        <p className="text-[16px] font-[400] text-[#64748B] mb-5">
          Set a strong password to protect your account
        </p>

        <div className="w-full flex flex-col justify-center gap-5">
          <div className="w-full flex flex-col items-center gap-1">
            <FormInput
              name="oldPassword"
              placeholder="Enter password"
              type="password"
              labelText="Old Password"
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
              name="newPassword"
              placeholder="Enter password"
              type="password"
              labelText="New Password"
              errorMessage={error.message.find((message) =>
                message.includes("Second")
              )}
              isError={!!error.field.find((field) => field.includes("Second"))}
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
    </main>
  );
};

export default ResetPasswordPage;
