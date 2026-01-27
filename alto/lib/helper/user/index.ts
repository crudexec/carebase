import { capitalize } from "lodash";

import { UserGroupType } from "@/types";

export const getHeaderDescription = (name: UserGroupType) => {
  switch (name) {
    case "all":
      return {
        description: "Active Service Providers",
        title: capitalize(name),
      };
    case "nurse":
      return {
        description: "Nursing Service Providers",
        title: capitalize(name),
      };
    case "caregiver":
      return {
        description:
          "CNA, Home Health Aides, Home maker, Companion, Attendant & Caregiver",
        title: capitalize(name),
      };
    case "therapist":
      return {
        description:
          "Respiratory, Developmental, Rehabilitative & Restorative Services Providers",
        title: capitalize(name),
      };
    case "archived":
      return {
        description: "Archived Service Providers",
        title: capitalize(name),
      };
    default:
      return {
        description: "",
        title: name,
      };
  }
};
