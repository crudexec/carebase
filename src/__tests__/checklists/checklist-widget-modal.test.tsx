import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChecklistContent } from "@/components/checklists/checklist-content";
import { ChecklistData } from "@/lib/checklists/types";

const checklist: ChecklistData = {
  id: "checklist-1",
  title: "Staff onboarding",
  description: "Read the onboarding notes.",
  createdAt: "2026-09-25T12:00:00.000Z",
  assigneeId: "user-1",
  assignee: { id: "user-1", firstName: "Taylor", lastName: "Staff" },
  items: [
    {
      id: "item-1",
      title: "Review medication training",
      status: "PENDING",
      position: 0,
      submittedAt: null,
      approvedAt: null,
      submittedBy: null,
      approvedBy: null,
      comments: [
        {
          id: "comment-1",
          body: "Please review section 4 as well.",
          createdAt: "2026-09-25T12:00:00.000Z",
          author: { id: "admin-1", firstName: "Casey", lastName: "Admin" },
        },
      ],
      attachments: [
        {
          id: "file-1",
          fileName: "training-guide.pdf",
          size: 1048,
          createdAt: "2026-09-25T12:00:00.000Z",
          author: { id: "admin-1", firstName: "Casey", lastName: "Admin" },
        },
      ],
    },
  ],
};

describe("checklist dashboard item details", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });

  it("opens a compact item in a modal with comments, attachments, and a close action", async () => {
    render(
      <ChecklistContent
        checklist={checklist}
        isAdmin={false}
        refresh={jest.fn().mockResolvedValue(undefined)}
        compact
      />,
    );

    expect(screen.queryByText(checklist.description)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Review medication training" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Comments and attachments");
    expect(dialog).toHaveTextContent("Please review section 4 as well.");
    expect(
      screen.getByRole("link", { name: "training-guide.pdf" }),
    ).toHaveAttribute("href", "/api/checklists/attachments/file-1");
    expect(
      screen.getByRole("button", { name: /Drop a file here or browse files/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Up to 10 MB/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close item details" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
