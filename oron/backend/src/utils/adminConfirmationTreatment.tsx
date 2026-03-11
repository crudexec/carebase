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
  dateOfSignature?: string;
  invitationLink?: string;
}

const AdminParentSignatureConfirmation = ({
  parentName,
  childName,
  invitationLink,
  dateOfSignature,
}: formReviewProps) => {
  const previewText = `A Parent has signed their ward's treatment plan on Creed`;

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
            <Text>
              The treatment plan for {childName} has been signed by {parentName}. You can view and download the signed
              treatment plan on the admin portal.
            </Text>
            <Text>Details of the signed treatment plan:</Text>
            <Text>
              <ul>
                <strong>
                  <li>Parent Name: {parentName}</li>
                </strong>
                <strong>
                  <li>Ward Name: {childName}</li>
                </strong>
                <strong>
                  <li>Date Signed: {dateOfSignature}</li>
                </strong>
              </ul>
            </Text>
            <Button
              className="bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5"
              href={invitationLink}
            >
              View Signed Treatment Plan
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

export const AdminParentSignatureConfirmationTemplate = ({ childName, parentName, invitationLink, dateOfSignature }) =>
  ReactDOMServer.renderToStaticMarkup(
    <AdminParentSignatureConfirmation
      parentName={parentName}
      childName={childName}
      invitationLink={invitationLink}
      dateOfSignature={dateOfSignature}
    />,
  );

export default AdminParentSignatureConfirmationTemplate;
