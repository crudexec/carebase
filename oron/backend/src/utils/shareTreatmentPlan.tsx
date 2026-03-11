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
  recipientName?: string;
  childName?: string;
  invitationLink?: string;
}

const SharedTreatmentPlan = ({ recipientName, childName, invitationLink }: formReviewProps) => {
  const previewText = `Kindly sign your ward's treatment plan on Creed`;

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
            <Text className="text-black text-[14px] leading-[24px]">
              Dear <strong>{recipientName}</strong>,{' '}
            </Text>
            <Text>
              You have received the treatment plan for {childName}. Kindly find attached a copy of the latest version
              for your reference.
            </Text>
            <Text>
              If you have any questions or need further clarifications, please don't hesitate to reach out to us.
            </Text>
            <Text>Please note, you have 48 hours to complete the signature process.</Text>
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${invitationLink}`}
            >
              Download Treatment Plan
            </Button>
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

export const SharedTreatmentPlanTemplate = ({ childName, recipientName, invitationLink }) =>
  ReactDOMServer.renderToStaticMarkup(
    <SharedTreatmentPlan recipientName={recipientName} childName={childName} invitationLink={invitationLink} />,
  );

export default SharedTreatmentPlanTemplate;
