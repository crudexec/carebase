"use client";

import { SetStateAction, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Loader from "../Loader";
import { DatePicker } from "../calendar/CalendarSelect";
import { useToast } from "../ui/use-toast";
import { AlertCircleIcon } from "lucide-react";
import { retrieveVisitExport } from "@/use-cases/admin";
import { VisitLog } from "@/types/AdminTypes";
import { formatDateToUTCString } from "@/utils/date-utils";
import FormSelect from "../input-fields/FormSelect";
import { visitTypeOptions } from "@/utils/treatmentPlanHelpers";

interface Props {
  showModal: boolean;
  setShowModal: (value: SetStateAction<boolean>) => void;
  employeeName: string;
  employeeId: string;
}

const convertToCSV = (data: VisitLog[]): string => {
  const header = [
    "Date of Visit",
    "Client",
    "Start Time",
    "End Time",
    "No of Hours",
    "Daily Total",
  ];

  // Format date from ISO string to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .replace(/,/g, "");
  };

  // Convert any time format (e.g., "10:00 AM", "10:00am") to 24-hour format (e.g., "10:00")
  const convertTo24HourFormat = (time: string): string => {
    // Normalize the time string by removing spaces and converting to lowercase
    const normalizedTime = time.trim().toLowerCase();
    
    // Extract the time part and the period (am/pm)
    let timePart, period;
    
    if (normalizedTime.includes("am") || normalizedTime.includes("pm")) {
      // Case: "10:00am" or "10:00 am"
      timePart = normalizedTime.replace(/am|pm/g, "").trim();
      period = normalizedTime.includes("am") ? "am" : "pm";
    } else {
      // If format is unknown, return the original to avoid errors
      console.error("Time format not recognized:", time);
      return "00:00"; // Default to midnight to avoid NaN errors
    }

    let [hours, minutes] = timePart.split(":").map(Number);

    if (period === "pm" && hours !== 12) {
      hours += 12;
    } else if (period === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Parse time and calculate the difference between start and end time
  const calculateHours = (startTime: string, endTime: string): string => {
    try {
      const start = new Date(`1970-01-01T${convertTo24HourFormat(startTime)}`);
      const end = new Date(`1970-01-01T${convertTo24HourFormat(endTime)}`);

      const diffInMilliseconds = end.getTime() - start.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60); // Difference in hours
      const hours = Math.floor(diffInHours);
      const minutes = Math.floor((diffInHours - hours) * 60);

      return `${hours}:${minutes.toString().padStart(2, "0")}`; // format to HH:MM
    } catch (error) {
      console.error("Error calculating hours:", error);
      return "0:00"; // Return default value instead of NaN
    }
  };

  const groupedByDate: { [key: string]: any[] } = {};

  // Group visits by date
  data.forEach((visit) => {
    const dateKey = formatDate(visit.date_of_visit);
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    const fullName = `${visit.intake_client_details?.first_name ?? "-"} ${
      visit.intake_client_details?.last_name ?? "-"
    }`;
    groupedByDate[dateKey].push({
      client: fullName,
      start_time: visit.start_time,
      end_time: visit.end_time,
      no_of_hours: calculateHours(visit.start_time, visit.end_time),
    });
  });

  const rows: string[] = [];
  let grandTotalHours = 0;

  // Iterate over each date and calculate daily total
  Object.keys(groupedByDate).forEach((date) => {
    const visits = groupedByDate[date];
    let dailyTotal = 0;

    visits.forEach((visit, index) => {
      const [hours, minutes] = visit.no_of_hours.split(":").map(Number);
      dailyTotal += hours + minutes / 60;

      // For the last visit of the day, show daily total in the same row
      const dailyTotalFormatted =
        index === visits.length - 1
          ? `${Math.floor(dailyTotal)}:${Math.floor((dailyTotal % 1) * 60)
              .toString()
              .padStart(2, "0")}`
          : "";

      rows.push(
        `${index === 0 ? date : ""},${visit.client},${visit.start_time},${
          visit.end_time
        },${visit.no_of_hours},${dailyTotalFormatted}`
      );
    });

    grandTotalHours += dailyTotal;
  });

  // Append the Grand Total row
  const grandTotalFormatted = `${Math.floor(grandTotalHours)}:${Math.floor(
    (grandTotalHours % 1) * 60
  )
    .toString()
    .padStart(2, "0")}`;
  rows.push(`,,,,,${grandTotalFormatted}`); // Grand total without the label

  // Combine header and rows to form CSV
  return [header.join(","), ...rows].join("\n");
};

const ExportVisits = ({
  showModal,
  setShowModal,
  employeeName,
  employeeId,
}: Props) => {
  const { toast } = useToast();

  const [visitType, setVisitType] = useState("");
  const [date, setDate] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: undefined,
    end: undefined,
  });
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<VisitLog[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    try {
      setIsError(false);
      setIsLoading(true);

      if (!visitType) {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          description: "Please select visit type",
        });
      }

      if (!date.start || !date.end) {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          description: "Please select start and end date",
        });
      }

      const startDateString = formatDateToUTCString(date.start);
      const endDateString = formatDateToUTCString(date.end);

      const token = localStorage.getItem("token") as string;
      const response = await retrieveVisitExport(
        token,
        employeeId,
        startDateString,
        endDateString,
        visitType
      );

      if (response.data.length === 0) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      setIsError(false);
      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const exportVisit = () => {
    if (!previewData || previewData.length === 0) {
      return toast({
        variant: "destructive",
        description: "No data to export. Please preview first.",
      });
    }

    const csvData = convertToCSV(previewData);

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${employeeName} Visit Logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      variant: "default",
      description: (
        <>
          Visits for <strong>{employeeName}</strong> have been successfully
          exported as a CSV file.
        </>
      ),
    });
  };

  const handleClose = () => {
    setShowModal(false);
    setShowPreview(false);
    setPreviewData(null);
    setIsError(false);
    setVisitType("");
    setDate({ start: undefined, end: undefined });
  };

  const calculateHours = (startTime: string, endTime: string): string => {
    try {
      const convertTo24HourFormat = (time: string): string => {
        const normalizedTime = time.trim().toLowerCase();
        let timePart, period;

        if (normalizedTime.includes("am") || normalizedTime.includes("pm")) {
          timePart = normalizedTime.replace(/am|pm/g, "").trim();
          period = normalizedTime.includes("am") ? "am" : "pm";
        } else {
          return "00:00";
        }

        let [hours, minutes] = timePart.split(":").map(Number);

        if (period === "pm" && hours !== 12) {
          hours += 12;
        } else if (period === "am" && hours === 12) {
          hours = 0;
        }

        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      };

      const start = new Date(`1970-01-01T${convertTo24HourFormat(startTime)}`);
      const end = new Date(`1970-01-01T${convertTo24HourFormat(endTime)}`);

      const diffInMilliseconds = end.getTime() - start.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
      const hours = Math.floor(diffInHours);
      const minutes = Math.floor((diffInHours - hours) * 60);

      return `${hours}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      return "0:00";
    }
  };

  return (
    <div>
      <Dialog open={showModal} onOpenChange={handleClose}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[12px] flex flex-col gap-5 max-w-5xl max-h-[90vh]"
        >
          <div className="w-full flex gap-5 justify-center items-center ml-auto">
            <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
              Export Visits for {employeeName}
            </h2>
          </div>

          {isError && (
            <div className="flex gap-3 items-start border-[1px] border-[#FDA29B] bg-[#FFFBFA] p-5 rounded-[8px]">
              <AlertCircleIcon className="w-6 h-6 text-[#D92D20]" />
              <p className="text-[14px] font-[400] text-[#B42318]">
                No visits found for the selected date range. Please select a
                different date range.
              </p>
            </div>
          )}

          {!showPreview ? (
            <>
              <FormSelect
                labelText="Visit Type"
                placeholder="Select Visit Type"
                selectContent={visitTypeOptions}
                value={visitType}
                onValueChange={(value: any) => setVisitType(value)}
              />

              <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                <DatePicker
                  getDate={(date) =>
                    setDate((prev) => ({
                      ...prev,
                      start: date,
                    }))
                  }
                  label="Start Date"
                />
                <DatePicker
                  getDate={(date) =>
                    setDate((prev) => ({
                      ...prev,
                      end: date,
                    }))
                  }
                  label="End Date"
                />
              </div>

              <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  disabled={isLoading}
                  className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-5 py-3 text-black disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePreview}
                  disabled={isLoading}
                  className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center"
                >
                  {isLoading ? <Loader height="h-fit" /> : "Preview Visits"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Client</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Start Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">End Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData?.map((visit, index) => {
                      const clientName = `${visit.intake_client_details?.first_name ?? "-"} ${visit.intake_client_details?.last_name ?? "-"}`;
                      const hours = calculateHours(visit.start_time, visit.end_time);
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(visit.date_of_visit).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{clientName}</td>
                          <td className="px-4 py-3 text-gray-700">{visit.start_time}</td>
                          <td className="px-4 py-3 text-gray-700">{visit.end_time}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{hours}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600">
                  Total Visits: <span className="font-semibold text-gray-900">{previewData?.length || 0}</span>
                </p>
              </div>

              <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap">
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-5 py-3 text-black hover:bg-[#E2E8F0] flex items-center gap-3 text-center justify-center"
                >
                  Back
                </button>

                <button
                  onClick={exportVisit}
                  className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white flex items-center text-center justify-center"
                >
                  Export to CSV
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportVisits;
