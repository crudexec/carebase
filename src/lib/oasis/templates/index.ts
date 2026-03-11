/**
 * OASIS-E2 Template Data
 * Pre-built templates for OASIS assessments
 */

// Main template exports
export {
  OASIS_E2_TEMPLATE,
  OASIS_E2_SECTIONS,
  OASIS_E2_STATS,
  createOasisE2Template,
  getItemsForTimePoint,
  getTotalItemCount,
  getSectionByCode,
  getItemByCode,
  type OasisTemplate,
  type OasisTemplateSection
} from "./oasis-e2-template";

// Individual section exports (for direct access if needed)
export { SECTION_A_ITEMS } from "./sections/section-a";
export { SECTION_B_ITEMS } from "./sections/section-b";
export { SECTION_C_ITEMS } from "./sections/section-c";
export { SECTION_D_ITEMS } from "./sections/section-d";
export { SECTION_GG_ITEMS } from "./sections/section-gg";
export { SECTION_H_ITEMS } from "./sections/section-h";
export { SECTION_J_ITEMS } from "./sections/section-j";
export { SECTION_M_ITEMS } from "./sections/section-m";
export { SECTION_N_ITEMS } from "./sections/section-n";
export { SECTION_O_ITEMS } from "./sections/section-o";
