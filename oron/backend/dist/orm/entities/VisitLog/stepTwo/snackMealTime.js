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
exports.SnackMealTime = void 0;
const typeorm_1 = require("typeorm");
const treatmentFullPlan_1 = require("../../TreatmentPlan/treatmentFullPlan");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../../User");
const visitFullForm_1 = require("../visitFullForm");
let SnackMealTime = class SnackMealTime {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SnackMealTime.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "ate_all_meal_or_snack", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "ate_some_meal_or_snack", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "refused_all_meal_or_snack", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "drank_a_lot_of_water", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "drank_some_water", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "refused_all_water", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "drank_a_lot_of_juice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "drank_some_juice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "refused_all_juice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "specify_what_snack_or_meal_provided", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "prepared_snack_or_meal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "served_snack_or_meal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "assisted_with_feeding", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "clean_up_after_snack_or_meal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "other", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "specify_other", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], SnackMealTime.prototype, "client_helped_to_clean_up_and_put_away_dishes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "treatment_plan_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatmentFullPlan_1.TreatmentFullPlan),
    (0, typeorm_1.JoinColumn)({ name: 'treatment_plan_id' }),
    __metadata("design:type", treatmentFullPlan_1.TreatmentFullPlan)
], SnackMealTime.prototype, "treatmentFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "visit_full_form_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitFullForm_1.VisitFullForm),
    (0, typeorm_1.JoinColumn)({ name: 'visit_full_form_id' }),
    __metadata("design:type", visitFullForm_1.VisitFullForm)
], SnackMealTime.prototype, "visitFullForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], SnackMealTime.prototype, "registered_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'registered_by' }),
    __metadata("design:type", User_1.User)
], SnackMealTime.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SnackMealTime.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SnackMealTime.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SnackMealTime.prototype, "deleted_at", void 0);
SnackMealTime = __decorate([
    (0, typeorm_1.Entity)('snack_meal_time')
], SnackMealTime);
exports.SnackMealTime = SnackMealTime;
//# sourceMappingURL=snackMealTime.js.map