import { OnboardingStage, UserRole } from "@prisma/client";

// Stage metadata with display info and permissions
export const ONBOARDING_STAGES: {
  id: OnboardingStage;
  label: string;
  description: string;
  color: string;
  requiresApproval?: boolean;
  approvalRole?: UserRole;
}[] = [
  {
    id: "REACH_OUT",
    label: "Reach Out",
    description: "Initial contact with potential client",
    color: "bg-blue-50 border border-blue-200",
  },
  {
    id: "ASSESSMENT",
    label: "Assessment",
    description: "Evaluate client needs and requirements",
    color: "bg-indigo-50 border border-indigo-200",
  },
  {
    id: "SCHEDULE_APPOINTMENT",
    label: "Schedule Appointment",
    description: "Book in-person or virtual meeting",
    color: "bg-violet-50 border border-violet-200",
  },
  {
    id: "ASSESSMENT_REPORT",
    label: "Assessment Report",
    description: "Document assessment findings",
    color: "bg-purple-50 border border-purple-200",
  },
  {
    id: "CLINICAL_AUTHORIZATION",
    label: "Clinical Authorization",
    description: "Clinical Director approval required",
    color: "bg-pink-50 border border-pink-200",
    requiresApproval: true,
    approvalRole: UserRole.CLINICAL_DIRECTOR,
  },
  {
    id: "ASSIGN_CAREGIVER",
    label: "Assign Carer",
    description: "Match client with suitable carer",
    color: "bg-rose-50 border border-rose-200",
  },
  {
    id: "HEALTH_CHECK",
    label: "Health Check",
    description: "Verify carer health requirements",
    color: "bg-orange-50 border border-orange-200",
  },
  {
    id: "HEALTH_ASSESSMENT",
    label: "Health Assessment",
    description: "Complete health documentation",
    color: "bg-amber-50 border border-amber-200",
  },
  {
    id: "ONE_ON_ONE",
    label: "One on One",
    description: "Initial carer-client meeting",
    color: "bg-yellow-50 border border-yellow-200",
  },
  {
    id: "CONTRACT_START",
    label: "Contract Start",
    description: "Service agreement begins",
    color: "bg-green-50 border border-green-200",
  },
];

// Get stage index (0-9) for ordering
export function getStageIndex(stage: OnboardingStage): number {
  return ONBOARDING_STAGES.findIndex((s) => s.id === stage);
}

// Get next stage
export function getNextStage(currentStage: OnboardingStage): OnboardingStage | null {
  const index = getStageIndex(currentStage);
  if (index === -1 || index >= ONBOARDING_STAGES.length - 1) {
    return null;
  }
  return ONBOARDING_STAGES[index + 1].id;
}

// Get previous stage
export function getPreviousStage(currentStage: OnboardingStage): OnboardingStage | null {
  const index = getStageIndex(currentStage);
  if (index <= 0) {
    return null;
  }
  return ONBOARDING_STAGES[index - 1].id;
}

// Check if stage requires approval
export function stageRequiresApproval(stage: OnboardingStage): boolean {
  const stageData = ONBOARDING_STAGES.find((s) => s.id === stage);
  return stageData?.requiresApproval ?? false;
}

// Get stage metadata
export function getStageMetadata(stage: OnboardingStage) {
  return ONBOARDING_STAGES.find((s) => s.id === stage);
}

// Roles that can move cards between stages
export const KANBAN_MOVE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.OPS_MANAGER,
  UserRole.CLINICAL_DIRECTOR,
  UserRole.STAFF,
  UserRole.SUPERVISOR,
];

// Check if user can move cards
export function canMoveCards(role: UserRole): boolean {
  return KANBAN_MOVE_ROLES.includes(role);
}

// Check if user can approve clinical authorization
export function canApproveClinical(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.CLINICAL_DIRECTOR;
}
