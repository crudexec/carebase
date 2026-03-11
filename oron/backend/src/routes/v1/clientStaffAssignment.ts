import { Router } from "express";
import { checkJwt } from "middleware/checkJwt";
import { checkRole } from "middleware/checkRole";
import {
  assignStaffToClient,
  unassignStaffFromClient,
  fetchClientAssignments,
  fetchAssignmentHistory,
  fetchAvailableStaff,
} from "controllers/clientStaffAssignment";

const router = Router();

// Assign staff to client (Admin, Client Manager only)
router.post(
  "/client/:clientId/assign",
  [checkJwt, checkRole(["ADMINISTRATOR", "CLIENT_MANAGER"])],
  assignStaffToClient
);

// Unassign staff from client (Admin, Client Manager only)
router.delete(
  "/client/:clientId/staff/:staffId",
  [checkJwt, checkRole(["ADMINISTRATOR", "CLIENT_MANAGER"])],
  unassignStaffFromClient
);

// Get assigned staff for a client
router.get(
  "/client/:clientId/assignments",
  [checkJwt],
  fetchClientAssignments
);

// Get assignment history for a client
router.get(
  "/client/:clientId/history",
  [checkJwt, checkRole(["ADMINISTRATOR", "CLIENT_MANAGER"])],
  fetchAssignmentHistory
);

// Get available staff (not yet assigned to this client)
router.get(
  "/client/:clientId/available-staff",
  [checkJwt, checkRole(["ADMINISTRATOR", "CLIENT_MANAGER"])],
  fetchAvailableStaff
);

export default router;
