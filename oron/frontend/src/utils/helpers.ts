import { format, parseISO } from "date-fns";
import { BASE_LINE, GoalsData, goalsData } from "@/constants";
import { ThirdFormData } from "@/components/clients/client-details/client-visits/visit-form/store/reducer";
import { TreatmentPlanData } from "@/components/clients/client-details/client-tabs/assessment-tab/DownloadTreatmentPDF";

interface Step {
  id: string;
  taskAnalysis: string;
  baseline: string[];
}
// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Function to format file size in bytes to a human-readable format
const formatFileSize = (fileSizeInBytes: number): string => {
  if (fileSizeInBytes < 1024) {
    // If size is less than 1KB
    return fileSizeInBytes + " B"; // Return the size in bytes
  } else if (fileSizeInBytes < 1024 * 1024) {
    // If size is less than 1MB
    return Math.round(fileSizeInBytes / 1024) + " KB"; // Return the size in kilobytes
  } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
    // If size is less than 1GB
    return Math.round(fileSizeInBytes / (1024 * 1024)) + " MB"; // Return the size in megabytes
  } else if (fileSizeInBytes < 1024 * 1024 * 1024 * 1024) {
    // If size is less than 1TB
    return Math.round(fileSizeInBytes / (1024 * 1024 * 1024)) + " GB"; // Return the size in gigabytes
  } else {
    // If size is greater than or equal to 1TB
    return Math.round(fileSizeInBytes / (1024 * 1024 * 1024 * 1024)) + " TB"; // Return the size in terabytes
  }
};

export const formatCurrency = (value: string): string => {
  if (!value) {
    return "";
  }
  const numberValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
  if (isNaN(numberValue)) {
    return "";
  }
  return numberValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
};

export const cleanCurrencyInput = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

// Function to format Social Security Number (SSN) with hyphens
const formatSSN = (value: string) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  const formattedValue = value.replace(/\D/g, "").substring(0, 9); // Remove non-numeric characters and limit to 9 digits
  const parts = RegExp(/^(\d{0,3})(\d{0,2})(\d{0,4})$/).exec(formattedValue); // Split into groups for the correct SSN format

  if (parts) {
    // If parts are found
    return `${parts[1]}${parts[1] && parts[2] ? "-" : ""}${parts[2]}${
      (parts[1] || parts[2]) && parts[3] ? "-" : ""
    }${parts[3]}`; // Format with hyphens
  }

  return formattedValue; // Return the formatted value
};

const revertFormattedSSN = (value: string) => {
  return value.replace(/-/g, "");
};

// Function to check if two sets are equal
const setsAreEqual = (setA: any, setB: any) => {
  if (setA.size !== setB.size) {
    // If sizes are different, sets are not equal
    return false;
  }
  for (let item of setA) {
    // Iterate over items in setA
    if (!setB.has(item)) {
      // If an item in setA is not in setB, sets are not equal
      return false;
    }
  }
  return true; // If no differences found, sets are equal
};

// Function to format a date using the 'date-fns' library
// const formatDate = (date: Date) => {
//   try {
//     if (!date) {
//       return "";
//     }
//     const formattedDate = format(date, "PPP"); // Format the date using 'PPP' format

//     return formattedDate;
//   } catch (error) {
//     console.error("DATE ERROR", error);
//   }
//   // Return the formatted date
// };

const formatDate = (dateInput: string | Date) => {
  try {
    if (!dateInput) {
      return "";
    }

    let ds = dateInput;
    if (typeof dateInput === "string") {
      const date = new Date(dateInput);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      ds = date;

      const formattedDate = format(ds, "PPP"); // Format the date using 'PPP' format
      return formattedDate;
    } else {
      const formattedDate = format(dateInput, "PPP"); // Format the date using 'PPP' format
      return formattedDate;
    }
    // Parse the string date into a valid Date object
  } catch (error) {
    console.error("DATE ERROR", error);
    return "";
  }
};

const objectToFormData = (
  obj: object,
  formData = new FormData(),
  parentKey = ""
) => {
  for (const [key, value] of Object.entries(obj)) {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof Date) {
      formData.append(formKey, value.toISOString());
    } else if (value instanceof File) {
      formData.append(formKey, value, value.name);
    } else if (typeof value === "object" && value !== null) {
      objectToFormData(value, formData, formKey);
    } else {
      if (typeof value === "string") {
        const valueAsString = value;
        formData.append(formKey, valueAsString.toString());
      }
    }
  }

  return formData;
};

const formatPhoneNumber = (value: string) => {
  if (!value) {
    return "";
  }
  // Remove all non-digit characters except for the leading '+'
  value = value.replace(/[^\d+]/g, "");

  // Add the leading '+1 ' if not already present
  if (!value.startsWith("+1") && value.length >= 1 && !value.startsWith("+")) {
    value = "+1" + value.replace(/^\+?/, ""); // Remove any leading '+' before adding "+1"
  }

  // Format the phone number according to the pattern +1 (555) 000-0000
  if (value.length > 2) {
    value = `${value.slice(0, 2)} (${value.slice(2)}`;
  }
  if (value.length > 7) {
    value = `${value.slice(0, 7)}) ${value.slice(7)}`;
  }
  if (value.length > 12) {
    value = `${value.slice(0, 12)}-${value.slice(12)}`;
  }
  if (value.length > 17) {
    value = value.slice(0, 17);
  }

  return value;
};

const revertFormattedPhoneNumber = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  // Remove all non-digit characters except the leading '+'
  return value.replace(/[^\d+]/g, '');
};

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const getSecondLevelGoalAreaKeys = (firstLevelKey: keyof GoalsData) => {
  if (goalsData[firstLevelKey]) {
    return Object.keys(goalsData[firstLevelKey]);
  }
  return [];
};

// Function to get third level data
export const getThirdLevelGoalData = (
  firstLevelKey: keyof GoalsData,
  secondLevelKey: string
): string[] => {
  const secondLevelData = goalsData[firstLevelKey]?.[secondLevelKey];

  if (Array.isArray(secondLevelData)) {
    return secondLevelData;
  }

  if (secondLevelData && typeof secondLevelData === "object") {
    return Object.keys(secondLevelData);
  }

  return [];
};

export const getFourthLevelGoalData = (
  firstLevelKey: keyof GoalsData,
  secondLevelKey: string,
  thirdLevelKey: string
): Step[] => {
  const thirdLevelData =
    goalsData[firstLevelKey]?.[secondLevelKey]?.[thirdLevelKey];
  if (thirdLevelData) {
    if (Array.isArray(thirdLevelData)) {
      return thirdLevelData.map((task, index) => ({
        id: (index + 1).toString(),
        taskAnalysis: task,
        baseline: BASE_LINE,
      }));
    } else if (typeof thirdLevelData === "object") {
      return Object.values(thirdLevelData)
        .flat()
        .map((task, index) => ({
          id: (index + 1).toString(),
          taskAnalysis: task as string,
          baseline: BASE_LINE,
        }));
    }
  }
  return [];
};

type InputTask = {
  task_analysis: string;
  baseline: string;
};

type Task = {
  id: string;
  taskAnalysis: string;
  baseline: string[];
};

type OutputTask = {
  id: string;
  taskAnalysis: string;
  baseline: string;
  checked: boolean;
};
interface Document {
  title: string;
  issuing_authority: string;
  document_number: string;
  file_url: string;
  expiration_date: string | null;
}

export const removeEmptyStrings = (doc: Document): Partial<Document> => {
  return Object.fromEntries(
    Object.entries(doc).filter(([_, value]) => value !== "")
  ) as Partial<Document>;
};

const processTasks = (inputTasks: InputTask[], tasks: Task[]): OutputTask[] => {
  return tasks.map((task) => {
    const inputTask = inputTasks.find(
      (t) => t.task_analysis === task.taskAnalysis
    );

    if (inputTask) {
      return {
        ...task,
        baseline: inputTask.baseline,
        checked: true,
      };
    }

    return {
      ...task,
      baseline: "",
      checked: false,
    };
  });
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

export const convertStringArrayToSelectArray = (arr: string[]) =>
  arr.map((val) => ({ label: val, value: val }));

const getErrorMessage = (error: any): string | undefined => {
  if (error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
};

type MealTimeData = {
  mealProvided?: string;
  clean: string;
  selectedOptions: string[];
  supportProvided: string[];
};

type ConvertedData = {
  [key: string]: boolean;
};

export function convertMealTimeData(data: MealTimeData): ConvertedData {
  const result: ConvertedData = {};

  // Process selectedOptions
  data.selectedOptions.forEach((option) => {
    result[option] = true;
  });

  // Process supportProvided
  data.supportProvided.forEach((support) => {
    result[support] = true;
  });

  return result;
}

type ChoresInput = {
  chores: string[];
  other: string;
};

const choresMap: {
  [key: string]: keyof Omit<ChoresOutput, "other" | "specify_other">;
} = {
  "Make bed": "assist_to_make_bed",
  "Dust furniture": "assist_to_dust_furniture",
  Vacuum: "assist_to_vacuum",
  "Arrange clothes": "assist_to_arrange_clothes",
  Laundry: "assist_to_laundry",
  "Do dishes": "assist_to_do_dishes",
  "Remove trash": "assist_to_remove_trash",
  "Fold clothes": "assist_to_fold_clothes",
};

export function convertChores(input: ChoresInput | any): ChoresOutput {
  const output: ChoresOutput = {
    assist_to_make_bed: false,
    assist_to_dust_furniture: false,
    assist_to_vacuum: false,
    assist_to_arrange_clothes: false,
    assist_to_laundry: false,
    assist_to_do_dishes: false,
    assist_to_remove_trash: false,
    assist_to_fold_clothes: false,
    other: false,
    specify_other: input.other,
  };

  input.chores.forEach((chore: any) => {
    const key = choresMap[chore];
    if (key) {
      output[key] = true;
    } else {
      output.other = true;
      output.specify_other = chore;
    }
  });

  return output;
}
export type ChoresOutput = {
  assist_to_make_bed: boolean;
  assist_to_dust_furniture: boolean;
  assist_to_vacuum: boolean;
  assist_to_arrange_clothes: boolean;
  assist_to_laundry: boolean;
  assist_to_do_dishes: boolean;
  assist_to_remove_trash: boolean;
  assist_to_fold_clothes: boolean;
  other: boolean;
  specify_other: string | undefined;
};

export type LeisureOutput = {
  puzzle: boolean;
  dance: boolean;
  arts_and_crafts: boolean;
  listen_to_music: boolean;
  icons_or_pictures: boolean;
  computer_games: boolean;
  short_naps: boolean;
  other: boolean;
  other_specify: string | null;
};

export type PersonalWorkOutput = {
  grammar: boolean;
  algebra: boolean;
  writing_skills: boolean;
  geometry: boolean;
  vocabulary: boolean;
  measurement: boolean;
  reading_comprehension: boolean;
  number_operations: boolean;
  other: boolean;
  other_specify: string | null;
  i_read_a_book_to_client: boolean;
};

export type PersonalCareOutput = {
  client_name_used_bathroom_without_assistance: boolean | null;
  assisted_client_with_changing_diapers: boolean;
  assisted_client_with_toileting: boolean;
  other_bowel: boolean;
  other_specify_bowel: string | null;
  supported_client_with_bathing: boolean;
  supported_client_with_brushing_teeth: boolean;
  supported_client_with_shampooing: boolean;
  supported_client_with_toweling: boolean;
  supported_client_with_showering: boolean;
  supported_client_with_menstrual_care: boolean;
  other_personal_hygiene: boolean;
  other_specify_personal_hygiene: string | null;
};

export type SensoryNeedsOutput = {
  paste_objects: boolean;
  copy_simple_shapes: boolean;
  turn_pages_of_book: boolean;
  button_a_shirt: boolean;
  use_of_cutlery: boolean;
  cut_simple_shapes: boolean;
  use_pencil_and_crayons_well: boolean;
  zip_a_zipper: boolean;
  handle_scissors_well: boolean;
  play_musical_instruments: boolean;
  match_simple_objects: boolean;
  complete_simple_puzzles: boolean;
  build_with_blocks: boolean;
  other_error_motor_development_skills: boolean;
  other_error_specify_motor_development_skills: string | null;
  throw_a_ball: boolean;
  kick_using_balls: boolean;
  roll_balls_with_hand_or_foot: boolean;
  skip_in_circles: boolean;
  hang_clothes: boolean;
  go_down_slides: boolean;
  climb_ladders: boolean;
  walk_a_straight_line: boolean;
  jump_rope: boolean;
  run_around_objects: boolean;
  toss_a_ball: boolean;
  walk_backwards: boolean;
  balance_on_one_foot: boolean;
  going_up_and_down_steps: boolean;
  pump_legs_on_the_swing_at_a_playground: boolean;
  other_gross_motor_skills: boolean;
  other_specify_gross_motor_skills: string | null;
};

export interface SocializationOutput {
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
export type SurvivalSkillsOutput = {
  cross_the_street: boolean;
  awareness_of_strangers: boolean;
  fire_emergency_awareness: boolean;
  unlock_door_when_trapped_in_a_room: boolean;
  other: boolean;
  specify_other: string | null;
};

export type UtilizationOfMoneyOutput = {
  handing_bills_to_cashier: boolean;
  waiting_for_and_receiving_debit_credit_card: boolean;
  handing_coins_to_cashier: boolean;
  counting_the_change_to_make_sure_it_is_correct: boolean;
  handing_debit_credit_card_to_cashier: boolean;
  determining_and_handling_the_correct_estimated_amount: boolean;
  using_the_dollar_up_program: boolean;
  obtaining_and_reviewing_receipt_for_accuracy: boolean;
  waiting_for_and_accepting_the_change: boolean;
  this_activity_occured_at?: string | undefined | null;
  None: boolean;
};

function convertGoals(data: any[]): ThirdFormData[] {
  return data.map((item) => {
    const step = item.objective_term_steps || item.goal_steps;

    return {
      ...item,
      activityLocation: item?.where_was_the_activity_practiced ?? "",
      circumstanceLeadingToActivity:
        item?.indicate_circumstances_leading_to_activity ?? "",
      clientResponse: item?.client_response_or_reaction_was ?? "",
      consequentlyClient: item?.consequently_client_did ?? "",
      totalTime: item?.total_time_spent_on_activity ?? "",
      clientReward: item?.client_reward ?? "",
      additionalComment: item?.additional_comments ?? "",
      treatment_plan_id: item.id,
      goal_background: item.goal_background,
      tableData:
        step && step.length > 0
          ? step.map(
              (
                data: {
                  task_analysis: any;
                  opportunities?: string;
                  prompt_used?: string;
                  response?: string;
                  success?: string;
                },
                index: number
              ) => ({
                id: String(index + 1),
                taskAnalysis: data.task_analysis,
                response: data?.response ?? [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                promptUsed: data?.prompt_used ?? [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                opportunities: data?.opportunities ?? [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                success: data?.success ?? [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
              })
            )
          : [
              {
                id: "1",
                taskAnalysis:
                  "Model prompts independently on a bi-monthly basis",
                response: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                promptUsed: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                opportunities: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
                success: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
              },
            ],
    };
  });
}

function convertDataForm(
  input: any[] | undefined | null,
  form_id: string,
  step_three: any
): any {
  if (!input) return []; // Return an empty array if input is undefined or null

  return input.map((item, index) => ({
    where_was_the_activity_practiced: item?.activityLocation || "",
    indicate_circumstances_leading_to_activity:
      item?.circumstanceLeadingToActivity || "",
    client_response_or_reaction_was: item?.clientResponse || "",
    consequently_client_did: item?.consequentlyClient || "",
    total_time_spent_on_activity: item?.totalTime || "",
    client_reward: item?.clientReward || "",
    treatment_plan_id: step_three?.[index]?.treatment_plan_id || "",

    goal_steps:
      item?.tableData?.map(
        (step: {
          taskAnalysis: any;
          response: any;
          promptUsed: any;
          opportunities: any;
          success: any;
        }) => ({
          task_analysis: step?.taskAnalysis || "",
          response: step?.response || "",
          prompt_used: step?.promptUsed || "",
          opportunities: step?.opportunities || "",
          success: step?.success || "",
        })
      ) || [], // If tableData is undefined or null, return an empty array

    additional_comments: item?.additionalComment || "",
    visit_full_form_id: form_id,
  }));
}

// Function to format date in "Monday - April 4th 2024" format
export function formatVisitDate(dateString: string): string {
  if (!dateString) {
    return "";
  }
  const date = parseISO(dateString);
  return format(date, "EEEE - MMMM do yyyy");
}

// Function to format date in "02/04/2024 07:52PM" format
export function formatLastModified(dateString: string): string {
  if (!dateString) {
    return "";
  }
  const date = parseISO(dateString);
  return format(date, "PPP hh:mmaaa");
}

type OriginalData = {
  id: string;
  session_highlights_id: string;
  self_management_id: string;
  communication_id: string;
  behavior_management_ids: string[];
  concern_and_challenges_id: string;
  domestic_skill_training_id: string;
  play_leisure_id: string;
  snack_meal_time_id: string;
  utilization_of_money_id: string;
  socialization_id: string;
  safety_and_survival_skills_id: string;
  personal_care_and_bladder_control_id: string;
  sensory_need_and_motor_development_id: string;
  personal_work_reading_id: string;
  visit_goal_ids: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  registered_by: string;
  date_of_visit: string;
  start_time: string;
  intake_full_id: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  staff: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
    account_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
};

export type VisitConvertedData = {
  id: string;
  date: string;
  staff: string;
  lastModified: string;
  route: string;
  downloadLink: string;
  admin: boolean;
  date_of_visit: string;
  intake_full_id: string;
  start_time: string;
  end_time: string;
  status?: string | "in_progress" | "completed";
};

function convertVisitData(data: OriginalData[]): VisitConvertedData[] {
  return data.map((item) => ({
    id: item.id,
    date: formatVisitDate(item.date_of_visit),
    staff: `${item?.staff?.first_name} ${item?.staff?.last_name}`,
    lastModified: formatLastModified(item.updated_at),
    route: `/route/to/${item.id}`,
    downloadLink: `/download/link/${item.id}`,
    admin: item?.staff?.role === "ADMIN",
    date_of_visit: item.date_of_visit,
    intake_full_id: item.intake_full_id,
    start_time: item.start_time,
    end_time: item.end_time,
    status: item?.status ?? "draft",
  }));
}

export function checkFormData(formData: any, responseLabels: any) {
  return responseLabels.some(({ value }: any) => {
    return formData[value] === true;
  });
}

export function hasAnyTrueValue(data: any, leisureMap: any) {
  for (const key in leisureMap) {
    if (data[leisureMap[key]] === true) {
      return true;
    }
  }
  return false;
}

export function treatmentPlanCompleted(data: TreatmentPlanData) {
  if (!data) {
    return false;
  }
  return data.basicInformation && data?.goals?.length > 0;
}

export const generateVisitGoalSummaryText = (
  username: string,
  task_analysis: string | null,
  prompt_used: string | null,
  success: string | null,
  opportunities: string | null
): string => {
  return `${username} was able to ${
    task_analysis ? task_analysis : "N/A"
  } with ${prompt_used ? prompt_used : "N/A"}. He was successful ${
    success ? success : "N/A"
  } out of ${opportunities ? opportunities : "N/A"} opportunities.`;
};

export {
  convertGoals,
  truncateText,
  convertVisitData,
  processTasks,
  capitalizeFirstLetter,
  formatFileSize,
  formatSSN,
  setsAreEqual,
  formatDate,
  objectToFormData,
  formatPhoneNumber,
  revertFormattedPhoneNumber,
  debounce,
  revertFormattedSSN,
  getErrorMessage,
  convertDataForm,
};
