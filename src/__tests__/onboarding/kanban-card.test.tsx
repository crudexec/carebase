import { render, screen } from "@testing-library/react";
import { KanbanCard, KanbanCardOverlay, OnboardingClient } from "@/components/onboarding/kanban-card";

// Mock dnd-kit
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}));

const mockClient: OnboardingClient = {
  id: "test-1",
  clientId: "client-1",
  clientName: "John Doe",
  sponsorName: "Jane Smith",
  stage: "REACH_OUT",
  stageEnteredAt: new Date().toISOString(),
  notes: "Test notes",
  documentsCount: 3,
  clinicalApproval: null,
  assignedTo: "Staff Member",
};

describe("KanbanCard", () => {
  it("renders client name", () => {
    render(<KanbanCard client={mockClient} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders sponsor name", () => {
    render(<KanbanCard client={mockClient} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders document count", () => {
    render(<KanbanCard client={mockClient} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders days in stage", () => {
    render(<KanbanCard client={mockClient} />);
    expect(screen.getByText("0d")).toBeInTheDocument();
  });

  it("does not show sponsor when null", () => {
    const clientWithoutSponsor = { ...mockClient, sponsorName: null };
    render(<KanbanCard client={clientWithoutSponsor} />);
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("shows pending approval badge for clinical authorization stage", () => {
    const clientInClinical = { ...mockClient, stage: "CLINICAL_AUTHORIZATION" };
    render(<KanbanCard client={clientInClinical} />);
    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
  });

  it("shows approved badge when clinical approval is true", () => {
    const approvedClient = {
      ...mockClient,
      stage: "CLINICAL_AUTHORIZATION",
      clinicalApproval: true,
    };
    render(<KanbanCard client={approvedClient} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows rejected badge when clinical approval is false", () => {
    const rejectedClient = {
      ...mockClient,
      stage: "CLINICAL_AUTHORIZATION",
      clinicalApproval: false,
    };
    render(<KanbanCard client={rejectedClient} />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("handles click event", () => {
    const handleClick = jest.fn();
    render(<KanbanCard client={mockClient} onClick={handleClick} />);

    const card = screen.getByText("John Doe").closest("div");
    card?.click();

    expect(handleClick).toHaveBeenCalled();
  });
});

describe("KanbanCardOverlay", () => {
  it("renders client name", () => {
    render(<KanbanCardOverlay client={mockClient} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders sponsor name", () => {
    render(<KanbanCardOverlay client={mockClient} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("does not show sponsor when null", () => {
    const clientWithoutSponsor = { ...mockClient, sponsorName: null };
    render(<KanbanCardOverlay client={clientWithoutSponsor} />);
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });
});
