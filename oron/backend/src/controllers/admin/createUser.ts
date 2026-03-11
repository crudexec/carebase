import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import crypto from 'crypto';

import { User } from 'orm/entities/User';
import { Role } from 'orm/entities/types';
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

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  let { first_name, last_name, email, role } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !role) {
    const customError = new CustomError(400, 'Validation', 'Missing required fields', [
      'first_name, last_name, email, and role are required',
    ]);
    return next(customError);
  }

  // Validate role
  const validRoles = Object.values(Role);
  if (!validRoles.includes(role)) {
    const customError = new CustomError(400, 'Validation', 'Invalid role', [
      `Role must be one of: ${validRoles.join(', ')}`,
    ]);
    return next(customError);
  }

  email = email.toLowerCase().trim();

  const userRepository = getRepository(User);
  try {
    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email, deleted_at: null } });

    if (existingUser) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Email '${email}' already exists`,
      ]);
      return next(customError);
    }

    // Generate password
    const generatedPassword = generatePassword(12);

    // Create new user
    const newUser = new User();
    newUser.email = email;
    newUser.password = generatedPassword;
    newUser.first_name = first_name;
    newUser.last_name = last_name;
    newUser.role = role;
    newUser.account_id = 'creed';
    newUser.hashPassword();

    const userData = await userRepository.save(newUser);

    // Return user data with the generated password (only time it's visible)
    res.customSuccess(200, 'User successfully created.', {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
      generated_password: generatedPassword, // Include password so admin can share it
      created_at: userData.created_at,
    });
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
    return next(customError);
  }
};
