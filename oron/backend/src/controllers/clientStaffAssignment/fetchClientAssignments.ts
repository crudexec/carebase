import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";

export const fetchClientAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const assignmentRepository = getRepository(ClientStaffAssignment);
  const { clientId } = req.params;

  try {
    const assignments = await assignmentRepository.find({
      where: { client_id: clientId, is_active: true },
      relations: ["staff", "assignedBy"],
      order: { created_at: "DESC" },
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      staff: {
        id: assignment.staff.id,
        first_name: assignment.staff.first_name,
        last_name: assignment.staff.last_name,
        email: assignment.staff.email,
        profile_picture: assignment.staff.profile_picture,
      },
      assigned_by: {
        id: assignment.assignedBy.id,
        first_name: assignment.assignedBy.first_name,
        last_name: assignment.assignedBy.last_name,
      },
      assigned_at: assignment.created_at,
    }));

    return res.customSuccess(
      200,
      "Client assignments fetched successfully",
      formattedAssignments
    );
  } catch (error) {
    return next(error);
  }
};
