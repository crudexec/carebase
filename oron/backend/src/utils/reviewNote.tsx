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
  reviewNote?: string;
}

const SendFormReviewTemplate = ({ username, formName, reviewNote }: formReviewProps) => {
  const previewText = `${formName} has been reviewed on Creed`;

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
              Your {formName} Has Been Reviewed
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for submitting your <strong>{formName}</strong>. Our team has carefully reviewed your
              application, and we regret to inform you that it has not been approved at this time.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">Feedback from the reviewer:</Text>
            <Text className="text-black text-[14px] leading-[24px] ">
              <strong>"{reviewNote}"</strong>
            </Text>
            <Text>Kindly login to your employee portal to update the information.</Text>
            <br />

            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={process.env.FRONTEND_URL}
            >
              Update Information
            </Button>
            <Text>
              If you have any further questions or need clarification on the feedback provided, please don't hesitate to
              reach out to our support team.
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

export const adminReview = ({ username, formName, reviewNote }) =>
  ReactDOMServer.renderToStaticMarkup(
    <SendFormReviewTemplate username={username} formName={formName} reviewNote={reviewNote} />,
  );

export default adminReview;
