import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { ClientStaffAssignmentHistory } from "orm/entities/ClientStaffAssignmentHistory";

export const fetchAssignmentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const historyRepository = getRepository(ClientStaffAssignmentHistory);
  const { clientId } = req.params;
  const { page = 1, size = 20 } = req.query;

  try {
    const [history, total] = await historyRepository.findAndCount({
      where: { client_id: clientId },
      relations: ["staff", "actionBy"],
      order: { created_at: "DESC" },
      skip: (Number(page) - 1) * Number(size),
      take: Number(size),
    });

    const formattedHistory = history.map(record => ({
      id: record.id,
      staff: {
        id: record.staff.id,
        name: `${record.staff.first_name} ${record.staff.last_name}`,
      },
      action: record.action,
      action_by: {
        id: record.actionBy.id,
        name: `${record.actionBy.first_name} ${record.actionBy.last_name}`,
      },
      notes: record.notes,
      timestamp: record.created_at,
    }));

    return res.customSuccess(200, "Assignment history fetched successfully", {
      history: formattedHistory,
      total,
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    return next(error);
  }
};
