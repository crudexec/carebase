import React from "react";

import { Button, Modal } from "@/components/ui";
import { ISetState } from "@/types";

const CreateSNNotePrompt = ({
  open,
  onClose,
  patientId,
  caregiverId,
  unscheduledVisitId,
  setUpdateNoteType,
  isMutating,
  updateNoteType,
  trigger,
}: {
  open: boolean;
  onClose: () => void;
  patientId: string;
  caregiverId: string;
  unscheduledVisitId?: string;
  setUpdateNoteType: ISetState<string>;
  isMutating?: boolean;
  updateNoteType: string;
  trigger?: (arg: {
    patientId: string;
    id?: string;
    caregiverId: string;
  }) => Promise<void>;
}) => {
  return (
    <Modal
      title="New Note"
      open={open}
      onClose={onClose}
      className="md:max-w-[600px]"
    >
      <p className="text-sm font-medium pb-5">
        Which type of note do you want to create?
      </p>
      <div className="flex flex-wrap gap-2 justify-between">
        <Button
          className="w-full md:w-fit"
          onClick={async () => {
            setUpdateNoteType("poc");
            await trigger?.({ patientId, id: unscheduledVisitId, caregiverId });
          }}
          loading={isMutating && updateNoteType === "poc"}
        >
          SN Note According to POC (SNaP)
        </Button>
        <Button
          className="w-full md:w-fit"
          onClick={async () => {
            setUpdateNoteType("skilled");
            await trigger?.({ patientId, id: unscheduledVisitId, caregiverId });
          }}
          loading={isMutating && updateNoteType === "skilled"}
        >
          Skilled Nursing Note
        </Button>
      </div>
    </Modal>
  );
};

export default CreateSNNotePrompt;
