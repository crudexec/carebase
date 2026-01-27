import { User } from "@prisma/client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { ImageUploadBox } from "@/components/image-upload";
import {
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  SelectInput,
  Textarea,
} from "@/components/ui";
import {
  getCities,
  getCountries,
  getStates,
  nurseNotesOptions,
  serviceOptions,
  titleOptions,
} from "@/constants";
import { taxonomy } from "@/constants/taxonomy";
import { useCreateUser, useUpdateUser } from "@/hooks";
import { pickValues, uploadFile } from "@/lib";
import { createUserFormSchema } from "@/schema/user";
import { ApiResponse, FormReturn, ISetState, TaxonomyResponse } from "@/types";

type formType = FormReturn<typeof createUserFormSchema>;
type Props = {
  refreshTable: () => void;
  mode: "create" | "edit" | "view";
  selected?: User;
  setUserId: ISetState<string>;
  userId: string;
  setTab: ISetState<string>;
  methods: formType;
  role?: string;
};

const AddUserInformation = ({
  refreshTable,
  mode,
  setTab,
  selected,
  userId,
  methods,
  setUserId,
  role,
}: Props) => {
  const countries = getCountries();
  const states = getStates(methods.watch("country"));
  const cities = getCities(methods.watch("country"), methods.watch("state"));
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const { data, trigger, isMutating } = useSWRMutation(
    "/api/user",
    useCreateUser,
  );
  const { data: taxonomies } =
    useSWR<ApiResponse<TaxonomyResponse[]>>(`/api/lookup/taxonomy`);
  const {
    data: updateResponse,
    trigger: updateUser,
    isMutating: isUpdating,
  } = useSWRMutation("/api/user", useUpdateUser);

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      if (mode === "create" && !userId) {
        setUserId(data?.data?.id);
        toast.success(`Success|${data?.message}`);
      } else {
        setUserId(updateResponse?.data?.id);
        toast.success(`Success|${updateResponse?.message}`);
      }
      setTab("history");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <Form {...methods}>
      <form
        className="h-[670px] overflow-auto mt-2 justify-between flex flex-col scrollbar-hide"
        onSubmit={methods.handleSubmit(async (data) => {
          let profilePicture;
          if (data.image && preview) {
            setUploading(true);
            const response = await uploadFile(data?.image, "users");
            profilePicture = response?.mediaId;
            setUploading(false);
            if (!response?.success) return;
          }
          if (mode === "create" && !userId) {
            await trigger({
              ...pickValues({ ...data, image: profilePicture || undefined }),
              email: data?.email,
              firstName: data?.firstName,
              lastName: data?.lastName,
              role,
            });
          } else {
            await updateUser({
              ...data,
              image: preview ? profilePicture : undefined,
              id: (selected?.id as string) || userId,
            });
          }
        })}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-x-7 gap-y-4 md:px-8 px-4">
          <div className="mx-auto lg:col-span-2">
            <FormField
              control={methods.control}
              name={"image"}
              render={({ field }) => (
                <FormRender label={""}>
                  <ImageUploadBox
                    className="w-28 h-28"
                    rounded
                    defaultValue={methods.watch("image")}
                    callback={(value) => {
                      field.onChange(value.value);
                      setPreview(value.preview as string);
                    }}
                    disabled={mode === "view"}
                  />
                </FormRender>
              )}
            />
          </div>
          <FormField
            control={methods.control}
            name={"firstName"}
            render={({ field }) => (
              <FormRender label={"First Name"}>
                <Input {...field} disabled={mode === "view"} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"lastName"}
            render={({ field }) => (
              <FormRender label={"Last Name"}>
                <Input {...field} disabled={mode === "view"} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"email"}
            render={({ field }) => (
              <FormRender label={"Email (personal)"}>
                <Input {...field} disabled={mode === "view"} />
              </FormRender>
            )}
          />{" "}
          <FormField
            control={methods.control}
            name={"licenseNo"}
            render={({ field }) => (
              <FormRender label={"License Number"}>
                <Input {...field} disabled={mode === "view"} type="number" />
              </FormRender>
            )}
          />
          {role === "therapist" && (
            <FormField
              control={methods.control}
              name={"service"}
              render={({ field }) => (
                <FormRender label={"Services"}>
                  <SelectInput
                    options={serviceOptions}
                    field={field}
                    disabled={mode === "view"}
                  />
                </FormRender>
              )}
            />
          )}
          <FormField
            control={methods.control}
            name={"jobTitle"}
            render={({ field }) => (
              <FormRender label={"Job Title"}>
                {role === "nurse" ? (
                  <SelectInput
                    options={titleOptions}
                    field={field}
                    disabled={mode === "view"}
                  />
                ) : (
                  <Input {...field} disabled={mode === "view"} />
                )}
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"notes"}
            render={({ field }) => (
              <FormRender label={"Nurses Notes from this Nurse are"}>
                <SelectInput
                  options={nurseNotesOptions}
                  field={field}
                  disabled={mode === "view"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"taxonomy"}
            render={({ field }) => (
              <FormRender label={"Taxonomy"}>
                <SelectInput
                  options={taxonomies?.data.map((tax) => ({
                    value: tax.id,
                    label:
                      taxonomy.find((item) => item.value === tax.name)?.label ||
                      "",
                  }))}
                  field={field}
                  disabled={mode === "view"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"taxonomyCode"}
            render={({ field }) => (
              <FormRender label={"Taxonomy Code"}>
                <SelectInput
                  options={
                    taxonomies?.data
                      .find(
                        (taxonomy) => taxonomy.id === methods.watch("taxonomy"),
                      )
                      ?.codes.map((code) => ({
                        value: code.id,
                        label:
                          taxonomy
                            .flatMap((item) => item.code)
                            .find((item) => item.value === code.code)?.label ||
                          "",
                      })) ?? []
                  }
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"addressLine1"}
            render={({ field }) => (
              <FormRender label={"Address Line 1"}>
                <Input {...field} disabled={mode === "view"} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"addressLine2"}
            render={({ field }) => (
              <FormRender label={"Line 2 (If any?)"}>
                <Input {...field} disabled={mode === "view"} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"country"}
            render={({ field }) => (
              <FormRender label={"Country"}>
                <SelectInput
                  options={countries}
                  field={field}
                  disabled={mode === "view"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"state"}
            render={({ field }) => (
              <FormRender label={"State"}>
                <SelectInput
                  options={states}
                  field={field}
                  disabled={mode === "view"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"city"}
            render={({ field }) => (
              <FormRender label={"City"}>
                <SelectInput
                  options={cities}
                  field={field}
                  disabled={mode === "view"}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"postalCode"}
            render={({ field }) => (
              <FormRender label={"Postal Code"}>
                <Input {...field} disabled={mode === "view"} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"homePhone"}
            render={({ field }) => (
              <FormRender label={"Home Phone"}>
                <Input {...field} disabled={mode === "view"} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"cellPhone"}
            render={({ field }) => (
              <FormRender label={"Cell Phone (If any)"}>
                <Input {...field} disabled={mode === "view"} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"fax"}
            render={({ field }) => (
              <FormRender label={"Fax (If any)"}>
                <Input {...field} disabled={mode === "view"} type="number" />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"memo"}
            render={({ field }) => (
              <FormRender label={"Memo(if any)"}>
                <Textarea
                  {...field}
                  disabled={mode === "view"}
                  value={field.value as string}
                />
              </FormRender>
            )}
          />
        </div>
        {mode !== "view" && (
          <Button
            rightIcon={<FaArrowRight />}
            type="submit"
            className="md:mx-2 mt-6 py-2 text-white"
            loading={isMutating || isUpdating || uploading}
          >
            Save and Continue
          </Button>
        )}
      </form>
    </Form>
  );
};

export default AddUserInformation;
