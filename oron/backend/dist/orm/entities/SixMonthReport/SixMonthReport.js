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
exports.SixMonthReport = exports.ReportPeriod = exports.ReportStatus = void 0;
const typeorm_1 = require("typeorm");
const intakeFullForm_1 = require("../IntakeForm/intakeFullForm");
const treatmentFullPlan_1 = require("../TreatmentPlan/treatmentFullPlan");
const User_1 = require("../User");
const genericEnums_1 = require("types/genericEnums");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["GENERATING"] = "generating";
    ReportStatus["COMPLETED"] = "completed";
    ReportStatus["FAILED"] = "failed";
})(ReportStatus = exports.ReportStatus || (exports.ReportStatus = {}));
var ReportPeriod;
(function (ReportPeriod) {
    ReportPeriod["FIRST_SIX_MONTHS"] = "first_six_months";
    ReportPeriod["SECOND_SIX_MONTHS"] = "second_six_months";
    ReportPeriod["CUSTOM"] = "custom";
})(ReportPeriod = exports.ReportPeriod || (exports.ReportPeriod = {}));
let SixMonthReport = class SixMonthReport {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SixMonthReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: genericEnums_1.TreatmentPlanType,
        nullable: false,
    }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "report_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.DRAFT,
    }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReportPeriod,
        default: ReportPeriod.CUSTOM,
    }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], SixMonthReport.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "intake_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intakeFullForm_1.IntakeFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'intake_id' }),
    __metadata("design:type", intakeFullForm_1.IntakeFullForm)
], SixMonthReport.prototype, "intake", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "generated_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'generated_by_id' }),
    __metadata("design:type", User_1.User)
], SixMonthReport.prototype, "generatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SixMonthReport.prototype, "executive_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SixMonthReport.prototype, "behavioral_management", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SixMonthReport.prototype, "significant_life_events", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SixMonthReport.prototype, "skills_progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SixMonthReport.prototype, "session_highlights_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SixMonthReport.prototype, "concerns_and_challenges_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SixMonthReport.prototype, "visit_attendance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SixMonthReport.prototype, "goals_assessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "next_period_goals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "additional_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "supervisor_comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SixMonthReport.prototype, "is_final", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "finalized_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "finalized_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'finalized_by_id' }),
    __metadata("design:type", User_1.User)
], SixMonthReport.prototype, "finalizedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SixMonthReport.prototype, "pdf_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "pdf_generated_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SixMonthReport.prototype, "deleted_at", void 0);
SixMonthReport = __decorate([
    (0, typeorm_1.Entity)('six_month_reports')
], SixMonthReport);
exports.SixMonthReport = SixMonthReport;
//# sourceMappingURL=SixMonthReport.js.map