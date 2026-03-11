"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedUsers1590519635401 = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../entities/types");
const User_1 = require("../entities/User");
class SeedUsers1590519635401 {
    async up(queryRunner) {
        const user = new User_1.User();
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        user.first_name = 'Health';
        user.last_name = 'Admin';
        user.email = 'admin@admin.com';
        user.password = 'password';
        user.hashPassword();
        user.role = types_1.Role.ADMINISTRATOR;
        user.account_id = 'creed';
        await userRepository.save(user);
        user.first_name = 'Creed';
        user.last_name = 'Worker';
        user.email = 'worker@gmail.com';
        user.password = 'password';
        user.hashPassword();
        user.role = types_1.Role.STANDARD;
        user.account_id = 'creed';
        await userRepository.save(user);
    }
    async down(queryRunner) {
        console.log('Not implemented');
    }
}
exports.SeedUsers1590519635401 = SeedUsers1590519635401;
//# sourceMappingURL=1590519635401-SeedUsers.js.map