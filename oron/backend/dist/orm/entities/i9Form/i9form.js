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
exports.I9Form = void 0;
const typeorm_1 = require("typeorm");
const genericEnums_1 = require("types/genericEnums");
const User_1 = require("../User");
const citizenship_1 = require("./citizenship");
const document_1 = require("./document");
const personalInformation_1 = require("./personalInformation");
const signature_1 = require("./signature");
let I9Form = class I9Form {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], I9Form.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        nullable: true,
    }),
    __metadata("design:type", Object)
], I9Form.prototype, "filled_pdf_json_data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "personal_information_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => personalInformation_1.PersonalInformation, (personalInformation) => personalInformation.id),
    (0, typeorm_1.JoinColumn)({ name: 'personal_information_id' }),
    __metadata("design:type", personalInformation_1.PersonalInformation)
], I9Form.prototype, "personalInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "citizenship_form_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => citizenship_1.CitizenshipForm, (citizenshipForm) => citizenshipForm.id),
    (0, typeorm_1.JoinColumn)({ name: 'citizenship_form_id' }),
    __metadata("design:type", citizenship_1.CitizenshipForm)
], I9Form.prototype, "citizenshipForm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "document_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => document_1.Documents, (document) => document.id),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    __metadata("design:type", document_1.Documents)
], I9Form.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "signature_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => signature_1.Signature, (signature) => signature.id),
    (0, typeorm_1.JoinColumn)({ name: 'signature_id' }),
    __metadata("design:type", signature_1.Signature)
], I9Form.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'owner' }),
    __metadata("design:type", User_1.User)
], I9Form.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: genericEnums_1.Status,
        default: genericEnums_1.Status.NOT_STARTED,
    }),
    __metadata("design:type", String)
], I9Form.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'text',
    }),
    __metadata("design:type", String)
], I9Form.prototype, "review_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], I9Form.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], I9Form.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], I9Form.prototype, "deleted_at", void 0);
I9Form = __decorate([
    (0, typeorm_1.Entity)('i9_form')
], I9Form);
exports.I9Form = I9Form;
//# sourceMappingURL=i9form.js.map