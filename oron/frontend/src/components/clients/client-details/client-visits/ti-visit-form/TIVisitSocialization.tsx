"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/button/Button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormInput from "@/components/input-fields/FormInput";
import { toast } from "@/components/ui/use-toast";
import { submitRespiteSocialization } from "@/actions/clients/respite/respiteForm";
import { SingleRespiteForm } from "@/types/Respite";

const socializationSchema = z.object({
  socialSettings: z
    .array(z.string())
    .min(1, "Please select at least one social setting"),
  otherSocialSetting: z.string().optional(),
  recreationActivities: z
    .array(z.string())
    .min(1, "Please select at least one recreation activity"),
  otherRecreationActivity: z.string().optional(),
  communityIntegration: z
    .array(z.string())
    .min(1, "Please select at least one community integration activity"),
  otherCommunityIntegration: z.string().optional(),
});

type SocializationFormData = z.infer<typeof socializationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  tiForm: SingleRespiteForm["data"] | undefined;
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
}

const socialSettingsOptions = [
  "Birthday party",
  "Social group",
  "Communication session",
  "Music/ dance group",
];

const recreationActivitiesOptions = [
  "Play at the park",
  "Watch movie",
  "Swimming",
  "Basket ball",
  "Bowling",
];

const communityIntegrationOptions = [
  "Visit to the library",
  "Visit to the zoo",
  "Visit to the museum",
  "Visit to the shopping mall",
  "Visit to the post office",
];

const TIVisitSocialization = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  tiForm,
  isViewing,
  isEditing,
  username = "Client",
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const isFormDisabled = isViewing;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SocializationFormData>({
    resolver: zodResolver(socializationSchema),
    defaultValues: {
      socialSettings: [],
      otherSocialSetting: "",
      recreationActivities: [],
      otherRecreationActivity: "",
      communityIntegration: [],
      otherCommunityIntegration: "",
    },
  });

  useEffect(() => {
    if (!tiForm?.socialization) return;

    setMethod("PATCH");
    const { socialization } = tiForm;

    // Populate social settings
    const selectedSocialSettings = [];
    if (socialization.birthday_party)
      selectedSocialSettings.push("Birthday party");
    if (socialization.communication_session)
      selectedSocialSettings.push("Communication session");
    if (socialization.social_group) selectedSocialSettings.push("Social group");
    if (socialization.music_dance_group)
      selectedSocialSettings.push("Music/ dance group");
    setValue("socialSettings", selectedSocialSettings);

    if (socialization.other_social_setting) {
      setValue("socialSettings", [...selectedSocialSettings, "Other"]);
      setValue(
        "otherSocialSetting",
        socialization.specify_other_social_setting || ""
      );
    }

    // Populate recreation activities
    const selectedRecreationActivities = [];
    if (socialization.play_at_the_park)
      selectedRecreationActivities.push("Play at the park");
    if (socialization.basketball)
      selectedRecreationActivities.push("Basket ball");
    if (socialization.watch_movie)
      selectedRecreationActivities.push("Watch movie");
    if (socialization.bowling) selectedRecreationActivities.push("Bowling");
    if (socialization.swimming) selectedRecreationActivities.push("Swimming");
    setValue("recreationActivities", selectedRecreationActivities);

    if (socialization.other_recreation) {
      setValue("recreationActivities", [
        ...selectedRecreationActivities,
        "Other",
      ]);
      setValue(
        "otherRecreationActivity",
        socialization.specify_other_recreation || ""
      );
    }

    // Populate community integration
    const selectedCommunityIntegration = [];
    if (socialization.visit_to_the_library)
      selectedCommunityIntegration.push("Visit to the library");
    if (socialization.visit_to_the_museum)
      selectedCommunityIntegration.push("Visit to the museum");
    if (socialization.visit_to_the_zoo)
      selectedCommunityIntegration.push("Visit to the zoo");
    if (socialization.visit_to_the_shopping_mall)
      selectedCommunityIntegration.push("Visit to the shopping mall");
    if (socialization.visit_to_the_post_office)
      selectedCommunityIntegration.push("Visit to the post office");
    setValue("communityIntegration", selectedCommunityIntegration);

    if (socialization.other_community_integration) {
      setValue("communityIntegration", [
        ...selectedCommunityIntegration,
        "Other",
      ]);
      setValue(
        "otherCommunityIntegration",
        socialization.specify_other_community_integration || ""
      );
    }
  }, [tiForm, setValue]);

  const onSubmit = async (data: SocializationFormData) => {
    try {
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        birthday_party: data.socialSettings.includes("Birthday party"),
        communication_session: data.socialSettings.includes(
          "Communication session"
        ),
        social_group: data.socialSettings.includes("Social group"),
        music_dance_group: data.socialSettings.includes("Music/ dance group"),
        other_social_setting: data.socialSettings.includes("Other"),
        specify_other_social_setting: data.otherSocialSetting,
        play_at_the_park:
          data.recreationActivities.includes("Play at the park"),
        basketball: data.recreationActivities.includes("Basket ball"),
        watch_movie: data.recreationActivities.includes("Watch movie"),
        bowling: data.recreationActivities.includes("Bowling"),
        swimming: data.recreationActivities.includes("Swimming"),
        other_recreation: data.recreationActivities.includes("Other"),
        specify_other_recreation: data.otherRecreationActivity,
        visit_to_the_library: data.communityIntegration.includes(
          "Visit to the library"
        ),
        visit_to_the_museum: data.communityIntegration.includes(
          "Visit to the museum"
        ),
        visit_to_the_zoo:
          data.communityIntegration.includes("Visit to the zoo"),
        visit_to_the_shopping_mall: data.communityIntegration.includes(
          "Visit to the shopping mall"
        ),
        visit_to_the_post_office: data.communityIntegration.includes(
          "Visit to the post office"
        ),
        other_community_integration:
          data.communityIntegration.includes("Other"),
        specify_other_community_integration: data.otherCommunityIntegration,
      };

      const response = await submitRespiteSocialization(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.socialization?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (err) {
      console.error("ERROR SUBMITTING SOCIALIZATION", err);
      toast({
        variant: "destructive",
        description: "Failed to submit form",
      });
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const data = getValues();
      const token = localStorage.getItem("token") as string;

      const transformedData = {
        birthday_party: data.socialSettings.includes("Birthday party"),
        communication_session: data.socialSettings.includes(
          "Communication session"
        ),
        social_group: data.socialSettings.includes("Social group"),
        music_dance_group: data.socialSettings.includes("Music/ dance group"),
        other_social_setting: data.socialSettings.includes("Other"),
        specify_other_social_setting: data.otherSocialSetting,
        play_at_the_park:
          data.recreationActivities.includes("Play at the park"),
        basketball: data.recreationActivities.includes("Basket ball"),
        watch_movie: data.recreationActivities.includes("Watch movie"),
        bowling: data.recreationActivities.includes("Bowling"),
        swimming: data.recreationActivities.includes("Swimming"),
        other_recreation: data.recreationActivities.includes("Other"),
        specify_other_recreation: data.otherRecreationActivity,
        visit_to_the_library: data.communityIntegration.includes(
          "Visit to the library"
        ),
        visit_to_the_museum: data.communityIntegration.includes(
          "Visit to the museum"
        ),
        visit_to_the_zoo:
          data.communityIntegration.includes("Visit to the zoo"),
        visit_to_the_shopping_mall: data.communityIntegration.includes(
          "Visit to the shopping mall"
        ),
        visit_to_the_post_office: data.communityIntegration.includes(
          "Visit to the post office"
        ),
        other_community_integration:
          data.communityIntegration.includes("Other"),
        specify_other_community_integration: data.otherCommunityIntegration,
      };

      const response = await submitRespiteSocialization(
        token,
        transformedData,
        tiForm?.id || "",
        method,
        tiForm?.socialization?.id
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SAVING DRAFT", err);
      toast({
        variant: "destructive",
        description: "Failed to save draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        description: "Please complete all required fields",
      });
    }
  }, [errors]);

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Socialization/ Recreation/ Community Integration
      </h3>

      <form className="flex flex-col gap-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            {username} participated in the following social settings at the TI
            center/ community:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {[...socialSettingsOptions, "Other"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="socialSettings"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={field.value.includes(option)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, option]
                          : field.value.filter((value) => value !== option);
                        field.onChange(updatedValue);
                      }}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>

          {watch("socialSettings").includes("Other") && (
            <Controller
              name="otherSocialSetting"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  isError={!!errors.otherSocialSetting}
                  errorMessage={errors.otherSocialSetting?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I accompanied {username} to participate in the following recreation
            activity/event:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {[...recreationActivitiesOptions, "Other"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="recreationActivities"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={field.value.includes(option)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, option]
                          : field.value.filter((value) => value !== option);
                        field.onChange(updatedValue);
                      }}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>

          {watch("recreationActivities").includes("Other") && (
            <Controller
              name="otherRecreationActivity"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  isError={!!errors.otherRecreationActivity}
                  errorMessage={errors.otherRecreationActivity?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} to participate in community integration
            activity during our:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {[...communityIntegrationOptions, "Other"].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Controller
                  name="communityIntegration"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={option}
                      checked={field.value.includes(option)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, option]
                          : field.value.filter((value) => value !== option);
                        field.onChange(updatedValue);
                      }}
                      disabled={isFormDisabled}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={option}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>

          {watch("communityIntegration").includes("Other") && (
            <Controller
              name="otherCommunityIntegration"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  isError={!!errors.otherCommunityIntegration}
                  errorMessage={errors.otherCommunityIntegration?.message}
                />
              )}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
            >
              Save Draft
            </Button>
          )}

          {isFormDisabled ? (
            <Button onClick={() => handleChangeIndex(currentIndex + 1)}>
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default TIVisitSocialization;
