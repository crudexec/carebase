import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'orm/entities/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const userRepository = getRepository(User);
  try {
    const id = req.params.id;
    let { first_name, last_name, profile_picture } = req.body;

    const userData = await userRepository.findOne({ where: { id } });

    if (!userData) {
      const customError = new CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
      return next(customError);
    }

    first_name = first_name ?? userData.first_name;
    last_name = last_name ?? userData.last_name;
    profile_picture = profile_picture ?? userData.profile_picture;

    userData.first_name = first_name;
    userData.last_name = last_name;
    userData.profile_picture = profile_picture;

    await userRepository.save(userData);
    return res.customSuccess(200, 'User successfully saved.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `User update can't be saved.`, null, err);
    return next(customError);
  }
};
