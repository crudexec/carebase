/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

export interface formReviewProps {
  staffName?: string;
  patientName?: string;
  clientName?: string;
  location?: string;
  newDate?: string;
  note?: string;
}

const CalendarEventConfirmation = ({ staffName, note, patientName, newDate, location }: formReviewProps) => {
  const previewText = `New Event Schedule Request on Creed`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png"
                width="auto"
                height="37"
                alt="Creed"
                className="my-0"
              />
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">Dear {staffName},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You have been scheduled for an appointment with <strong>{patientName}</strong>. Appointment Details:
              <ul>
                <strong>
                  <li>Patient Name : {patientName}</li>
                  <li>Date & Time: {newDate}</li>
                  <li>Location: {location}</li>
                  {note && <li>Note: {note}</li>}
                </strong>
              </ul>
              Please review the appointment details on your schedule.
            </Text>
            <br />
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${process.env.FRONTEND_URL}/schedule`}
            >
              View Schedule
            </Button>
            <Text>If you have any concerns or need to make further adjustments, please contact support.</Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Section className="mt-[32px]">
              <Img
                src="https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png"
                width="auto"
                height="15"
                alt="Creed"
                className="my-0"
              />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const CalendarEventReceipt = ({ staffName, note, patientName, newDate, location }) =>
  ReactDOMServer.renderToStaticMarkup(
    <CalendarEventConfirmation
      staffName={staffName}
      note={note}
      patientName={patientName}
      newDate={newDate}
      location={location}
    />,
  );

export default CalendarEventReceipt;
