import { Media } from "@prisma/client";
import React from "react";

import { MultipleImageUploader } from "@/components/image-upload";
import { FormField, FormRender } from "@/components/ui";
import { cn } from "@/lib";
import { UserHistorySchema } from "@/schema";
import { ActionType, FormReturn } from "@/types";

type formType = FormReturn<typeof UserHistorySchema>;

const AttachFiles = ({
  methods,
  mode,
}: {
  methods: formType;
  mode: ActionType;
}) => {
  return (
    <div
      className={cn("grid grid-cols-1 gap-x-7 gap-y-4 md:px-8 px-4 items-end")}
    >
      <FormField
        control={methods.control}
        name={"media"}
        render={({ field }) => (
          <FormRender label={"Attachments"}>
            <MultipleImageUploader
              className="w-28 h-28"
              callback={(value) => {
                field.onChange(value);
              }}
              defaultValues={field.value as Media[]}
              disabled={mode === "view"}
            />
          </FormRender>
        )}
      />
    </div>
  );
};

export default AttachFiles;
