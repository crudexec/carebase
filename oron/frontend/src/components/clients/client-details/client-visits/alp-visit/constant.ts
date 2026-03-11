export const ALP_VISIT_SIDEBAR = [
  {
    id: 1,
    name: "Session Attendance",
  },
  {
    id: 2,
    name: "Assessment",
  },
  {
    id: 3,
    name: "Signature",
  },
];

export const getAlpVisitRoute = (visitType: "first" | "second") => {
  switch (visitType) {
    case "first":
      return "alp-first-visit";

    case "second":
      return "alp-second-visit";

    default:
      return "alp-first-visit";
  }
};
