"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericUserModel1712134933775 = void 0;
class genericUserModel1712134933775 {
    constructor() {
        this.name = 'genericUserModel1712134933775';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" character varying(30) NOT NULL DEFAULT 'STANDARD',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }
}
exports.genericUserModel1712134933775 = genericUserModel1712134933775;
//# sourceMappingURL=1712134933775-genericUserModel.js.map