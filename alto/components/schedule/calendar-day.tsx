import React from "react";

const CalendarDay = () => {
  return (
    <table className="w-full mt-5">
      <thead>
        <tr className="grid grid-cols-[70px_1fr] w-full">
          <th className="border-gray-300 border-[0.5px] bg-secondary !font-medium"></th>
          <th className="border-gray-300 border-[0.5px] bg-secondary !font-medium uppercase">
            Wednesday
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          "all day",
          "12am",
          "1am",
          "2am",
          "3am",
          "4am",
          "5am",
          "6am",
          "7am",
          "8am",
          "9am",
          "10am",
          "11am",
          "12pm",
          "1pm",
          "2pm",
          "3pm",
          "4pm",
          "5pm",
          "6pm",
          "7pm",
          "8pm",
          "9pm",
          "10pm",
          "11pm",
        ].map((time, index) => (
          <tr className="grid grid-cols-[70px_1fr] w-full" key={index}>
            <td className="border-gray-300 border-[0.5px] bg-secondary !font-medium text-center">
              {time}
            </td>
            <td className="border-gray-300 border-[0.5px]"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CalendarDay;
