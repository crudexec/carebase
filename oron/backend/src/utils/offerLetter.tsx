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
}

const OfferLetterTemplate = ({ username }: formReviewProps) => {
  const previewText = `Offer letter from Creed`;

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
              Congratulations! Your Offer Letter From Creed
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Dear <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              On behalf of the team at Creed, I'm delighted to extend this official offer of employment to you. We're
              excited to welcome you aboard and have you join our talented workforce. Please log in to the Creed
              platform, where you'll find your offer letter available for review and electronic signature. We kindly ask
              that you carefully read through the details and provide your acceptance by signing the document within the
              platform.
            </Text>

            <br />

            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${process.env.FRONTEND_URL}/onboarding/form/offer-letter`}
            >
              Sign Offer Letter
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

export const OfferLetterEmail = ({ username }) =>
  ReactDOMServer.renderToStaticMarkup(<OfferLetterTemplate username={username} />);

export default OfferLetterEmail;
