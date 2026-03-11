/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Head,
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
  formerDate?: string;
  declinationReason?: string;
}

const RescheduleEventDeclination = ({ staffName, patientName, formerDate, declinationReason }: formReviewProps) => {
  const previewText = `Your reschedule event has been approved on Creed`;

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
            <Text className="text-black text-[14px] leading-[24px]">Dear {staffName} </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We regret to inform you that the reschedule request for your appointment with{' '}
              <strong>{patientName}</strong> has been declined.
            </Text>
            <br />
            <Text>
              Appointment Details:
              <ul>
                <strong>
                  <li>Patient Name : {patientName}</li>
                  <li>Scheduled Date & Time : {formerDate}</li>
                </strong>
              </ul>
              <Text>
                <strong> Reason for Decline: </strong> {declinationReason}
              </Text>
              Hence, the appointment will remain at its original time. If you have any further questions or need to
              discuss this matter, please feel free to reach out.
              <br />
              You can view the appointment details on your schedule.
            </Text>
            <br />
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${process.env.FRONTEND_URL}/schedule`}
            >
              View Schedule
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

export const RescheduleEventDeclinationTemplate = ({ staffName, patientName, formerDate, declinationReason }) =>
  ReactDOMServer.renderToStaticMarkup(
    <RescheduleEventDeclination
      staffName={staffName}
      patientName={patientName}
      formerDate={formerDate}
      declinationReason={declinationReason}
    />,
  );

export default RescheduleEventDeclinationTemplate;
