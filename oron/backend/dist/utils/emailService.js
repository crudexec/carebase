"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSharedTreatmentPlan = exports.sendParentSignatureConfirmation = exports.sendRequestParentSignature = exports.sendAdminParentSignatureConfirmation = exports.sendRescheduleEventDeclination = exports.sendRescheduleEventApproval = exports.sendCalendarEventReceipt = exports.sendRescheduleEmail = exports.sendOfferLetter = exports.sendApproveMail = exports.SendForgotPasswordEmail = exports.SendReviewEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const adminConfirmationTreatment_1 = require("./adminConfirmationTreatment");
const approvedMail_1 = require("./approvedMail");
const eventScheduleConfirmation_1 = require("./eventScheduleConfirmation");
const forgotPasswordTemplate_1 = require("./forgotPasswordTemplate");
const offerLetter_1 = require("./offerLetter");
const parentTreatmentSignatureRequest_1 = require("./parentTreatmentSignatureRequest");
const RescheduleApproval_1 = require("./RescheduleApproval");
const RescheduleDeclination_1 = require("./RescheduleDeclination");
const rescheduleEvents_1 = require("./rescheduleEvents");
const reviewNote_1 = require("./reviewNote");
const treatmentSignatureConfirmation_1 = require("./treatmentSignatureConfirmation");
const shareTreatmentPlan_1 = require("./shareTreatmentPlan");
const transporter = nodemailer_1.default.createTransport({
    port: Number(process.env.NODEMAILER_PORT),
    host: process.env.NODEMAILER_HOST,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
    from: process.env.NODEMAILER_USER,
    secure: false,
});
async function sendEmail({ from, subject, template, to }) {
    try {
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: to,
            subject,
            html: template,
        };
        const info = await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending email: ', error);
    }
}
exports.sendEmail = sendEmail;
const SendReviewEmail = async (username, formName, reviewNote, to) => {
    try {
        const htmlTemplate = (0, reviewNote_1.adminReview)({
            username,
            formName,
            reviewNote,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `${formName} Review`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending review email: ', error);
    }
};
exports.SendReviewEmail = SendReviewEmail;
const SendForgotPasswordEmail = async (username, token, to) => {
    try {
        const htmlTemplate = (0, forgotPasswordTemplate_1.forgotPasswordEmail)({
            username,
            token,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Forgot Password Request`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending forgot password email: ', error);
    }
};
exports.SendForgotPasswordEmail = SendForgotPasswordEmail;
const sendApproveMail = async (username, formName, to) => {
    try {
        const htmlTemplate = (0, approvedMail_1.adminApproval)({
            username,
            formName,
            onboardingLink: process.env.FRONTEND_URL,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `${formName} Approved`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending approve email: ', error);
    }
};
exports.sendApproveMail = sendApproveMail;
const sendOfferLetter = async (username, to) => {
    try {
        const htmlTemplate = (0, offerLetter_1.OfferLetterEmail)({
            username,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Offer Letter`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending offer letter email: ', error);
    }
};
exports.sendOfferLetter = sendOfferLetter;
const sendRescheduleEmail = async (username, rescheduleReason, clientName, formerDate, newDate, to) => {
    try {
        const htmlTemplate = (0, rescheduleEvents_1.RescheduleReview)({
            username,
            rescheduleReason,
            clientName,
            formerDate,
            newDate,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Reschedule Request`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending reschedule email: ', error);
    }
};
exports.sendRescheduleEmail = sendRescheduleEmail;
const sendCalendarEventReceipt = async (staffName, note, patientName, newDate, location, to) => {
    try {
        const htmlTemplate = (0, eventScheduleConfirmation_1.CalendarEventReceipt)({
            staffName,
            note,
            patientName,
            newDate,
            location,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Appointment Confirmation`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending calendar event receipt email: ', error);
    }
};
exports.sendCalendarEventReceipt = sendCalendarEventReceipt;
const sendRescheduleEventApproval = async (staffName, patientName, formerDate, newDate, to) => {
    try {
        const htmlTemplate = (0, RescheduleApproval_1.RescheduleEventApprovalTemplate)({
            staffName,
            patientName,
            formerDate,
            newDate,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Reschedule Approval`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending reschedule event approval email: ', error);
    }
};
exports.sendRescheduleEventApproval = sendRescheduleEventApproval;
const sendRescheduleEventDeclination = async (staffName, patientName, formerDate, declinationReason, to) => {
    try {
        const htmlTemplate = (0, RescheduleDeclination_1.RescheduleEventDeclinationTemplate)({
            staffName,
            patientName,
            formerDate,
            declinationReason,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Reschedule Declination`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending reschedule event declination email: ', error);
    }
};
exports.sendRescheduleEventDeclination = sendRescheduleEventDeclination;
const sendAdminParentSignatureConfirmation = async (parentName, childName, invitationLink, dateOfSignature, to) => {
    try {
        const htmlTemplate = (0, adminConfirmationTreatment_1.AdminParentSignatureConfirmationTemplate)({
            parentName,
            childName,
            invitationLink,
            dateOfSignature,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Parent Signature Confirmation`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending parent signature confirmation email: ', error);
    }
};
exports.sendAdminParentSignatureConfirmation = sendAdminParentSignatureConfirmation;
const sendRequestParentSignature = async (parentName, childName, invitationLink, to) => {
    try {
        const htmlTemplate = (0, parentTreatmentSignatureRequest_1.RequestParentSignatureTemplate)({
            parentName,
            childName,
            invitationLink,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Parent Signature Request`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending parent signature request email: ', error);
    }
};
exports.sendRequestParentSignature = sendRequestParentSignature;
const sendParentSignatureConfirmation = async (parentName, childName, invitationLink, to) => {
    try {
        const htmlTemplate = (0, treatmentSignatureConfirmation_1.ParentSignatureConfirmationTemplate)({
            parentName,
            childName,
            invitationLink,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Parent Signature Confirmation`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending parent signature confirmation email: ', error);
    }
};
exports.sendParentSignatureConfirmation = sendParentSignatureConfirmation;
const sendSharedTreatmentPlan = async (recipientName, childName, invitationLink, to) => {
    try {
        const htmlTemplate = (0, shareTreatmentPlan_1.SharedTreatmentPlanTemplate)({
            recipientName,
            childName,
            invitationLink,
        });
        await sendEmail({
            from: process.env.NODEMAILER_USER,
            to,
            subject: `Shared Treatment Plan`,
            template: htmlTemplate,
        });
    }
    catch (error) {
        console.error('Error sending shared treatment plan email: ', error);
    }
};
exports.sendSharedTreatmentPlan = sendSharedTreatmentPlan;
//# sourceMappingURL=emailService.js.map