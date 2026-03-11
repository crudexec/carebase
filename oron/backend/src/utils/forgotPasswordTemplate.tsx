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

export interface forgotPasswordProps {
  username?: string;
  token: string;
}

const ForgotPasswordTemplate = ({ username, token }: forgotPasswordProps) => {
  const previewText = `Your Forgot Password Request on Creed`;

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
              Forgot Password
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your password can be reset by clicking the button below. If you did not request a new password, please
              ignore this email.
            </Text>
            <br />

            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={token}
            >
              Reset password
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

export const forgotPasswordEmail = ({ username, token }) =>
  ReactDOMServer.renderToStaticMarkup(<ForgotPasswordTemplate username={username} token={token} />);

export default forgotPasswordEmail;
