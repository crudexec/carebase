import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';

import { Role } from '../entities/types';
import { User } from '../entities/User';

export class SeedUsers1590519635401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new User();
    const userRepository = getRepository(User);

    user.first_name = 'Health';
    user.last_name = 'Admin';
    user.email = 'admin@admin.com';
    user.password = 'password';
    user.hashPassword();
    user.role = Role.ADMINISTRATOR;
    user.account_id = 'creed';
    await userRepository.save(user);

    user.first_name = 'Creed';
    user.last_name = 'Worker';
    user.email = 'worker@gmail.com';
    user.password = 'password';
    user.hashPassword();
    user.role = Role.STANDARD;
    user.account_id = 'creed';
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    console.log('Not implemented');
  }
}
