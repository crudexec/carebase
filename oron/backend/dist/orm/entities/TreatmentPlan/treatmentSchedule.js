"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentSchedule = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const User_1 = require("../User");
const genericEnums_1 = require("types/genericEnums");
let TreatmentSchedule = class TreatmentSchedule {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TreatmentSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TreatmentSchedule.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Date)
], TreatmentSchedule.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentSchedule.prototype, "google_calendar_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], TreatmentSchedule.prototype, "time_slot", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        default: genericEnums_1.TreatmentPlanType.IISS_ASSESSMENT,
    }),
    __metadata("design:type", String)
], TreatmentSchedule.prototype, "treatment_plan_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], TreatmentSchedule.prototype, "intake_full_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_full_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], TreatmentSchedule.prototype, "intakeFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TreatmentSchedule.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], TreatmentSchedule.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentSchedule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TreatmentSchedule.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TreatmentSchedule.prototype, "deleted_at", void 0);
TreatmentSchedule = __decorate([
    (0, typeorm_1.Entity)('treatment_schedule')
], TreatmentSchedule);
exports.TreatmentSchedule = TreatmentSchedule;
//# sourceMappingURL=treatmentSchedule.js.map