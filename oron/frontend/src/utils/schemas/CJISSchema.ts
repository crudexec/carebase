import { z } from "zod";

const CJISEmployeeInformationSchema = z.object({
  lastName: z
    .string()
    .min(1, { message: "Last name must be at least 1 character long" }),
  firstName: z
    .string()
    .min(1, { message: "First name must be at least 1 character long" }),
  dateOfHire: z.string().min(1, { message: "Date of Hirecannot be empty" }),
  employeeId: z.string().optional(),
  jobTitle: z.string().optional(),
});

export { CJISEmployeeInformationSchema };
export type CJISEmployeeInformationType = z.infer<
  typeof CJISEmployeeInformationSchema
>;
