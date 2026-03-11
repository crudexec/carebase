import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { Role } from 'orm/entities/types';
import { User } from 'orm/entities/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
  let { first_name, last_name, email, password } = req.body;

  email = email.toLowerCase().trim();

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email, deleted_at: null } });

    if (user) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Email '${user.email}' already exists`,
      ]);
      return next(customError);
    }

    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.first_name = first_name;
    newUser.last_name = last_name;
    newUser.role = Role.ADMINISTRATOR;
    newUser.account_id = 'creed';
    newUser.hashPassword();
    const userData = await userRepository.save(newUser);

    return res.customSuccess(200, 'User successfully created.', userData);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
    return next(customError);
  }
};
