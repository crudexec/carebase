"use client";

import { useState, useEffect } from "react";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { AboutParticipantFormData } from "@/utils/schemas";
import FormTextArea from "@/components/input-fields/FormTextArea";
import { handleMoreAboutClientSubmission } from "@/actions/clients/new-intake/more-about-client";
import { IntakeType } from "@/types/IntakeForm";

const AboutParticipant = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  prevSectionId,
  handleChangeSectionid,
  intakeForm,
  isEditing,
  isViewing,refetch
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  prevSectionId: string;
  handleChangeSectionid: (newId: string) => void;
  intakeForm: IntakeType | undefined;
  isEditing?: boolean;
  isViewing?: boolean;refetch: any;
}) => {
  const { toast } = useToast();
  const [communicationMethods, setCommunicationMethods] = useState<string[]>(
    []
  );
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  const [requestMethod, setRequestMethod] = useState<"POST" | "PATCH">("POST");
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  useEffect(() => {
    if (
      intakeForm &&
      typeof intakeForm === "object" &&
      Object.keys(intakeForm).length > 0 &&
      intakeForm?.more_about_information_id
    ) {
      setRequestMethod("PATCH");
      if (
        Array.isArray(
          intakeForm?.moreAboutInformation?.familiar_communication_modes
        )
      ) {
        setCommunicationMethods(
          intakeForm?.moreAboutInformation?.familiar_communication_modes
        );
      }
    }
  }, [intakeForm]);

  let defaultValue: string | undefined;
  const canBeTransportedAlone =
    intakeForm?.moreAboutInformation?.can_be_transported_alone;

  if (canBeTransportedAlone === undefined || canBeTransportedAlone === null) {
    defaultValue = undefined;
  } else if (canBeTransportedAlone === true) {
    defaultValue = "Yes";
  } else {
    defaultValue = "No";
  }

  const handleSubmit = async (formData: FormData) => {
    if (isViewing) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    try {
      const strengths = formData.get("strengths") as string;
      const thingsINeedHelpWith = formData.get("weaknesses") as string;
      const newSkillsToLearn = formData.get("newSkillsToLearn") as string;
      const hobbies = formData.get("hobbies") as string;
      const favoriteFood = formData.get("favoriteFood") as string;
      const whatMakesMeMad = formData.get("whatMakesMeMad") as string;
      const behaviorsDisplayed = formData.get("behaviorsDisplayed") as string;
      const behaviorManagement = formData.get("behaviorManagement") as string;
      const houseRules = formData.get("houseRules") as string;
      const transportAlone = formData.get("transportAlone") as string;
      const toileting = formData.get("toileting") as string;
      const preferredCareBy = formData.get("preferredCareBy") as string;
      const intakeDocument = formData.get("intakeDocument") as string;
      const performanceReward = formData.get("performanceReward") as string;
      const otherComments = formData.get("otherComments") as string;

      const data: AboutParticipantFormData = {
        strengths,
        thingsINeedHelpWith,
        newSkillsToLearn,
        hobbies,
        favoriteFood,
        whatMakesMeMad,
        behaviorsDisplayed,
        behaviorManagement,
        houseRules,
        transportAlone: transportAlone ?? "",
        toileting: toileting ?? "",
        preferredCareBy: preferredCareBy ?? "",
        intakeDocument: intakeDocument ?? "",
        performanceReward,
        otherComments,
      };

      if (isSavingToDraft === true) {
        const token = localStorage.getItem("token") as string;
        const response = await handleMoreAboutClientSubmission(
          data,
          communicationMethods,
          token,
          requestMethod,
          prevSectionId && prevSectionId?.length > 1
            ? prevSectionId
            : intakeForm?.service_coordinator_information_id ?? "-",
          intakeForm?.more_about_information_id ?? "-",
          intakeForm?.id ?? "-"
        );

        await refetch()

        setIsSavingToDraft(false);

        if (!response.status) {
          toast({
            variant: "destructive",
            description:
              response.errorMessage ??
              "An error occurred while submitting form! try again",
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
      //   AboutParticipantSchema
      // );
      // if (validationResult.field.length > 0) {
      //   if (communicationMethods.length < 1) {
      //     setError({
      //       field: [...validationResult.field, "communicationMethods"],
      //       message: [...validationResult.message, "communicationMethods"],
      //     });
      //   } else {
      //     setError(validationResult);
      //   }

      //   toast({
      //     variant: "destructive",
      //     description: "Please complete all required fields.",
      //   });
      //   return;
      // }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleMoreAboutClientSubmission(
        data,
        communicationMethods,
        token,
        requestMethod,
        prevSectionId && prevSectionId?.length > 1
          ? prevSectionId
          : intakeForm?.service_coordinator_information_id ?? "-",
        intakeForm?.more_about_information_id ?? "-",
        intakeForm?.id ?? "-"
      );

      await refetch()

      if (!response.status) {
        toast({
          variant: "destructive",
          description:
            response.errorMessage ??
            "An error occurred while submitting form! try again",
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

  const communicationMethod = [
    {
      label: "Verbal",
      value: "Verbal",
    },
    {
      label: "Non-Verbal",
      value: "Non_Verbal",
    },
    {
      label: "Sign Language",
      value: "Sign_Language",
    },
    {
      label: "PECS",
      value: "PECS",
    },
  ];

  return (
    <form
      action={handleSubmit}
      className="flex-1 h-fit flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      <h3
        data-testid="more-about-client-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        More About Client
      </h3>

      <div className="w-full flex flex-col gap-5 pb-[5vh]">
        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.things_I_can_do_by_myself ?? ""
          }
          labelText="Things I can do by myself (Strengths)"
          placeholder="Enter here.."
          name="strengths"
          errorMessage={error.message.find((message) =>
            message.includes("Strengths")
          )}
          isError={!!error.field.find((field) => field.includes("Strengths"))}
          disabled={isViewing}
          data-testid="things-i-can-do-myself"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.things_I_need_help_with ?? ""
          }
          labelText="Things I need help with (Weaknesses)"
          placeholder="Enter here.."
          name="weaknesses"
          errorMessage={error.message.find((message) =>
            message.includes("Weaknesses")
          )}
          isError={!!error.field.find((field) => field.includes("Weaknesses"))}
          disabled={isViewing}
          data-testid="things-i-need-help-with"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.new_skills_I_want_to_learn ?? ""
          }
          labelText="New skills i'd like to learn"
          placeholder="Enter here.."
          name="newSkillsToLearn"
          errorMessage={error.message.find((message) =>
            message.includes("New skills")
          )}
          isError={!!error.field.find((field) => field.includes("New skills"))}
          disabled={isViewing}
          data-testid="new-skills-to-learn"
        />

        <FormTextArea
          defaultValue={intakeForm?.moreAboutInformation?.my_hobbies ?? ""}
          labelText="My hobbies"
          placeholder="Enter here.."
          name="hobbies"
          errorMessage={error.message.find((message) =>
            message.includes("My hobbies")
          )}
          isError={!!error.field.find((field) => field.includes("My hobbies"))}
          disabled={isViewing}
          data-testid="hobbies"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.favorite_food_and_snacks ?? ""
          }
          labelText="My favourite food/snacks"
          placeholder="Enter here.."
          name="favoriteFood"
          errorMessage={error.message.find((message) =>
            message.includes("My favorite food/snacks")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("My favorite food/snacks")
            )
          }
          disabled={isViewing}
          data-testid="favourite-food"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.what_makes_me_mad ?? ""
          }
          labelText="What makes me mad"
          placeholder="Enter here.."
          name="whatMakesMeMad"
          errorMessage={error.message.find((message) =>
            message.includes("What makes me mad")
          )}
          isError={
            !!error.field.find((field) => field.includes("What makes me mad"))
          }
          disabled={isViewing}
          data-testid="what-makes-me-mad"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation?.behaviors_I_sometimes_Display ??
            ""
          }
          labelText="Behaviours I sometimes display"
          placeholder="Enter here.."
          name="behaviorsDisplayed"
          errorMessage={error.message.find((message) =>
            message.includes("Behaviors I sometimes display")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Behaviors I sometimes display")
            )
          }
          disabled={isViewing}
          data-testid="behaviour-i-sometimes-display"
        />

        <FormTextArea
          defaultValue={
            intakeForm?.moreAboutInformation
              ?.ways_my_behaviors_can_be_managed ?? ""
          }
          labelText="Ways my behaviours can be managed"
          placeholder="Enter here.."
          name="behaviorManagement"
          errorMessage={error.message.find((message) =>
            message.includes("Ways my behaviors can be managed")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("Ways my behaviors can be managed")
            )
          }
          disabled={isViewing}
          data-testid="ways-my-behaviour-can-be-managed"
        />

        <FormTextArea
          defaultValue={intakeForm?.moreAboutInformation?.my_house_rules ?? ""}
          labelText="My house rules"
          placeholder="Enter here.."
          name="houseRules"
          errorMessage={error.message.find((message) =>
            message.includes("My house rules")
          )}
          isError={
            !!error.field.find((field) => field.includes("My house rules"))
          }
          disabled={isViewing}
          data-testid="house-rules"
        />

        <div className="flex flex-col gap-3">
          <Label
            className={`text-[15px] text-[#0F172A] ${
              !!error.field.find((field) =>
                field.includes("communicationMethods")
              ) && "text-[#EF4444]"
            } `}
          >
            I am familiar with the following communication modes (tick all that
            apply)
          </Label>

          <div className="grid gap-5 lg:grid-cols-2 xl:w-[60%]">
            {communicationMethod.map((item) => (
              <div
                key={item.value}
                className="flex items-center gap-2 rounded-md"
              >
                <Checkbox
                  data-testid={`checkbox-${item.value}`}
                  disabled={isViewing}
                  id={item.value}
                  defaultChecked={
                    communicationMethods.includes(item.value) ||
                    (intakeForm?.moreAboutInformation
                      ?.familiar_communication_modes &&
                      intakeForm?.moreAboutInformation?.familiar_communication_modes?.includes(
                        item.value
                      ))
                  }
                  onCheckedChange={(e) => {
                    if (
                      e === true &&
                      !communicationMethods.includes(item.value)
                    ) {
                      setCommunicationMethods([
                        ...communicationMethods,
                        item.value,
                      ]);
                    } else if (
                      e === false &&
                      communicationMethods.includes(item.value)
                    ) {
                      setCommunicationMethods(
                        communicationMethods.filter(
                          (method) => method !== item.value
                        )
                      );
                    }
                  }}
                />
                <Label htmlFor={item.value}>{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <RadioGroup
          disabled={isViewing}
          defaultValue={defaultValue}
          name="transportAlone"
          className="flex flex-col gap-5"
          data-testid="radio-group-transport-alone"
        >
          <Label
            className={`text-[15px] text-[#0F172A] ${
              !!error.field.find((field) =>
                field.includes("I can be transported alone")
              ) && "text-[#EF4444]"
            } `}
          >
            I can be transported alone
          </Label>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Yes"
                value="Yes"
                data-testid="radio-item-transport-alone-yes"
              />
              <Label
                htmlFor="Yes"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Yes
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="No"
                value="No"
                data-testid="radio-item-transport-alone-no"
              />
              <Label
                htmlFor="No"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                No
              </Label>
            </div>
          </div>
        </RadioGroup>

        <RadioGroup
          disabled={isViewing}
          defaultValue={
            intakeForm?.moreAboutInformation?.toileting ?? undefined
          }
          name="toileting"
          className="flex flex-col gap-5"
          data-testid="radio-group-toileting"
        >
          <Label
            className={`text-[15px] text-[#0F172A] ${
              !!error.field.find((field) => field.includes("For toileting")) &&
              "text-[#EF4444]"
            } `}
          >
            For toileting, I am
          </Label>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Toilet trained"
                value="Toilet_Trained"
                data-testid="radio-item-toilet-trained"
              />
              <Label
                htmlFor="Toilet trained"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Toilet trained
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Not toilet trained"
                value="Not_Toilet_Trained"
                data-testid="radio-item-not-toilet-trained"
              />
              <Label
                htmlFor="Not toilet trained"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Not toilet trained
              </Label>
            </div>{" "}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Toilet trained, but requires supervision"
                value="Toilet_Trained_But_Requires_Supervision"
                data-testid="radio-item-toilet-trained-but-requires-supervision"
              />
              <Label
                htmlFor="Toilet trained, but requires supervision"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Toilet trained, but requires supervision
              </Label>
            </div>
          </div>
        </RadioGroup>

        <RadioGroup
          disabled={isViewing}
          defaultValue={
            intakeForm?.moreAboutInformation?.cared_for_by ?? undefined
          }
          name="preferredCareBy"
          className="flex flex-col gap-5"
          data-testid="radio-group-preferred-cared-by"
        >
          <Label
            className={`text-[15px] text-[#0F172A] ${
              !!error.field.find((field) =>
                field.includes("I preferred to be cared")
              ) && "text-[#EF4444]"
            } `}
          >
            I preferred to be cared for by
          </Label>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Male"
                value="male"
                data-testid="radio-item-preferred-cared-by-male"
              />
              <Label
                htmlFor="Male"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Male
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Female"
                value="female"
                data-testid="radio-item-preferred-cared-by-female"
              />
              <Label
                htmlFor="Female"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Female
              </Label>
            </div>{" "}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="No preference"
                value="no_preference"
                data-testid="radio-item-preferred-cared-by-no-preference"
              />
              <Label
                htmlFor="No preference"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                No preference
              </Label>
            </div>
          </div>
        </RadioGroup>

        <RadioGroup
          disabled={isViewing}
          defaultValue={
            intakeForm?.moreAboutInformation?.document_provided_during_intake ??
            undefined
          }
          name="intakeDocument"
          className="flex flex-col gap-5"
          data-testid="radio-group-intake-document"
        >
          <Label
            className={`text-[15px] text-[#0F172A] ${
              !!error.field.find((field) =>
                field.includes("Document provided")
              ) && "text-[#EF4444]"
            } `}
          >
            Document provided during intake
          </Label>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="iep"
                value="IEP"
                data-testid="radio-item-intake-document-iep"
              />
              <Label
                htmlFor="iep"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                IEP
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Behaviour plan"
                value="Behavior_Plan"
                data-testid="radio-item-intake-document-behaviour-plan"
              />
              <Label
                htmlFor="Behaviour plan"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Behaviour plan
              </Label>
            </div>{" "}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="Psychological evaluation"
                value="Psychological_Evaluation"
                data-testid="radio-item-intake-document-psychological-evaluation"
              />
              <Label
                htmlFor="Psychological evaluation"
                className="text-[16px] font-[400] text-[#09090B]"
              >
                Psychological evaluation
              </Label>
            </div>
          </div>
        </RadioGroup>

        <FormTextArea
          disabled={isViewing}
          defaultValue={
            intakeForm?.moreAboutInformation?.good_performance_reward ??
            undefined
          }
          labelText="For good performance, I like to be rewarded with"
          placeholder="Enter here.."
          name="performanceReward"
          errorMessage={error.message.find((message) =>
            message.includes("For good performance")
          )}
          isError={
            !!error.field.find((field) =>
              field.includes("For good performance")
            )
          }
          data-testid="good-performance"
        />

        <FormTextArea
          disabled={isViewing}
          defaultValue={
            intakeForm?.moreAboutInformation?.other_comments ?? undefined
          }
          labelText="Other comments"
          placeholder="Enter here.."
          name="otherComments"
          errorMessage={error.message.find((message) =>
            message.includes("Other comments")
          )}
          isError={
            !!error.field.find((field) => field.includes("Other comments"))
          }
          data-testid="other-comments"
        />
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
  );
};

export default AboutParticipant;
