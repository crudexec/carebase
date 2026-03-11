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
exports.RescheduleEventApprovalTemplate = void 0;
const components_1 = require("@react-email/components");
const React = __importStar(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const RescheduleEventApproval = ({ staffName, patientName, formerDate, newDate }) => {
    const previewText = `Your reschedule event has been approved on Creed`;
    return (React.createElement(components_1.Html, null,
        React.createElement(components_1.Head, null),
        React.createElement(components_1.Preview, null, previewText),
        React.createElement(components_1.Tailwind, null,
            React.createElement(components_1.Body, { className: "bg-white my-auto mx-auto font-sans" },
                React.createElement(components_1.Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
                    React.createElement(components_1.Section, { className: "mt-[32px]" },
                        React.createElement(components_1.Img, { src: "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png", width: "auto", height: "37", alt: "Creed", className: "my-0" })),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" },
                        "Dear ",
                        staffName,
                        " "),
                    React.createElement(components_1.Text, { className: "text-black text-[14px] leading-[24px]" },
                        "We are pleased to inform you that the reschedule request for your appointment with",
                        ' ',
                        React.createElement("strong", null, patientName),
                        " has been approved."),
                    React.createElement("br", null),
                    React.createElement(components_1.Text, null,
                        "Updated Appointment Details:",
                        React.createElement("ul", null,
                            React.createElement("strong", null,
                                React.createElement("li", null,
                                    "Patient Name : ",
                                    patientName),
                                React.createElement("li", null,
                                    "Original Appointment Date & Time : ",
                                    formerDate),
                                React.createElement("li", null,
                                    "New Appointment Date & Time : ",
                                    newDate))),
                        "The patient has been notified of the new appointment time. If you have any concerns or need to make further adjustments, please contact support. You can view the updated appointment details on your schedule."),
                    React.createElement("br", null),
                    React.createElement(components_1.Button, { className: "bg-[#2563EB] rounded text-white text-[12px] font-semibold no-underline text-center py-3 px-5", href: `${process.env.FRONTEND_URL}/schedule` }, "View Schedule"),
                    React.createElement(components_1.Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
                    React.createElement(components_1.Section, { className: "mt-[32px]" },
                        React.createElement(components_1.Img, { src: "https://minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io/orondocs/1720820824026-creed_logo.png", width: "auto", height: "15", alt: "Creed", className: "my-0" })))))));
};
const RescheduleEventApprovalTemplate = ({ staffName, patientName, formerDate, newDate }) => server_1.default.renderToStaticMarkup(React.createElement(RescheduleEventApproval, { staffName: staffName, patientName: patientName, formerDate: formerDate, newDate: newDate }));
exports.RescheduleEventApprovalTemplate = RescheduleEventApprovalTemplate;
exports.default = exports.RescheduleEventApprovalTemplate;
//# sourceMappingURL=RescheduleApproval.js.map