"use client";

import { useState } from "react";
import FormPanel from "@/app/(auth)/form-panel";
import PageContainer from "@/app/(auth)/page-container";
import FormHeader from "@/app/(auth)/form-header";
import FormInput from "@/components/input-fields/FormInput";
import SubmitButton from "@/app/(auth)/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginFormData } from "@/utils/schemas/AuthValidationSchema";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { handleAdminLogin } from "./actions";
import { validationEngine, validateForm } from "@/utils/validators";
import { LoginSchema } from "@/utils/schemas";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ErrorState } from "@/types/GeneralTypes";

const AdminLoginPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({
    field: [],
    message: [],
  });

  const { setValue, clearLocalStorage } = useLocalStorage<string>("token");

  const handleFormSubmit = async (formData: FormData) => {
    clearLocalStorage();

    const data: LoginFormData = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      rememberMe: formData.get("rememberMe") === "on",
    };

    const validationResult = validationEngine(data, validateForm, LoginSchema);

    if (validationResult.field.length > 0) {
      setError(validationResult);
    }

    setError({
      field: [],
      message: [],
    });

    try {
      const response = await handleAdminLogin(data);

      if (!response.status) {
        setIsError(true);
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      setValue(response.token);

      router.push("/admin/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "An error occurred. Please try again.",
      });
      // throw new Error(error);
    }
  };

  return (
    <PageContainer>
      <FormPanel>
        <form
          action={handleFormSubmit}
          className="w-full md:w-[80%] mx-auto lg:h-[60%] md:mb-[10%] lg:mb-[20%] p-2 sm:p-5 flex flex-col gap-7"
          data-testid="login-form"
        >
          <FormHeader
            heading="Admin Portal Login"
            description="Welcome back! Please enter your details"
          />

          {isError && (
            <div className="w-full rounded-lg border-[1px] border-[#EF4444] p-5 flex gap-3 items-start">
              <Image
                src="/assets/images/auth/alert-circle.svg"
                width={16}
                height={16}
                alt="alert icon"
                className="mt-1"
              />
              <div className="flex flex-col">
                <h3 className="text-[16px] text-[#EF4444] font-[500]">
                  Incorrect username or password
                </h3>
                <p className="text-[14px] text-[#EF4444] font-[400]">
                  Please try again
                </p>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col gap-6 mt-5">
            <FormInput
              name="email"
              placeholder="Enter your email address"
              type="email"
              labelText="Email Address"
              errorMessage={error.message.find((message) =>
                message.includes("email")
              )}
              isError={!!error.field.find((field) => field.includes("email"))}
              data-testid="email-input"
            />
            <FormInput
              name="password"
              placeholder="Enter password"
              type="password"
              labelText="Enter Password"
              errorMessage={error.message.find((message) =>
                message.includes("Password")
              )}
              isError={
                !!error.field.find((field) => field.includes("Password"))
              }
              data-testid="password-input"
            />
          </div>

          <div className="w-full flex flex-wrap gap-6 justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                className="border-[#D0D5DD]"
              />
              <Label
                htmlFor="rememberMe"
                className="text-[14px] font-[500] text-[#344054]"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-[#2563EB] font-[600] text-[14px]"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton data-testid="submit-button" buttonText="Login" />

          <p className="text-[14px] text-[#64748B] font-[400] w-full text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link
              href="/admin-signup"
              className="text-[#2563EB] ml-3 font-[600]"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </FormPanel>
    </PageContainer>
  );
};

export default AdminLoginPage;
