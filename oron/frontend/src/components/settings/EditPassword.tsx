"use client";

import FormInput from "@/components/input-fields/FormInput";
import { Label } from "../ui/label";
import Button from "../button/Button";
import { z } from "zod";
import { FormErrors } from "../events/admin-events/types";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { updatePassword } from "./helper";

const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Your new password must be more than 8 characters."),
    confirmPassword: z.string().min(1, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Must match password above",
  });

const EditPassword = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isCurrentPasswordCorrect = (password: string) => {
    return password === "correct_password";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    const formData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    const result = passwordUpdateSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const errorMessages: FormErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([key, messages]) => [
          key,
          messages?.[0] || "",
        ])
      );

      setErrors(errorMessages);
      return;
    }
    // Clear any existing errors
    setErrors({});

    // Call the updatePassword function
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You are not logged in. Please log in and try again.",
      });
      return;
    }

    const passwordData = new FormData();
    passwordData.append("current_password", currentPassword);
    passwordData.append("new_password", newPassword);

    const success = await updatePassword(token, {
      password: currentPassword,
      passwordNew: newPassword,
    });

    if (!success) {
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description:
          "There was an error updating your password. Please try again.",
      });
      return;
    }

    // Clear the form fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    toast({
      variant: "default",
      title: "Password Changed Successfully",
      description:
        "Your password has been updated. Please use your new password the next time you log in.",
    });

    setIsLoading(false);
  };

  return (
    <form className="flex flex-col gap-10 mt-10 w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-[600] text-[#101828]">Password</h3>
        <p className="text-[14px] font-[400] text-[#475467]">
          Please enter your current password to change your password.
        </p>

        <hr className="w-full border-[1px] border-[#EAECF0] mt-5" />
      </div>

      <div className="w-full flex flex-col gap-7 mt-3">
        <div className="xl:w-[70%] flex flex-col lg:flex-row lg:items-center gap-5">
          <Label htmlFor="currentPassword" className="xl:w-[40%] lg:w-[40%]">
            Current Password
          </Label>

          <FormInput
            name="currentPassword"
            placeholder="Current Password"
            type="password"
            labelText=""
            isAuth={false}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setErrors((prev) => ({ ...prev, currentPassword: "" })); // Clear error on change
            }}
            isError={!!errors.currentPassword}
            errorMessage={errors.currentPassword}
          />
        </div>

        <div className="xl:w-[70%] flex flex-col lg:flex-row lg:items-center gap-5 border-t-[1px] border-[#EAECF0] pt-5">
          <Label htmlFor="newPassword" className="xl:w-[40%] lg:w-[40%]">
            New Password
          </Label>

          <FormInput
            name="newPassword"
            placeholder="New Password"
            type="password"
            labelText=""
            isAuth={false}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
            isError={!!errors.newPassword}
            errorMessage={errors.newPassword}
          />
        </div>

        <div className="xl:w-[70%] flex flex-col lg:flex-row lg:items-center gap-5 border-t-[1px] border-[#EAECF0] pt-5">
          <Label htmlFor="confirmPassword" className="xl:w-[40%] lg:w-[40%]">
            Confirm new Password
          </Label>

          <FormInput
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            labelText=""
            isAuth={false}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            isError={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white w-full">
        <Button variant="light" type="button">
          Cancel
        </Button>

        <Button type="submit" isLoading={isLoading}>
          Update Password
        </Button>
      </div>
    </form>
  );
};

export default EditPassword;
