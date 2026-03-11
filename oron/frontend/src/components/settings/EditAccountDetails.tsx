"use client";

import FormInput from "@/components/input-fields/FormInput";
import { Label } from "../ui/label";
import Image from "next/image";
import Button from "../button/Button";
import useUser from "@/hooks/useUser";
import FileUpload from "../file-upload/FileUpload";
import Loader from "../Loader";
import { useToast } from "../ui/use-toast";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUser } from "./helper";

const EditAccountDetailsSchema = z.object({
  last_name: z.string().nonempty("Last name is required"),
  first_name: z.string().nonempty("First name is required"),
  profile_picture: z.string().optional(), // Adjusted for file handling
});
export type EditAccountFormData = z.infer<typeof EditAccountDetailsSchema>;

const EditAccountDetails = () => {
  const { toast } = useToast();
  const { data: user, isLoading: userDataLoading } = useUser();

  const [profilePicture, setProfilePicture] = useState(
    "/assets/images/dashboard/emptyProfilePicture.svg"
  );
  const [newProfilePicUrl, setNewProfilePicUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (newProfilePicUrl && newProfilePicUrl.length > 0) {
      setProfilePicture(newProfilePicUrl);
    }
  }, [newProfilePicUrl]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAccountFormData>({
    resolver: zodResolver(EditAccountDetailsSchema),
    defaultValues: {
      last_name: user?.data?.last_name ?? "",
      first_name: user?.data?.first_name ?? "",
      profile_picture: "",
    },
  });

  useEffect(() => {
    if (newProfilePicUrl.length === 0) {
      setProfilePicture("/assets/images/dashboard/emptyProfilePicture.svg");
    }
  }, [newProfilePicUrl]);

  if (userDataLoading) {
    return <Loader />;
  }

  const onSubmit = async (data: EditAccountFormData) => {
    // setIsSubmitting(true);
    if (!data.profile_picture || data.profile_picture.length < 1) {
      toast({
        variant: "destructive",
        description: "Please upload a profile picture",
      });
      return;
    }

    const token = localStorage.getItem("token") as string;

    const response = await updateUser(token, data);
    if (!response) {
      toast({
        variant: "destructive",
        description: "An error occurred while updating your profile, try again",
      });
      // setIsSubmitting(false);
      return;
    }

    toast({
      variant: "default",
      description: "Profile Saved Successfully",
    });
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-10 mt-10 w-full"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-[600] text-[#101828]">My Details</h3>
        <p className="text-[14px] font-[400] text-[#475467]">
          Edit your account details here
        </p>
        <hr className="w-full border-[1px] border-[#EAECF0] mt-5" />
      </div>

      <div className="w-full flex flex-col gap-7 mt-5">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-5">
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Doe"
                type="text"
                labelText="Last Name (Family Name)"
                defaultValue={user?.data.first_name}
                isAuth={false}
                isError={!!errors.last_name}
                errorMessage={errors.last_name?.message}
              />
            )}
          />
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Sandra"
                type="text"
                labelText="First Name (Given Name)"
                defaultValue={user?.data.last_name}
                isAuth={false}
                isError={!!errors.first_name}
                errorMessage={errors.first_name?.message}
              />
            )}
          />
        </div>

        <div className="xl:w-[50%] grid gap-2">
          <Label>Profile Picture</Label>
          <div className="flex flex-wrap md:flex-nowrap items-start gap-3">
            <Image
              src={profilePicture}
              width={120}
              height={120}
              alt="avatar"
              className="rounded-full"
            />
            <div className="w-full">
              <Controller
                name="profile_picture"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    getFileUrl={(fileUrl) => field.onChange(fileUrl)}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white w-full">
        <Button variant="light" type="button">
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default EditAccountDetails;
