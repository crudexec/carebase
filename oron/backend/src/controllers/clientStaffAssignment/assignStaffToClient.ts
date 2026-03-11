import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";
import { ClientStaffAssignmentHistory, AssignmentAction } from "orm/entities/ClientStaffAssignmentHistory";
import { User } from "orm/entities/User";
import { IntakeFullForm } from "orm/entities/IntakeForm/intakeFullForm";
import { Role } from "orm/entities/types";

export const assignStaffToClient = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const assignmentRepository = getRepository(ClientStaffAssignment);
  const historyRepository = getRepository(ClientStaffAssignmentHistory);
  const userRepository = getRepository(User);
  const clientRepository = getRepository(IntakeFullForm);

  const { clientId } = req.params;
  const { staff_ids, notes } = req.body; // staff_ids is an array
  const assignedBy = req.user.id;

  try {
    // Verify client exists
    const client = await clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Verify all staff members exist and have STANDARD role
    const staffMembers = await userRepository.findByIds(staff_ids);
    if (staffMembers.length !== staff_ids.length) {
      return res.status(400).json({ message: "One or more staff members not found" });
    }

    const invalidStaff = staffMembers.filter(staff => staff.role !== Role.STANDARD);
    if (invalidStaff.length > 0) {
      return res.status(400).json({ message: "Only users with STANDARD role can be assigned as staff" });
    }

    const results = [];

    for (const staffId of staff_ids) {
      // Check if assignment already exists
      const existingAssignment = await assignmentRepository.findOne({
        where: { client_id: clientId, staff_id: staffId, is_active: true },
      });

      if (existingAssignment) {
        results.push({ staff_id: staffId, status: "already_assigned" });
        continue;
      }

      // Create new assignment
      const assignment = assignmentRepository.create({
        client_id: clientId,
        staff_id: staffId,
        assigned_by: assignedBy,
        is_active: true,
      });
      await assignmentRepository.save(assignment);

      // Create history record
      const history = historyRepository.create({
        client_id: clientId,
        staff_id: staffId,
        action_by: assignedBy,
        action: AssignmentAction.ASSIGNED,
        notes: notes || null,
      });
      await historyRepository.save(history);

      results.push({ staff_id: staffId, status: "assigned" });
    }

    return res.customSuccess(
      200,
      "Staff assignment completed",
      { assignments: results }
    );
  } catch (error) {
    return next(error);
  }
};
