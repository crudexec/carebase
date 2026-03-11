"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FormInput from "../input-fields/FormInput";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import useCustomMutation from "@/hooks/useCustomMutation";
import Loader from "../Loader";
import { createNewIntake } from "@/actions/clients/new-intake/new-intake";

interface Props {
  openModal: boolean;
  closeModal: () => void;
}

const NewIntakeModal = ({ openModal, closeModal }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleNewIntake = useCallback(async () => {
    if (!firstName || !lastName) {
      toast({
        variant: "destructive",
        description: "Please enter both first and last name",
      });
      return;
    }

    const token = localStorage.getItem("token") as string;
    const response = await createNewIntake(firstName, lastName, token);

    if (!response.status) {
      toast({
        variant: "destructive",
        description: response.errorMessage,
      });
      return;
    }

    closeModal();

    router.push(
      `/admin/clients/new-intake?intake_full_id=${response.errorMessage}`
    );
  }, [firstName, lastName, router, toast, closeModal]);

  const { mutate, isPending } = useCustomMutation<string>(handleNewIntake, [
    "fullIntake",
  ]);

  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[12px] flex flex-col gap-5 lg:min-w-[600px]"
        data-testid="new-intake-modal"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            Add New Intake
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
          <FormInput
            type="text"
            name="firstName"
            labelText="First Name"
            placeholder="Enter participant's first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            data-testid="first-name-input"
          />

          <FormInput
            type="text"
            name="lastName"
            labelText="Last Name"
            placeholder="Enter participant's last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            data-testid="last-name-input"
          />
        </div>

        <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
          <button
            disabled={isPending}
            onClick={closeModal}
            className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-2 py-3 text-black disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            data-testid="cancel-button"
          >
            Cancel
          </button>

          <button
            className="flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white"
            disabled={isPending}
            onClick={() => {
              mutate("");
            }}
            type="button"
            data-testid="add-intake-button"
          >
            {isPending ? <Loader height="h-fit" /> : "Add Intake"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewIntakeModal;
