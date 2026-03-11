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
  parentName?: string;
  childName?: string;
  invitationLink?: string;
}

const RequestParentSignature = ({ parentName, childName, invitationLink }: formReviewProps) => {
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
              Dear <strong>{parentName}</strong>,{' '}
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">We hope this message finds you well.</Text>
            <br />
            <Text>
              You have received the treatment plan for {childName} regarding their upcoming care. As part of the
              process, we kindly ask you to review the document and provide your signature to confirm your approval.
            </Text>
            <Text>Please note, you have 48 hours to complete the signature process.</Text>
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={`${invitationLink}`}
            >
              Review and Sign the Treatment Plan
            </Button>
            <Text>
              If you have any questions or need assistance, don’t hesitate to reach out to us. We appreciate your prompt
              attention to this matter, and thank you for your cooperation.
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

export const RequestParentSignatureTemplate = ({ childName, parentName, invitationLink }) =>
  ReactDOMServer.renderToStaticMarkup(
    <RequestParentSignature parentName={parentName} childName={childName} invitationLink={invitationLink} />,
  );

export default RequestParentSignatureTemplate;
