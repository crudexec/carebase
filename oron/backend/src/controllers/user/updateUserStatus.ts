import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "orm/entities/User";
import { UserStatus } from "orm/entities/types";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";
import { ClientStaffAssignmentHistory, AssignmentAction } from "orm/entities/ClientStaffAssignmentHistory";

export const updateUserStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const userRepository = getRepository(User);
  const assignmentRepository = getRepository(ClientStaffAssignment);
  const historyRepository = getRepository(ClientStaffAssignmentHistory);

  const { userId } = req.params;
  const { status } = req.body;
  const actionBy = req.user.id;

  try {
    // Validate status
    if (!Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user status
    user.status = status;
    await userRepository.save(user);

    // If setting to DISENGAGED, remove all active client assignments
    let activeAssignments: any[] = [];
    if (status === UserStatus.DISENGAGED) {
      activeAssignments = await assignmentRepository.find({
        where: { staff_id: userId, is_active: true },
      });

      for (const assignment of activeAssignments) {
        // Soft delete assignment
        assignment.is_active = false;
        assignment.deleted_at = new Date();
        await assignmentRepository.save(assignment);

        // Create history record
        const history = historyRepository.create({
          client_id: assignment.client_id,
          staff_id: userId,
          action_by: actionBy,
          action: AssignmentAction.UNASSIGNED,
          notes: `Automatically unassigned due to user status change to DISENGAGED`,
        });
        await historyRepository.save(history);
      }
    }

    return res.customSuccess(200, "User status updated successfully", {
      id: user.id,
      status: user.status,
      assignmentsRemoved: activeAssignments.length,
    });
  } catch (error) {
    return next(error);
  }
};
