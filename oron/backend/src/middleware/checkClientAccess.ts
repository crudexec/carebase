import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { ClientStaffAssignment } from "orm/entities/ClientStaffAssignment";
import { Role } from "orm/entities/types";

/**
 * Middleware to check if staff user has access to specific client
 * Admins and Client Managers bypass this check
 */
export const checkClientAccess = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins and Client Managers have access to all clients
  if (userRole === Role.ADMINISTRATOR || userRole === Role.CLIENT_MANAGER) {
    return next();
  }

  // For STANDARD role, check assignment
  if (userRole === Role.STANDARD) {
    const clientId = req.params.clientId || req.params.id || req.body.client_id;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const assignmentRepository = getRepository(ClientStaffAssignment);
    const assignment = await assignmentRepository.findOne({
      where: {
        client_id: clientId,
        staff_id: userId,
        is_active: true,
      },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "Access denied: You are not assigned to this client",
      });
    }

    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};
