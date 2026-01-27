import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

import { phraseSections } from "@/constants";
import { useDisclosure, useGetPhrases } from "@/hooks";
import { useCreatePhrase } from "@/hooks/request/misc";

import Flex from "../flex";
import {
  Button,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  SelectInput,
  Textarea,
} from "../ui";

const PhraseHelperText = ({
  formData,
  callback,
}: {
  formData: { section: string; description: string };
  callback: (value: string) => void;
}) => {
  const { opened, onOpen, onClose } = useDisclosure();
  const [phaseLookup, setPhaseLookup] = React.useState<boolean>(false);
  const { data, isLoading, mutate } = useGetPhrases(formData?.section);
  const { data: response, isMutating, trigger } = useCreatePhrase();

  const methods = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, { message: "Name is required" }),
        section: z.string().min(1, { message: "Name is required" }),
        description: z.string().min(1, { message: "Description is required" }),
      }),
    ),
    defaultValues: {
      section: "",
      description: "",
      name: "",
    },
  });

  React.useEffect(() => {
    if (response?.success) {
      toast.success(`Success|${response?.message}`);
      callback(methods.watch("description"));
      mutate();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <div>
      <Modal
        open={opened}
        onClose={() => {
          methods.reset({
            section: "",
            description: "",
            name: "",
          });
          onClose();
        }}
        title="Add a new phrase"
      >
        <Form {...methods}>
          <form className="flex flex-col gap-4">
            <FormField
              control={methods.control}
              name={"section"}
              render={({ field }) => (
                <FormRender label="Section">
                  <SelectInput
                    searchable
                    modalSearch
                    placeholder="select an option"
                    options={
                      phraseSections?.map((phrase) => ({
                        label: phrase.label,
                        value: phrase.value,
                      })) ?? []
                    }
                    field={field}
                    loading={isLoading}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"name"}
              render={({ field }) => (
                <FormRender label="Name">
                  <Input
                    {...field}
                    value={field.value as string}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"description"}
              render={({ field }) => (
                <FormRender label="Description">
                  <Textarea {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <Button
              className="px-6"
              loading={isMutating}
              type="button"
              onClick={methods.handleSubmit(async (formData) => {
                await trigger(formData);
              })}
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </Modal>
      <Flex className="justify-between text-primary text-xs mt-2 items-start">
        <p
          className="cursor-pointer hover:underline"
          onClick={() => {
            setPhaseLookup(!phaseLookup);
          }}
        >
          Phrase Lookup
        </p>
        <p
          className="cursor-pointer hover:underline"
          onClick={() => {
            methods.reset({
              section: formData.section,
              description: formData.description,
              name: "",
            });
            onOpen();
          }}
        >
          Add to Phrase List
        </p>
      </Flex>
      {phaseLookup && (
        <SelectInput
          searchable
          options={[
            {
              label: "Phrase Name -  Description",
              value: "newPhrase",
              disabled: true,
            },
            ...(data?.data?.map((phrase) => ({
              label: `${phrase.name} - ${phrase.description}`,
              value: phrase.id,
            })) ?? []),
          ]}
          field={{
            onChange: (value) => {
              callback(
                data?.data
                  ?.find((phrase) => phrase.id === value)
                  ?.description.replace(/\n/g, "") ?? "",
              );
            },
          }}
          loading={isLoading}
        />
      )}
    </div>
  );
};

export default PhraseHelperText;
