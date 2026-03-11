"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import useVisitingFormSubmission from "../../logic";
import { useVisitingFormContext } from "../../store/visiting-form-context";
import { socializationSchema } from "../../logic/schema";
import { toast } from "@/components/ui/use-toast";

type SocializationFormData = z.infer<typeof socializationSchema>;

interface SocializationProps {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  username: string;
  admin?: boolean;
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
  "Basketball",
  "Bowling",
];

const communityIntegrationOptions = [
  "Visit to the library",
  "Visit to the zoo",
  "Visit to the museum",
  "Visit to the shopping mall",
  "Visit to the post office",
];

interface SocializationOutput {
  birthday_party: boolean;
  communication_session: boolean;
  social_group: boolean;
  music_dance_group: boolean;
  other_social_setting: boolean;
  specify_other_social_setting: string;
  play_at_the_park: boolean;
  basketball: boolean;
  watch_movie: boolean;
  bowling: boolean;
  swimming: boolean;
  other_recreation: boolean;
  specify_other_recreation: string;
  visit_to_the_library: boolean;
  visit_to_the_museum: boolean;
  visit_to_the_zoo: boolean;
  visit_to_the_shopping_mall: boolean;
  visit_to_the_post_office: boolean;
  other_community_integration: boolean;
  specify_other_community_integration: string;
}

const populateSocializationForm = (
  data: SocializationOutput,
  setValue: any
) => {
  setValue("socialSettings", [
    ...(data.birthday_party ? ["Birthday party"] : []),
    ...(data.social_group ? ["Social group"] : []),
    ...(data.communication_session ? ["Communication session"] : []),
    ...(data.music_dance_group ? ["Music/ dance group"] : []),
    ...(data.other_social_setting ? ["Other"] : []),
  ]);
  setValue("otherSocialSetting", data.specify_other_social_setting || "");

  setValue("recreationActivities", [
    ...(data.play_at_the_park ? ["Play at the park"] : []),
    ...(data.watch_movie ? ["Watch movie"] : []),
    ...(data.swimming ? ["Swimming"] : []),
    ...(data.basketball ? ["Basketball"] : []),
    ...(data.bowling ? ["Bowling"] : []),
    ...(data.other_recreation ? ["Other"] : []),
  ]);
  setValue("otherRecreationActivity", data.specify_other_recreation || "");

  setValue("communityIntegration", [
    ...(data.visit_to_the_library ? ["Visit to the library"] : []),
    ...(data.visit_to_the_zoo ? ["Visit to the zoo"] : []),
    ...(data.visit_to_the_museum ? ["Visit to the museum"] : []),
    ...(data.visit_to_the_shopping_mall ? ["Visit to the shopping mall"] : []),
    ...(data.visit_to_the_post_office ? ["Visit to the post office"] : []),
    ...(data.other_community_integration ? ["Other"] : []),
  ]);
  setValue(
    "otherCommunityIntegration",
    data.specify_other_community_integration || ""
  );
};

const Socialization: React.FC<SocializationProps> = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  username,
  admin,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<SocializationFormData>({
    resolver: zodResolver(socializationSchema),
    defaultValues: {
      socialSettings: [],
      recreationActivities: [],
      communityIntegration: [],
    },
  });

  const { submitSocialization } = useVisitingFormSubmission(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex
  );

  const { state } = useVisitingFormContext();
  const { step_two_form, isFormDisabled: stateDis } = state;
  const isFormDisabled = stateDis;

  useEffect(() => {
    if (step_two_form && step_two_form.socialization) {
      populateSocializationForm(
        step_two_form.socialization as unknown as SocializationOutput,
        setValue
      );
    }
  }, [step_two_form, setValue]);

  const onSubmit: SubmitHandler<SocializationFormData> = async (data) => {
    setLoading(true);
    const outputData: SocializationOutput = {
      birthday_party: data.socialSettings.includes("Birthday party"),
      communication_session: data.socialSettings.includes(
        "Communication session"
      ),
      social_group: data.socialSettings.includes("Social group"),
      music_dance_group: data.socialSettings.includes("Music/ dance group"),
      other_social_setting: data.socialSettings.includes("Other"),
      specify_other_social_setting: data.otherSocialSetting || "",
      play_at_the_park: data.recreationActivities.includes("Play at the park"),
      basketball: data.recreationActivities.includes("Basketball"),
      watch_movie: data.recreationActivities.includes("Watch movie"),
      bowling: data.recreationActivities.includes("Bowling"),
      swimming: data.recreationActivities.includes("Swimming"),
      other_recreation: data.recreationActivities.includes("Other"),
      specify_other_recreation: data.otherRecreationActivity || "",
      visit_to_the_library: data.communityIntegration.includes(
        "Visit to the library"
      ),
      visit_to_the_museum: data.communityIntegration.includes(
        "Visit to the museum"
      ),
      visit_to_the_zoo: data.communityIntegration.includes("Visit to the zoo"),
      visit_to_the_shopping_mall: data.communityIntegration.includes(
        "Visit to the shopping mall"
      ),
      visit_to_the_post_office: data.communityIntegration.includes(
        "Visit to the post office"
      ),
      other_community_integration: data.communityIntegration.includes("Other"),
      specify_other_community_integration: data.otherCommunityIntegration || "",
    };
    await submitSocialization(outputData);
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);

    try {
      const data = getValues();
      const outputData: SocializationOutput = {
        birthday_party: data.socialSettings.includes("Birthday party"),
        communication_session: data.socialSettings.includes(
          "Communication session"
        ),
        social_group: data.socialSettings.includes("Social group"),
        music_dance_group: data.socialSettings.includes("Music/ dance group"),
        other_social_setting: data.socialSettings.includes("Other"),
        specify_other_social_setting: data.otherSocialSetting || "",
        play_at_the_park:
          data.recreationActivities.includes("Play at the park"),
        basketball: data.recreationActivities.includes("Basketball"),
        watch_movie: data.recreationActivities.includes("Watch movie"),
        bowling: data.recreationActivities.includes("Bowling"),
        swimming: data.recreationActivities.includes("Swimming"),
        other_recreation: data.recreationActivities.includes("Other"),
        specify_other_recreation: data.otherRecreationActivity || "",
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
        specify_other_community_integration:
          data.otherCommunityIntegration || "",
      };
      await submitSocialization(outputData, true);
    } catch (error) {}
    setLoading(false);
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
      <h3
        data-testid="socialization-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Socialization/ Recreation/ Community Integration
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            {username} participated in the following social settings at the
            community:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {[...socialSettingsOptions, "Other"].map((setting, index) => (
              <div key={index} className="flex items-center gap-2">
                <Controller
                  name="socialSettings"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`social_${index}`}
                      checked={field.value.includes(setting)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...field.value, setting]
                          : field.value.filter((value) => value !== setting);
                        field.onChange(updatedValue);
                      }}
                      disabled={isFormDisabled}
                      data-testid={`social-setting-${setting
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                    />
                  )}
                />
                <Label
                  className="text-[14px] font-[400] text-[#09090B]"
                  htmlFor={`social_${index}`}
                >
                  {setting}
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
                  placeholder="Please specify other social setting"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  data-testid="other-social-setting"
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
            {[...recreationActivitiesOptions, "Other"].map(
              (activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Controller
                    name="recreationActivities"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={`recreation_${index}`}
                        checked={field.value.includes(activity)}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, activity]
                            : field.value.filter((value) => value !== activity);
                          field.onChange(updatedValue);
                        }}
                        disabled={isFormDisabled}
                        data-testid={`recreation-activity-${activity
                          .toLowerCase()
                          .replace(/\s+/g, "_")}`}
                      />
                    )}
                  />
                  <Label
                    className="text-[14px] font-[400] text-[#09090B]"
                    htmlFor={`recreation_${index}`}
                  >
                    {activity}
                  </Label>
                </div>
              )
            )}
          </div>

          {watch("recreationActivities").includes("Other") && (
            <Controller
              name="otherRecreationActivity"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelText=""
                  placeholder="Please specify other recreation activity"
                  type="text"
                  isAuth={false}
                  disabled={isFormDisabled}
                  data-testid="other-recreation-activity"
                />
              )}
            />
          )}
        </div>

        {/* Community Integration */}
        <div className="flex flex-col gap-5">
          <h4 className="text-[#0F172A] text-[18px] font-[600]">
            I supported {username} to participate in community integration
            activity during our:
          </h4>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {[...communityIntegrationOptions, "Other"].map(
              (activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Controller
                    name="communityIntegration"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={`community_${index}`}
                        disabled={isFormDisabled}
                        checked={field.value.includes(activity)}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, activity]
                            : field.value.filter((value) => value !== activity);
                          field.onChange(updatedValue);
                        }}
                        data-testid={`community-integration-${activity
                          .toLowerCase()
                          .replace(/\s+/g, "_")}`}
                      />
                    )}
                  />
                  <Label
                    className="text-[14px] font-[400] text-[#09090B]"
                    htmlFor={`community_${index}`}
                  >
                    {activity}
                  </Label>
                </div>
              )
            )}
          </div>

          {watch("communityIntegration").includes("Other") && (
            <Controller
              name="otherCommunityIntegration"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  disabled={isFormDisabled}
                  labelText=""
                  placeholder="Please specify other community integration activity"
                  type="text"
                  isAuth={false}
                  data-testid="other-community-integration"
                />
              )}
            />
          )}
        </div>

        {errors.socialSettings && (
          <p className="text-red-500">{errors.socialSettings.message}</p>
        )}
        {errors.recreationActivities && (
          <p className="text-red-500">{errors.recreationActivities.message}</p>
        )}
        {errors.communityIntegration && (
          <p className="text-red-500">{errors.communityIntegration.message}</p>
        )}

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%]">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              isLoading={loading}
              onClick={() => saveDraft()}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}
          {isFormDisabled ? (
            <Button
              isLoading={loading}
              onClick={() => {
                handleChangeIndex(currentIndex + 1);
              }}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={loading}
              data-testid="next-section-button"
            >
              Next Section <DoubleArrowRightIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default Socialization;
