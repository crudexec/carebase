import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";
import { ClientStaffAssignmentHistory, AssignmentAction } from "orm/entities/ClientStaffAssignmentHistory";

export const unassignStaffFromClient = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const assignmentRepository = getRepository(ClientStaffAssignment);
  const historyRepository = getRepository(ClientStaffAssignmentHistory);

  const { clientId, staffId } = req.params;
  const { notes } = req.body;
  const actionBy = req.user.id;

  try {
    // Find active assignment
    const assignment = await assignmentRepository.findOne({
      where: { client_id: clientId, staff_id: staffId, is_active: true },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Soft delete assignment
    assignment.is_active = false;
    assignment.deleted_at = new Date();
    await assignmentRepository.save(assignment);

    // Create history record
    const history = historyRepository.create({
      client_id: clientId,
      staff_id: staffId,
      action_by: actionBy,
      action: AssignmentAction.UNASSIGNED,
      notes: notes || null,
    });
    await historyRepository.save(history);

    return res.customSuccess(200, "Staff unassigned successfully", {
      client_id: clientId,
      staff_id: staffId,
    });
  } catch (error) {
    return next(error);
  }
};
