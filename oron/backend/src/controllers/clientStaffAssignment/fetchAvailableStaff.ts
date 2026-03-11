import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "orm/entities/User";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";
import { Role, UserStatus } from "orm/entities/types";

export const fetchAvailableStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = getRepository(User);
  const assignmentRepository = getRepository(ClientStaffAssignment);
  const { clientId } = req.params;

  try {
    // Get all active staff members (only ACTIVE status)
    const allStaff = await userRepository.find({
      where: { role: Role.STANDARD, deleted_at: null, status: UserStatus.ACTIVE },
      select: ["id", "first_name", "last_name", "email", "profile_picture"],
      order: { first_name: "ASC", last_name: "ASC" },
    });

    // Get already assigned staff IDs for this client
    const assignedStaff = await assignmentRepository.find({
      where: { client_id: clientId, is_active: true },
      select: ["staff_id"],
    });

    const assignedStaffIds = new Set(assignedStaff.map(a => a.staff_id));

    // Filter out already assigned staff
    const availableStaff = allStaff
      .filter(staff => !assignedStaffIds.has(staff.id))
      .map(staff => ({
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        email: staff.email,
        profile_picture: staff.profile_picture,
      }));

    return res.customSuccess(
      200,
      "Available staff fetched successfully",
      availableStaff
    );
  } catch (error) {
    return next(error);
  }
};
