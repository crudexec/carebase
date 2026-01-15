import { UserRole } from "@prisma/client";
import {
  ONBOARDING_STAGES,
  getStageIndex,
  getNextStage,
  getPreviousStage,
  stageRequiresApproval,
  getStageMetadata,
  canMoveCards,
  canApproveClinical,
} from "@/lib/onboarding";

describe("ONBOARDING_STAGES", () => {
  it("has exactly 10 stages", () => {
    expect(ONBOARDING_STAGES).toHaveLength(10);
  });

  it("has correct stage order", () => {
    const stageIds = ONBOARDING_STAGES.map((s) => s.id);
    expect(stageIds).toEqual([
      "REACH_OUT",
      "ASSESSMENT",
      "SCHEDULE_APPOINTMENT",
      "ASSESSMENT_REPORT",
      "CLINICAL_AUTHORIZATION",
      "ASSIGN_CAREGIVER",
      "HEALTH_CHECK",
      "HEALTH_ASSESSMENT",
      "ONE_ON_ONE",
      "CONTRACT_START",
    ]);
  });

  it("marks only CLINICAL_AUTHORIZATION as requiring approval", () => {
    const approvalStages = ONBOARDING_STAGES.filter((s) => s.requiresApproval);
    expect(approvalStages).toHaveLength(1);
    expect(approvalStages[0].id).toBe("CLINICAL_AUTHORIZATION");
  });
});

describe("getStageIndex", () => {
  it("returns correct index for each stage", () => {
    expect(getStageIndex("REACH_OUT")).toBe(0);
    expect(getStageIndex("CLINICAL_AUTHORIZATION")).toBe(4);
    expect(getStageIndex("CONTRACT_START")).toBe(9);
  });

  it("returns -1 for invalid stage", () => {
    expect(getStageIndex("INVALID_STAGE" as never)).toBe(-1);
  });
});

describe("getNextStage", () => {
  it("returns next stage correctly", () => {
    expect(getNextStage("REACH_OUT")).toBe("ASSESSMENT");
    expect(getNextStage("CLINICAL_AUTHORIZATION")).toBe("ASSIGN_CAREGIVER");
  });

  it("returns null for last stage", () => {
    expect(getNextStage("CONTRACT_START")).toBeNull();
  });

  it("returns null for invalid stage", () => {
    expect(getNextStage("INVALID_STAGE" as never)).toBeNull();
  });
});

describe("getPreviousStage", () => {
  it("returns previous stage correctly", () => {
    expect(getPreviousStage("ASSESSMENT")).toBe("REACH_OUT");
    expect(getPreviousStage("ASSIGN_CAREGIVER")).toBe("CLINICAL_AUTHORIZATION");
  });

  it("returns null for first stage", () => {
    expect(getPreviousStage("REACH_OUT")).toBeNull();
  });
});

describe("stageRequiresApproval", () => {
  it("returns true for CLINICAL_AUTHORIZATION", () => {
    expect(stageRequiresApproval("CLINICAL_AUTHORIZATION")).toBe(true);
  });

  it("returns false for other stages", () => {
    expect(stageRequiresApproval("REACH_OUT")).toBe(false);
    expect(stageRequiresApproval("ASSIGN_CAREGIVER")).toBe(false);
    expect(stageRequiresApproval("CONTRACT_START")).toBe(false);
  });
});

describe("getStageMetadata", () => {
  it("returns metadata for valid stage", () => {
    const metadata = getStageMetadata("CLINICAL_AUTHORIZATION");
    expect(metadata).toBeDefined();
    expect(metadata?.label).toBe("Clinical Authorization");
    expect(metadata?.requiresApproval).toBe(true);
    expect(metadata?.approvalRole).toBe(UserRole.CLINICAL_DIRECTOR);
  });

  it("returns undefined for invalid stage", () => {
    expect(getStageMetadata("INVALID_STAGE" as never)).toBeUndefined();
  });
});

describe("canMoveCards", () => {
  it("allows Admin to move cards", () => {
    expect(canMoveCards(UserRole.ADMIN)).toBe(true);
  });

  it("allows Ops Manager to move cards", () => {
    expect(canMoveCards(UserRole.OPS_MANAGER)).toBe(true);
  });

  it("allows Clinical Director to move cards", () => {
    expect(canMoveCards(UserRole.CLINICAL_DIRECTOR)).toBe(true);
  });

  it("allows Staff to move cards", () => {
    expect(canMoveCards(UserRole.STAFF)).toBe(true);
  });

  it("allows Supervisor to move cards", () => {
    expect(canMoveCards(UserRole.SUPERVISOR)).toBe(true);
  });

  it("denies Carer from moving cards", () => {
    expect(canMoveCards(UserRole.CARER)).toBe(false);
  });

  it("denies Sponsor from moving cards", () => {
    expect(canMoveCards(UserRole.SPONSOR)).toBe(false);
  });
});

describe("canApproveClinical", () => {
  it("allows Admin to approve", () => {
    expect(canApproveClinical(UserRole.ADMIN)).toBe(true);
  });

  it("allows Clinical Director to approve", () => {
    expect(canApproveClinical(UserRole.CLINICAL_DIRECTOR)).toBe(true);
  });

  it("denies Ops Manager from approving", () => {
    expect(canApproveClinical(UserRole.OPS_MANAGER)).toBe(false);
  });

  it("denies Staff from approving", () => {
    expect(canApproveClinical(UserRole.STAFF)).toBe(false);
  });

  it("denies Supervisor from approving", () => {
    expect(canApproveClinical(UserRole.SUPERVISOR)).toBe(false);
  });

  it("denies Carer from approving", () => {
    expect(canApproveClinical(UserRole.CARER)).toBe(false);
  });

  it("denies Sponsor from approving", () => {
    expect(canApproveClinical(UserRole.SPONSOR)).toBe(false);
  });
});
