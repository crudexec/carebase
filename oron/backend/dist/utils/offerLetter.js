"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferLetterEmail = void 0;
const components_1 = require("@react-email/components");
const React = __importStar(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const OfferLetterTemplate = ({ username }) => {
    const previewText = `Offer letter from Creed`;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null, previewText),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans" },
                React.createElement(components_1.Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
                    React.createElement(components_1.Section, { className: "mt-[32px]" },
                        React.createElement(components_1.Img, { src: "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png", width: "auto", height: "37", alt: "Creed", className: "my-0" })),
                    React.createElement(components_1.Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" }, "Congratulations! Your Offer Letter From Creed"),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" },
                        "Dear ",
                        React.createElement("strong", null, username),
                        ","),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" }, "On behalf of the team at Creed, I'm delighted to extend this official offer of employment to you. We're excited to welcome you aboard and have you join our talented workforce. Please log in to the Creed platform, where you'll find your offer letter available for review and electronic signature. We kindly ask that you carefully read through the details and provide your acceptance by signing the document within the platform."),
                    React.createElement("br", null),
                    React.createElement(components_1.Button, { className: "bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5", href: `${process.env.FRONTEND_URL}/onboarding/form/offer-letter` }, "Sign Offer Letter"),
                    React.createElement(components_1.Text, null, "If you have any questions or concerns, feel free to reach out to our support team. We're here to assist you every step of the way."),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Section, { className: "mt-[32px]" },
                        React.createElement(components_1.Img, { src: "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png", width: "auto", height: "15", alt: "Creed", className: "my-0" })))))));
};
const OfferLetterEmail = ({ username }) => server_1.default.renderToStaticMarkup(React.createElement(OfferLetterTemplate, { username: username }));
exports.OfferLetterEmail = OfferLetterEmail;
exports.default = exports.OfferLetterEmail;
//# sourceMappingURL=offerLetter.js.map