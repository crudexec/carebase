"use client";

import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { User } from "@/types/UserTypes";
import { capitalizeFirstLetter } from "@/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "../../../calendar/CalendarSelect";
import { FluVaccineFormResponse } from "@/types/form-types/FluVaccineFormTypes";
import FormBanner from "@/components/banner/FormBanner";
import useLogic from "../logic/vaccine-information/useLogic";
import { REDUCER_ACTION_TYPE } from "../logic/vaccine-information/reducer";
import { formatDateToUTCString } from "@/utils/date-utils";

const VaccineInformation = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  data: FluVaccineFormResponse | boolean | undefined;
}) => {
  const {
    state,
    dispatch,
    mutate,
    getDefaultValueOne,
    getDefaultValueTwo,
    status,
  } = useLogic(
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    refetch,
    method,
    data
  );
  const { error, isFormDisabled, formData } = state;
  const { selectedOption, selectedOther, date_received_flu_vaccine, other } =
    formData;

  return (
    <section className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {status === "awaiting_approval" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <div className="flex flex-col gap-5">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">
          Flu Vaccine Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          I,{" "}
          <span className="font-[700]">
            {capitalizeFirstLetter(
              `${user.data.first_name} ${user.data.last_name}`
            )}
          </span>
          <span>
            , acknowledge that Creed Medical Group recommends that all employees
            receive the annual flu vaccine to protect against influenza, as
            recommended by the Centers for Disease Control and Prevention (CDC)
            and other health authorities.
          </span>
        </p>
      </div>

      <form action={mutate} className="flex flex-col gap-5">
        <p className="text-[#334155] text-[14px] font-[400]">
          Please select one of the following options
        </p>

        <RadioGroup
          disabled={isFormDisabled}
          defaultValue={getDefaultValueOne()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value === "no") {
              dispatch({
                type: REDUCER_ACTION_TYPE.SET_SELECTED_OPTION,
                payload: {
                  selectedOption: "no",
                },
              });
            } else {
              dispatch({
                type: REDUCER_ACTION_TYPE.SET_SELECTED_OPTION,
                payload: {
                  selectedOption: "yes",
                },
              });
            }
          }}
          name="vaccine_status"
          className="flex flex-col gap-5"
        >
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="1" value="yes" />
              <Label
                className={`text-[16px] font-[400] text-[#09090B] ${
                  error.field.includes("yes") && "text-[#EF4444]"
                } `}
                htmlFor="1"
              >
                <span className="font-[700]">Vaccination Attestation:</span>I
                have received the flu vaccine as recommended
              </Label>
            </div>

            <div
              className={`flex items-center gap-2 ${
                selectedOption === "yes" &&
                "mt-[200px] lg:mt-[200px] xl:mt-[120px]"
              } `}
            >
              <RadioGroupItem id="2" value="no" />
              <Label
                className={`text-[16px] font-[400] text-[#09090B] ${
                  error.field.includes("yes") && "text-[#EF4444]"
                } `}
                htmlFor="2"
              >
                <span className="font-[700]">Vaccination Declination:</span>I
                decline to receive the flu vaccine for the current flu season
                for the following reason(s)
              </Label>
            </div>
          </div>
        </RadioGroup>

        {selectedOption === "yes" && (
          <div className="w-full relative top-[-260px] xl:top-[-170px] flex flex-col xl:flex-row justify-between items-start gap-5">
            <DatePicker
              disabled={isFormDisabled}
              defaultDate={
                date_received_flu_vaccine.length > 1
                  ? new Date(date_received_flu_vaccine)
                  : undefined
              }
              label="Date Of Vaccination"
              getDate={(date) =>
                dispatch({
                  type: REDUCER_ACTION_TYPE.SET_VACCINATION_DATE,
                  payload: {
                    vaccinationDate: formatDateToUTCString(date),
                  },
                })
              }
              errorMessage={error.message.find((message) =>
                message.includes("date")
              )}
              isError={!!error.field.find((field) => field.includes("date"))}
            />
          </div>
        )}

        {selectedOption === "no" && (
          <div className="flex flex-col gap-3 xl:mt-3 xl:ml-6">
            <RadioGroup
              disabled={isFormDisabled}
              defaultValue={getDefaultValueTwo()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.value === "other") {
                  dispatch({
                    type: REDUCER_ACTION_TYPE.SET_SELECTED_OTHER,
                    payload: {
                      selectedOther: true,
                    },
                  });
                } else {
                  dispatch({
                    type: REDUCER_ACTION_TYPE.SET_SELECTED_OTHER,
                    payload: {
                      selectedOther: false,
                    },
                  });
                }
              }}
              name="decline_reasons"
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_1"
                  value="received_flu_vaccine_elsewhere"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_1"
                >
                  I have already received the flu vaccine elsewhere
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_2"
                  value="medical_contraindication_to_receiving_vaccine"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_2"
                >
                  I have medical contraindications to receiving the flu vaccine
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_3"
                  value="personal_or_religious_beliefs_preventing_vaccination"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_3"
                >
                  I have personal or religious beliefs that prevent me from
                  receiving the flu vaccine
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_4"
                  value="allergic_to_vaccine_components"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_4"
                >
                  I am allergic to components of the flu vaccine
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_5"
                  value="concerns_about_vaccine_safety"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_5"
                >
                  I have concerns about the safety or efficacy of the flu
                  disease
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="reason_6" value="other" />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_6"
                >
                  Other
                </Label>
              </div>
            </RadioGroup>

            {selectedOther && (
              <div className="xl:ml-5">
                <FormInput
                  defaultValue={other ?? ""}
                  disabled={isFormDisabled}
                  name="other"
                  placeholder="Please specify"
                  type="text"
                  labelText=""
                  isAuth={false}
                  errorMessage={error.message.find((message) =>
                    message.includes("input")
                  )}
                  isError={
                    !!error.field.find((field) => field.includes("other"))
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            variant="light"
          >
            Previous Section
          </Button>

          {currentIndex !== 4 && <Button type="submit">Next Section</Button>}
        </div>
      </form>
    </section>
  );
};

export default VaccineInformation;
