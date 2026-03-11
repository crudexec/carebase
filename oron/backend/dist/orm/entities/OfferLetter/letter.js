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
exports.OfferLetter = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../User");
var jobPosition;
(function (jobPosition) {
    jobPosition["DSP (Direct Care Worker)"] = "DSP (Direct Care Worker)";
    jobPosition["On-Call Professional"] = "On-Call Professional";
    jobPosition["Family Consultant"] = "Family Consultant";
    jobPosition["Intensive Individual Support Services (IISS)"] = "Intensive Individual Support Services(IISS)";
})(jobPosition || (jobPosition = {}));
let OfferLetter = class OfferLetter {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OfferLetter.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], OfferLetter.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: jobPosition,
    }),
    __metadata("design:type", String)
], OfferLetter.prototype, "job_position", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], OfferLetter.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], OfferLetter.prototype, "signed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OfferLetter.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], OfferLetter.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], OfferLetter.prototype, "offer_letter_pdf_url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OfferLetter.prototype, "offer_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OfferLetter.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OfferLetter.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], OfferLetter.prototype, "deleted_at", void 0);
OfferLetter = __decorate([
    (0, typeorm_1.Entity)('offer_letter')
], OfferLetter);
exports.OfferLetter = OfferLetter;
//# sourceMappingURL=letter.js.map