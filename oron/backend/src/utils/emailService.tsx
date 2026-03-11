import nodemailer from 'nodemailer';

import { AdminParentSignatureConfirmationTemplate } from './adminConfirmationTreatment';
import { adminApproval } from './approvedMail';
import { CalendarEventReceipt } from './eventScheduleConfirmation';
import { forgotPasswordEmail } from './forgotPasswordTemplate';
import { OfferLetterEmail } from './offerLetter';
import { RequestParentSignatureTemplate } from './parentTreatmentSignatureRequest';
import { RescheduleEventApprovalTemplate } from './RescheduleApproval';
import { RescheduleEventDeclinationTemplate } from './RescheduleDeclination';
import { RescheduleReview } from './rescheduleEvents';
import { adminReview } from './reviewNote';
import { ParentSignatureConfirmationTemplate } from './treatmentSignatureConfirmation';
import { SharedTreatmentPlanTemplate } from './shareTreatmentPlan';

const transporter = nodemailer.createTransport({
  port: Number(process.env.NODEMAILER_PORT),
  host: process.env.NODEMAILER_HOST,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
  from: process.env.NODEMAILER_USER,
  secure: false,
} as nodemailer.SendMailOptions);

// Function to send an email
export async function sendEmail({ from, subject, template, to }) {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER as string,
      to: to as string,
      subject,
      html: template,
    };
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}

export const SendReviewEmail = async (username, formName, reviewNote, to) => {
  try {
    const htmlTemplate = adminReview({
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
  } catch (error) {
    console.error('Error sending review email: ', error);
  }
};

export const SendForgotPasswordEmail = async (username, token, to) => {
  try {
    const htmlTemplate = forgotPasswordEmail({
      username,
      token,
    });
    await sendEmail({
      from: process.env.NODEMAILER_USER,
      to,
      subject: `Forgot Password Request`,
      template: htmlTemplate,
    });
  } catch (error) {
    console.error('Error sending forgot password email: ', error);
  }
};

export const sendApproveMail = async (username, formName, to) => {
  try {
    const htmlTemplate = adminApproval({
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
  } catch (error) {
    console.error('Error sending approve email: ', error);
  }
};

export const sendOfferLetter = async (username, to) => {
  try {
    const htmlTemplate = OfferLetterEmail({
      username,
    });
    await sendEmail({
      from: process.env.NODEMAILER_USER,
      to,
      subject: `Offer Letter`,
      template: htmlTemplate,
    });
  } catch (error) {
    console.error('Error sending offer letter email: ', error);
  }
};

export const sendRescheduleEmail = async (username, rescheduleReason, clientName, formerDate, newDate, to) => {
  try {
    const htmlTemplate = RescheduleReview({
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
  } catch (error) {
    console.error('Error sending reschedule email: ', error);
  }
};

export const sendCalendarEventReceipt = async (staffName, note, patientName, newDate, location, to) => {
  try {
    const htmlTemplate = CalendarEventReceipt({
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
  } catch (error) {
    console.error('Error sending calendar event receipt email: ', error);
  }
};

export const sendRescheduleEventApproval = async (staffName, patientName, formerDate, newDate, to) => {
  try {
    const htmlTemplate = RescheduleEventApprovalTemplate({
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
  } catch (error) {
    console.error('Error sending reschedule event approval email: ', error);
  }
};

export const sendRescheduleEventDeclination = async (staffName, patientName, formerDate, declinationReason, to) => {
  try {
    const htmlTemplate = RescheduleEventDeclinationTemplate({
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
  } catch (error) {
    console.error('Error sending reschedule event declination email: ', error);
  }
};

export const sendAdminParentSignatureConfirmation = async (
  parentName,
  childName,
  invitationLink,
  dateOfSignature,
  to,
) => {
  try {
    const htmlTemplate = AdminParentSignatureConfirmationTemplate({
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
  } catch (error) {
    console.error('Error sending parent signature confirmation email: ', error);
  }
};

export const sendRequestParentSignature = async (parentName, childName, invitationLink, to) => {
  try {
    const htmlTemplate = RequestParentSignatureTemplate({
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
  } catch (error) {
    console.error('Error sending parent signature request email: ', error);
  }
};

export const sendParentSignatureConfirmation = async (parentName, childName, invitationLink, to) => {
  try {
    const htmlTemplate = ParentSignatureConfirmationTemplate({
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
  } catch (error) {
    console.error('Error sending parent signature confirmation email: ', error);
  }
};

export const sendSharedTreatmentPlan = async (recipientName, childName, invitationLink, to) => {
  try {
    const htmlTemplate = SharedTreatmentPlanTemplate({
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
  } catch (error) {
    console.error('Error sending shared treatment plan email: ', error);
  }
};
