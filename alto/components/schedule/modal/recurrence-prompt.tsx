import { FC, useState } from "react";

import { Button, DateRangePicker, Modal, RadioInput } from "@/components/ui";
import { ISetState } from "@/types";

interface Props {
  opened: boolean;
  closeModal: () => void;
  handleContinue: (value: string) => void;
  loading?: boolean;
  recurrTimeFilter: {
    startTime?: Date;
    endTime?: Date;
  };
  setRecurrTimeFilter: ISetState<{
    startTime?: Date;
    endTime?: Date;
  }>;
}
const RecurringPrompt: FC<Props> = ({
  opened,
  closeModal,
  handleContinue,
  recurrTimeFilter,
  setRecurrTimeFilter,
  loading,
}) => {
  const [value, setValue] = useState("0");
  const handleProceed = () => {
    handleContinue(value);
  };

  return (
    <Modal
      open={opened}
      onClose={() => {
        closeModal();
        setValue("");
      }}
      title="Recurring Option"
    >
      <RadioInput
        value={value}
        onChange={setValue}
        options={[
          { label: "This appointment only", value: "0" },
          { label: "This and all recurrences after this date", value: "1" },
          { label: "All appointments in the recurring series", value: "2" },
          { label: "All recurrences during the date range", value: "3" },
        ]}
      />

      {value === "3" && (
        <div className="mt-4">
          <DateRangePicker
            onChange={(date) => {
              setRecurrTimeFilter((prev) => ({
                ...prev,
                startTime: date[0],
                endTime: date[1],
              }));
            }}
            value={
              [recurrTimeFilter.startTime, recurrTimeFilter.endTime] as [
                Date,
                Date,
              ]
            }
          />
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button
          onClick={() => {
            closeModal();
          }}
          variant={"outline"}
        >
          Close
        </Button>
        <Button
          onClick={handleProceed}
          disabled={!value || loading}
          loading={loading}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default RecurringPrompt;
