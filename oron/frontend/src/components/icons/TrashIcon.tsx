import React from "react";

const TrashIcon = ({ color = "#475569" }: { color?: string }) => {
  return (
    <svg
      width="16"
      height="19"
      viewBox="0 0 16 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 4.5013H15.5M13.8333 4.5013V16.168C13.8333 17.0013 13 17.8346 12.1667 17.8346H3.83333C3 17.8346 2.16667 17.0013 2.16667 16.168V4.5013M4.66667 4.5013V2.83464C4.66667 2.0013 5.5 1.16797 6.33333 1.16797H9.66667C10.5 1.16797 11.3333 2.0013 11.3333 2.83464V4.5013M6.33333 8.66797V13.668M9.66667 8.66797V13.668"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default TrashIcon;
