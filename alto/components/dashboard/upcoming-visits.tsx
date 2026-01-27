"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Visit {
  id: string;
  patientName: string;
  patientId: string;
  caregiverName: string;
  visitType: string;
  scheduledTime: Date;
  duration: number;
  address: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
}

export function UpcomingVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    // TODO: Implement actual API calls to get upcoming visits
    setTimeout(() => {
      setVisits([
        {
          id: "1",
          patientName: "Sarah Johnson",
          patientId: "P001",
          caregiverName: "Nurse Wilson",
          visitType: "Skilled Nursing",
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          duration: 60,
          address: "123 Oak St, Springfield",
          status: "confirmed",
          priority: "high",
        },
        {
          id: "2",
          patientName: "Robert Chen",
          patientId: "P002",
          caregiverName: "Therapist Davis",
          visitType: "Physical Therapy",
          scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          duration: 45,
          address: "456 Pine Ave, Springfield",
          status: "scheduled",
          priority: "medium",
        },
        {
          id: "3",
          patientName: "Maria Garcia",
          patientId: "P003",
          caregiverName: "Social Worker Lee",
          visitType: "Social Work",
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 30,
          address: "789 Elm Dr, Springfield",
          status: "scheduled",
          priority: "medium",
        },
        {
          id: "4",
          patientName: "James Brown",
          patientId: "P004",
          caregiverName: "Nurse Johnson",
          visitType: "Wound Care",
          scheduledTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow
          duration: 75,
          address: "321 Maple Ln, Springfield",
          status: "confirmed",
          priority: "high",
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeLabel = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "MMM dd");
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white via-blue-50 to-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Upcoming Visits
          </CardTitle>
          <CardDescription className="text-gray-600">
            Today's and upcoming patient visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3" />
                  </div>
                  <div className="h-6 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50 to-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Upcoming Visits
        </CardTitle>
        <CardDescription className="text-gray-600">
          Today's and upcoming patient visits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visits.map((visit) => (
            <Link key={visit.id} href={`/schedule/${visit.id}`}>
              <div className="group relative p-5 bg-gradient-to-r from-white via-white to-blue-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-100/50 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <div className="relative flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                      {visit.patientName}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {visit.visitType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={`${getPriorityColor(visit.priority)} shadow-sm font-medium`}
                      variant="secondary"
                    >
                      {visit.priority}
                    </Badge>
                    <Badge
                      className={`${getStatusColor(visit.status)} shadow-sm font-medium`}
                      variant="secondary"
                    >
                      {visit.status}
                    </Badge>
                  </div>
                </div>

                <div className="relative space-y-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">
                      {getTimeLabel(visit.scheduledTime)} at{" "}
                      {format(visit.scheduledTime, "HH:mm")}
                      <span className="text-gray-500 ml-1">
                        ({visit.duration} min)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">{visit.caregiverName}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <div className="p-1.5 bg-orange-100 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="truncate font-medium">
                      {visit.address}
                    </span>
                  </div>
                </div>

                <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-gradient-to-br from-blue-400/10 to-indigo-400/20 rounded-full blur-lg" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-100">
          <Link
            href="/schedule"
            className="inline-flex items-center text-sm bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200"
          >
            View full schedule →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
