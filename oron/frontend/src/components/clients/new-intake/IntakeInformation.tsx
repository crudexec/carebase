"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DatePicker } from "../../calendar/CalendarSelect";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  IntakeInformationSchema,
  IntakeInformationFormData,
} from "@/utils/schemas";
import { validationEngine, validateForm } from "@/utils/validators";
import { handleIntakeInformationSubmission } from "@/actions/clients/new-intake/intake-information";
import { IntakeType } from "@/types/IntakeForm";
import { formatDateToUTCString } from "@/utils/date-utils";

export type PersonPresentAtIntake = {
  first_name: string;
  relationship_to_participant: string;
};

const IntakeInformation = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  prevSectionId,
  handleChangeSectionid,
  intakeForm,
  isEditing,
  isViewing,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  prevSectionId: string;
  handleChangeSectionid: (newId: string) => void;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;
  refetch: any;
}) => {
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [dateOfIntake, setDateOfIntake] = useState<string>("");
  const [peoplePresentAtIntake, setPeoplePresentAtIntake] = useState<
    PersonPresentAtIntake[]
  >([{ first_name: "", relationship_to_participant: "" }]);
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.intake_information_id
    ) {
      if (
        intakeForm?.peoplePresent &&
        Array.isArray(intakeForm?.peoplePresent) &&
        intakeForm?.peoplePresent?.length > 0
      ) {
        const retrievedPeoplePresent: PersonPresentAtIntake[] =
          intakeForm?.peoplePresent.map((item) => {
            return {
              first_name: item.first_name,
              relationship_to_participant: item.relationship_to_participant,
            };
          });

        setPeoplePresentAtIntake(
          intakeForm?.peoplePresent
            ? retrievedPeoplePresent
            : peoplePresentAtIntake
        );
      }

      setDateOfIntake(intakeForm?.intakeInformation?.date_of_intake);
      setRequestMethod("PATCH");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeForm]);

  const getDateOfIntake = (date: Date) => {
    setDateOfIntake(formatDateToUTCString(date));
  };

  const handleAddPerson = () => {
    setPeoplePresentAtIntake([
      ...peoplePresentAtIntake,
      { first_name: "", relationship_to_participant: "" },
    ]);
  };

  const handleChangePerson = (
    index: number,
    field: keyof PersonPresentAtIntake,
    value: string
  ) => {
    const updatedPeople = [...peoplePresentAtIntake];
    updatedPeople[index][field] = value;
    setPeoplePresentAtIntake(updatedPeople);
  };

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const whoConductedTheIntake = formData.get("conductedIntake") as string;

      const data: IntakeInformationFormData = {
        whoConductedTheIntake,
        dateOfIntake,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleIntakeInformationSubmission(
          data,
          peoplePresentAtIntake,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.referral_information_id ?? "-",
          intakeForm?.intake_information_id ?? "-",
          intakeForm?.id ?? "-"
        );

        await refetch();

        setIsSavingToDraft(false);

        if (!response.status) {
          toast({
            variant: "destructive",
            description: response.errorMessage,
          });
          return;
        }

        toast({
          variant: "success",
          description: "Draft Saved Successfully",
        });

        return;
      }

      // const validationResult = validationEngine(
      //   data,
      //   validateForm,
      //   IntakeInformationSchema
      // );

      // if (validationResult.field.length > 0) {
      //   setError(validationResult);
      //   toast({
      //     variant: "destructive",
      //     description: "Please complete all required fields.",
      //   });
      //   return;
      // }

      // if (peoplePresentAtIntake.length === 0) {
      //   setError({
      //     field: ["People present at the intake"],
      //     message: ["People present at the intake"],
      //   });
      //   toast({
      //     variant: "destructive",
      //     description: "Please add at least one person present at the intake",
      //   });
      //   return;
      // }

      // const invalidPersonIndex = peoplePresentAtIntake.findIndex(
      //   (person) =>
      //     person.first_name.trim() === "" ||
      //     person.relationship_to_participant.trim() === ""
      // );

      // if (invalidPersonIndex !== -1) {
      //   setError({
      //     field: ["People present at the intake"],
      //     message: ["People present at the intake"],
      //   });
      //   toast({
      //     variant: "destructive",
      //     description: `Person ${
      //       invalidPersonIndex + 1
      //     } data is incomplete. Please fill in all fields.`,
      //   });
      //   return;
      // }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleIntakeInformationSubmission(
        data,
        peoplePresentAtIntake,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.referral_information_id ?? "-",
        intakeForm?.intake_information_id ?? "-",
        intakeForm?.id ?? "-"
      );

      await refetch();

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeSectionid(response.errorMessage);
      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <section className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      <h3
        data-testid="intake-info-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Intake Information
      </h3>

      <form action={handleSubmit} className="flex flex-col gap-7">
        <div className="w-full flex flex-col xl:flex-row justify-between items-start gap-5">
          <FormInput
            defaultValue={
              intakeForm?.intakeInformation?.who_conducted_intake ?? ""
            }
            name="conductedIntake"
            placeholder="Enter the person's name"
            type="text"
            labelText="Who conducted the intake?"
            isAuth={false}
            errorMessage={error.message.find((message) =>
              message.includes("Who conducted the intake cannot be empty")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Who conducted the intake cannot be empty")
              )
            }
            disabled={isViewing}
            data-testid="conducted-intake-input"
          />
          <DatePicker
            defaultDate={
              dateOfIntake?.length > 1 ? new Date(dateOfIntake) : undefined
            }
            errorMessage={error.message.find((message) =>
              message.includes("Date of intake cannot be empty")
            )}
            isError={
              !!error.field.find((field) =>
                field.includes("Date of intake cannot be empty")
              )
            }
            label="Date of Intake"
            getDate={getDateOfIntake}
            disabled={isViewing}
            data-testid="date-of-intake-picker"
          />
        </div>

        <div className="flex flex-col gap-5 mt-5 pb-20">
          <h3
            className={`text-[#0F172A] text-[18px] font-[600] ${
              !!error.field.find((field) =>
                field.includes("People present at the intake")
              ) && "text-[#EF4444]"
            } `}
          >
            People present at the intake
          </h3>

          {peoplePresentAtIntake.map((person, index) => (
            <div
              key={index + 1}
              className="w-full mt-2 flex flex-col xl:flex-row justify-between items-start gap-5 border-[1px] border-[#EAECF0] shadow-md p-5 rounded-[12px]"
            >
              <FormInput
                disabled={isViewing}
                name={`firstName${index}`}
                placeholder="Enter participant's first name"
                type="text"
                labelText={`First Name (Person ${index + 1})`}
                value={person.first_name}
                onChange={(e) =>
                  handleChangePerson(index, "first_name", e.target.value)
                }
                isAuth={false}
                data-testid={`person-first-name-${index}`}
              />
              <FormInput
                disabled={isViewing}
                name={`relationToParticipant${index}`}
                placeholder="Enter relation to participant"
                type="text"
                labelText={`Relation to participant (Person ${index + 1})`}
                value={person.relationship_to_participant}
                onChange={(e) =>
                  handleChangePerson(
                    index,
                    "relationship_to_participant",
                    e.target.value
                  )
                }
                isAuth={false}
                data-testid={`person-relation-${index}`}
              />
            </div>
          ))}

          {!isViewing && (
            <Button
              disabled={isViewing}
              type="button"
              variant="light"
              onClick={handleAddPerson}
              data-testid="add-person-button"
            >
              <PlusIcon className={`${isViewing && "text-gray-400"} w-5 h-5`} />
              Add Person
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-full">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            Previous Section
          </Button>

          {!isViewing && (
            <Button
              disabled={isViewing}
              variant="light"
              type="submit"
              onClick={() => {
                setIsSavingToDraft(true);
              }}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          <Button data-testid="next-section-button" type="submit">
            Next Section
          </Button>
        </div>
      </form>
    </section>
  );
};

export default IntakeInformation;
