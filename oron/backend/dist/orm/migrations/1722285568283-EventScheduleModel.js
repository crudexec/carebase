"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventScheduleModel1722285568283 = void 0;
class EventScheduleModel1722285568283 {
    constructor() {
        this.name = 'EventScheduleModel1722285568283';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_intake_id" uuid,
                "client_name" character varying,
                "employee_or_staff_name" character varying,
                "event_date" TIMESTAMP,
                "start_time" character varying,
                "end_time" character varying,
                "notes" text,
                "should_repeat" boolean DEFAULT false,
                "declination_reason" text,
                "declination_date" TIMESTAMP,
                "account_id" character varying,
                "scheduled_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_3aa388e160038869926189c4c8" UNIQUE ("scheduled_by"),
                CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "rescheduled_event_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "new_rescheduled_event_date" TIMESTAMP,
                "start_time" character varying,
                "end_time" character varying,
                "reason_for_rescheduling" text,
                "former_event_id" uuid,
                "client_intake_id" uuid,
                "notes" text,
                "should_repeat" boolean DEFAULT false,
                "account_id" character varying,
                "rescheduled_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "REL_3b6748a12523bb060ce0237936" UNIQUE ("rescheduled_by"),
                CONSTRAINT "PK_4c39c66bd73868a05a85324cc43" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_74843746a36ad8c1cb71be4bfda" FOREIGN KEY ("client_intake_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_3aa388e160038869926189c4c8e" FOREIGN KEY ("scheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_6657212c75e6c382e90b194b236" FOREIGN KEY ("former_event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_5aa4cb1bad32ea9e211ffa7a8cc" FOREIGN KEY ("client_intake_id") REFERENCES "intake_full_form"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log"
            ADD CONSTRAINT "FK_3b6748a12523bb060ce0237936f" FOREIGN KEY ("rescheduled_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_3b6748a12523bb060ce0237936f"
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_5aa4cb1bad32ea9e211ffa7a8cc"
        `);
        await queryRunner.query(`
            ALTER TABLE "rescheduled_event_log" DROP CONSTRAINT "FK_6657212c75e6c382e90b194b236"
        `);
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_3aa388e160038869926189c4c8e"
        `);
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_74843746a36ad8c1cb71be4bfda"
        `);
        await queryRunner.query(`
            DROP TABLE "rescheduled_event_log"
        `);
        await queryRunner.query(`
            DROP TABLE "events"
        `);
    }
}
exports.EventScheduleModel1722285568283 = EventScheduleModel1722285568283;
//# sourceMappingURL=1722285568283-EventScheduleModel.js.map