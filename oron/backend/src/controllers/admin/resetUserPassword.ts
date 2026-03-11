import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import crypto from 'crypto';

import { User } from 'orm/entities/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

// Generate a secure random password
const generatePassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.params;

  if (!user_id) {
    const customError = new CustomError(400, 'Validation', 'Missing user_id parameter');
    return next(customError);
  }

  const userRepository = getRepository(User);

  try {
    // Find the user
    const user = await userRepository.findOne({ where: { id: user_id, deleted_at: null } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'User not found');
      return next(customError);
    }

    // Generate new password
    const newPassword = generatePassword(12);

    // Update user password
    user.password = newPassword;
    user.hashPassword();

    await userRepository.save(user);

    // Return the new password (only time it's visible)
    res.customSuccess(200, 'Password successfully reset.', {
      user_id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      new_password: newPassword,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Failed to reset password', null, err);
    return next(customError);
  }
};
