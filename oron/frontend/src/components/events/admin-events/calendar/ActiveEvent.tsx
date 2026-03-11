"use client";

import { formatDate } from "@/utils";
import { PersonIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { EditIcon, File, TrashIcon, Users, XIcon } from "lucide-react";
import { RefObject, SetStateAction } from "react";
import { Event } from "../types";

interface Props {
  eventBoxRef: RefObject<HTMLDivElement>;
  isMediumScreenOrLess: boolean;
  eventPosition: {
    top: number;
    left: number;
  };
  handleEditEvent: (id: string) => void;
  setActiveEvent: (value: SetStateAction<Event | null>) => void;
  activeEvent: Event;
  handleDeleteEvent: (id: string) => void;
  clearAllInputs: () => void;
  setStaff: (value: SetStateAction<string>) => void;
  setNotes: (value: SetStateAction<string>) => void;
}

const ActiveEvent = ({
  eventBoxRef,
  isMediumScreenOrLess,
  eventPosition,
  handleEditEvent,
  setActiveEvent,
  activeEvent,
  handleDeleteEvent,
  clearAllInputs,
  setStaff,
  setNotes,
}: Props) => {
  return (
    <div
      ref={eventBoxRef}
      className={`flex flex-col p-5 bg-white border border-gray-300 shadow-lg w-full lg:w-[480px] md:w-[80%] z-50 rounded-[12px] fixed justify-center left-0 right-0 lg:justify-normal lg:absolute `}
      style={
        isMediumScreenOrLess
          ? undefined
          : {
              position: "absolute",
              top: eventPosition.top,
              left: eventPosition.left,
            }
      }
    >
      <div className="flex gap-5 justify-end items-center flex-wrap">
        <button
          onClick={() => {
            handleEditEvent(activeEvent.id);
            setActiveEvent(null);
          }}
        >
          <EditIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
        </button>
        <button
          onClick={() => {
            handleDeleteEvent(activeEvent.id);
            setActiveEvent(null);
            clearAllInputs();
            setStaff("");
            setNotes("");
          }}
        >
          <TrashIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
        </button>
        <button
          onClick={() => {
            clearAllInputs();
            setStaff("");
            setNotes("");
            setActiveEvent(null);
          }}
        >
          <XIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[#101828] text-[24px] font-[600]">
          {format(new Date(activeEvent.start), "eeee")} -{" "}
          {formatDate(new Date(activeEvent.end))}
        </h4>
        <p className="text-[#475569] text-[16px] font-[400]">
          {activeEvent.content.start} - {activeEvent.content.end}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center gap-5 flex-wrap">
          <p className="text-[#0F172A] text-[16px] font-[400] flex items-center">
            <PersonIcon className="w-5 h-5" />
            <span className="font-[800] ml-5 pr-2">Client:</span>{" "}
            {activeEvent.client}
          </p>

          <p className="text-[#0F172A] text-[16px] font-[400] flex items-center">
            <Users className="w-5 h-5" />
            <span className="font-[800] ml-5 pr-2">Staff:</span>{" "}
            {activeEvent.staff}
          </p>
        </div>

        {activeEvent.notes && activeEvent.notes?.length > 0 && (
          <p className="text-[#0F172A] text-[16px] font-[400] flex gap-5 items-center">
            <File className="w-5 h-5" />
            {activeEvent.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActiveEvent;
