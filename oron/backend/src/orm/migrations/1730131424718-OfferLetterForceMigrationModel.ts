// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class OfferLetterForceMigrationModel1730131424718 implements MigrationInterface {
//   name = 'OfferLetterForceMigrationModel1730131424718';

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter" DROP CONSTRAINT "FK_61c2934a49d5047e82f6f468153"
//         `);
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter" DROP CONSTRAINT "REL_61c2934a49d5047e82f6f46815"
//         `);
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter"
//             ADD CONSTRAINT "FK_61c2934a49d5047e82f6f468153" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
//         `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter" DROP CONSTRAINT "FK_61c2934a49d5047e82f6f468153"
//         `);
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter"
//             ADD CONSTRAINT "REL_61c2934a49d5047e82f6f46815" UNIQUE ("user_id")
//         `);
//     await queryRunner.query(`
//             ALTER TABLE "offer_letter"
//             ADD CONSTRAINT "FK_61c2934a49d5047e82f6f468153" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
//         `);
//   }
// }
