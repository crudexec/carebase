"use client";

import { useState } from "react";
import FormInput from "@/components/input-fields/FormInput";
import SubmitButton from "@/app/(auth)/submit-button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordFormData } from "@/utils/schemas/AuthValidationSchema";
import { validationEngine, validateForm } from "@/utils/validators";
import { ForgotPasswordSchema } from "@/utils/schemas";
import { handleForgotPassword } from "./actions";
import { useToast } from "@/components/ui/use-toast";

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("devemmanuel1@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    field: string;
    message: string;
  }>({
    field: "",
    message: "",
  });

  const handleFormSubmit = async (formData: FormData) => {
    const email = formData.get("email")?.toString()!;

    const data: ForgotPasswordFormData = {
      email,
    };

    const validationResult = validationEngine(
      data,
      validateForm,
      ForgotPasswordSchema
    );

    if (validationResult.field.length > 0) {
      toast({
        variant: "destructive",
        description: validationResult.field[0],
      });
      return;
    }

    setError({
      field: "",
      message: "",
    });

    try {
      const token = localStorage.getItem("token") as string;
      const response = await handleForgotPassword(data.email, token);

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      const userEmail = response.errorMessage;
      setEmail(userEmail);
      setStage(2);

      toast({
        variant: "success",
        description: `Forgot password email sent to ${userEmail}`,
      });
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") as string;
      const response = await handleForgotPassword(email, token);

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      const userEmail = response.errorMessage;
      setEmail(userEmail);

      toast({
        variant: "success",
        description: `Forgot password email sent to ${userEmail}`,
      });
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center h-screen">
      {stage === 1 && (
        <form
          action={handleFormSubmit}
          className="w-[90%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] flex flex-col items-center gap-5"
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
            Forgot Password?
          </h1>
          <p className="text-[16px] font-[400] text-[#64748B] mb-5">
            Enter your email address to recieve the reset link
          </p>

          <FormInput
            name="email"
            placeholder="Enter your email address"
            type="email"
            labelText="Email Address"
            isError={error.field === "email"}
            errorMessage={error.field === "email" ? error.message : ""}
          />
          <SubmitButton buttonText="Reset Password" />

          <Link
            href="/login"
            className="text-[14px] font-[500] text-[#020817] flex items-center gap-1 mt-5 transition-all duration-500 hover:gap-5"
          >
            <ArrowLeft />
            Back to log in
          </Link>
        </form>
      )}

      {stage == 2 && (
        <div className="w-[90%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] flex flex-col items-center gap-5">
          <Image
            src="/assets/images/dashboard/mailIcon.svg"
            width={60}
            height={60}
            alt="key icon"
          />

          <h1 className="text-[30px] font-[700] text-[#101828]">
            Check Your Email
          </h1>
          <p className="text-[16px] font-[400] text-[#64748B] mb-5 text-center">
            We sent a password reset link to <br />
            <span className="font-[700]">{email}</span>
          </p>

          <p className="text-[#64748B] text-[14px] font-[400] mt-2">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="text-[15px] font-[500] text-[#2563EB] disabled:cursor-not-allowed disabled:text-[#8bb0ff5d]"
            >
              {isLoading ? "Resending..." : "Click to resend"}
            </button>
          </p>

          <Link
            href="/login"
            className="text-[14px] font-[500] text-[#020817] flex items-center gap-1 mt-2 transition-all duration-500 hover:gap-5"
          >
            <ArrowLeft />
            Back to log in
          </Link>
        </div>
      )}
    </main>
  );
};

export default ForgotPasswordPage;
