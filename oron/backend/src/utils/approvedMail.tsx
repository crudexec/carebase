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
  onboardingLink?: string;
}

const ApproveFormTemplate = ({ username, formName, onboardingLink }: formReviewProps) => {
  const previewText = `${formName} has been approved on Creed`;

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
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Congratulations! Your {formName} Has Been Approved
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Congratulations! Your <strong>{formName}</strong> has been reviewed and approved by our admin team. To
              complete the remaining onboarding forms, please click the button below:{' '}
            </Text>

            <br />

            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={onboardingLink}
            >
              Complete Onboarding
            </Button>

            <Text>
              If you have any questions or concerns, feel free to reach out to our support team. We're here to assist
              you every step of the way.
            </Text>

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

export const adminApproval = ({ username, formName, onboardingLink }) =>
  ReactDOMServer.renderToStaticMarkup(
    <ApproveFormTemplate username={username} formName={formName} onboardingLink={onboardingLink} />,
  );

export default adminApproval;
