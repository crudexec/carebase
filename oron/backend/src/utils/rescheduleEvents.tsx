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
  username?: string;
  formName?: string;
  clientName?: string;
  formerDate?: string;
  newDate?: string;
  rescheduleReason?: string;
}

const RescheduleCalendarEvent = ({ username, rescheduleReason, clientName, formerDate, newDate }: formReviewProps) => {
  const previewText = `A request for an appointment to be rescheduled on Creed`;

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
            <Text className="text-black text-[14px] leading-[24px]">Dear Admin,</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{username}</strong> has requested to reschedule an appointment with {clientName}. Please review
              the details below and take the necessary action. Current Appointment Details:
              <ul>
                <li>Patient Name : {clientName}</li>
                <li>Original Date & Time : {formerDate}</li>
              </ul>
              Requested New Appointment Details:
              <ul>
                <li>New Date & Time : {newDate}</li>
                <li>Reason for Rescheduling : {rescheduleReason}</li>
              </ul>
              Kindly review and confirm or decline the reschedule request.
            </Text>
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${process.env.FRONTEND_URL}/schedule`}
            >
              Review Request
            </Button>
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

export const RescheduleReview = ({ username, rescheduleReason, clientName, formerDate, newDate }) =>
  ReactDOMServer.renderToStaticMarkup(
    <RescheduleCalendarEvent
      username={username}
      rescheduleReason={rescheduleReason}
      clientName={clientName}
      formerDate={formerDate}
      newDate={newDate}
    />,
  );

export default RescheduleReview;
