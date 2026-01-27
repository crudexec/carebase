import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN || "",
  orgId: process.env.AXIOM_ORG_ID,
});

const record = (payload: object) => {
  if (process.env.NODE_ENV === "development" || !process.env.AXIOM_TOKEN) {
    return console.dir(payload, { depth: 3 });
  }

  try {
    if (Object.keys(payload || {}).length) {
      axiom.ingest(process.env.AXIOM_STREAM || "web", {
        payload,
        environment: process.env.NODE_ENV || "development",
        domain: process.env.APP_URL || "localhost",
      });
    }
  } catch (error) {
    console.error("Error with Axoim request");
    console.dir(error, { depth: 3 });
  }
};

export const logger = (milestone: string, data: object) => {
  return record({ milestone, ...data });
};
