import * as z from "zod";

// Base schemas for reusable patterns
const dynamicFieldSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      value: z.string().optional(),
    })
  )
  .optional();

const recommendationsSchema = z.string().optional();

// Individual section schemas
const diagnosisSchema = z.object({
  category: z.literal("diagnosis").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const nutritionalSchema = z.object({
  category: z.literal("nutritional").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const healthSchema = z.object({
  category: z.literal("health").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const allergiesSchema = z.object({
  category: z.literal("allergies").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const medicationSchema = z.object({
  category: z.literal("medication").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const toiletingSchema = z.object({
  category: z.literal("toileting").optional(),
  description: z.string().optional(),
  otherDescription: z.string().optional(),
  specificNeeds: z.string().optional(),
  recommendations: recommendationsSchema,
});

const communicationSchema = z.object({
  category: z.literal("communication").optional(),
  description: z.string().optional(),
  specificNeeds: z.string().optional(),
  recommendations: recommendationsSchema,
});

const behaviorsSchema = z.object({
  category: z.literal("behaviors").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  displayedBehaviors: dynamicFieldSchema,
  managementStrategies: dynamicFieldSchema,
  triggers: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const rewardsSchema = z.object({
  category: z.literal("rewards").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const transportationSchema = z.object({
  category: z.literal("transportation").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  canBeTransportedAlone: z.boolean().nullable().optional(),
  recommendations: recommendationsSchema,
});

const staffRatioSchema = z.object({
  category: z.literal("staff_ratio").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  comments: z.string().optional(),
  recommendations: recommendationsSchema,
});

const supervisionSchema = z.object({
  category: z.literal("supervision").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  comments: z.string().optional(),
  recommendations: recommendationsSchema,
});

const recreationalSchema = z.object({
  category: z.literal("recreational").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const houseRulesSchema = z.object({
  category: z.literal("house_rules").optional(),
  description: z.array(z.string()).optional(),
  otherDescription: z.string().optional(),
  specificNeeds: dynamicFieldSchema,
  recommendations: recommendationsSchema,
});

const commentsOnlySchema = z.object({
  category: z.string().optional(),
  comments: z.string().optional(),
  recommendations: recommendationsSchema,
});

// Combined schema for the entire form
export const currentNeedsSchema = z.object({
  diagnosis: diagnosisSchema.optional(),
  nutritional: nutritionalSchema.optional(),
  health: healthSchema.optional(),
  allergies: allergiesSchema.optional(),
  medication: medicationSchema.optional(),
  toileting: toiletingSchema.optional(),
  communication: communicationSchema.optional(),
  behaviors: behaviorsSchema.optional(),
  rewards: rewardsSchema.optional(),
  transportation: transportationSchema.optional(),
  staffRatio: staffRatioSchema.optional(),
  supervision: supervisionSchema.optional(),
  recreational: recreationalSchema.optional(),
  houseRules: houseRulesSchema.optional(),
  communityOuting: commentsOnlySchema.optional(),
  specialAlerts: commentsOnlySchema.optional(),
});

export type CurrentNeedsFormData = z.infer<typeof currentNeedsSchema>;

// Export types
export type DiagnosisData = z.infer<typeof diagnosisSchema>;
export type NutritionalData = z.infer<typeof nutritionalSchema>;
export type HealthData = z.infer<typeof healthSchema>;
export type AllergiesData = z.infer<typeof allergiesSchema>;
export type MedicationData = z.infer<typeof medicationSchema>;
export type ToiletingData = z.infer<typeof toiletingSchema>;
export type CommunicationData = z.infer<typeof communicationSchema>;
export type BehaviorsData = z.infer<typeof behaviorsSchema>;
export type RewardsData = z.infer<typeof rewardsSchema>;
export type TransportationData = z.infer<typeof transportationSchema>;
export type StaffRatioData = z.infer<typeof staffRatioSchema>;
export type SupervisionData = z.infer<typeof supervisionSchema>;
export type RecreationalData = z.infer<typeof recreationalSchema>;
export type HouseRulesData = z.infer<typeof houseRulesSchema>;
export type CommentsOnlyData = z.infer<typeof commentsOnlySchema>;
