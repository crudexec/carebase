"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Search, UserPlus } from "lucide-react";
import Button from "@/components/button/Button";
import CreateUserModal from "./CreateUserModal";
import { UserTableContainer } from "./UsersColumns";
import { UsersTable } from "./UsersTable";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchUsersWithForms } from "@/use-cases/admin";
import { AllUsersResponse } from "@/types/AdminTypes";
import useUserData from "@/hooks/admin/useUserData";
import { searchEmployee } from "@/actions/admin/search-employee-table";
import { debounce } from "@/utils/helpers";

type UserRoleFilter = "STANDARD" | "CLIENT_MANAGER" | "ADMINISTRATOR" | "EMPLOYEE_MANAGER" | "all";
type UserStatusFilter = "ACTIVE" | "INACTIVE" | "DISENGAGED" | "all";

const AdminPageWrapper = () => {
  const router = useRouter();
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("token") as string)
      : "";
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("STANDARD");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [totalUsersInPage, setTotalUsersInPage] = useState(0);

  const [allUsers, setAllUsers] = useState<AllUsersResponse | boolean>();
  const [allUsersLoading, setAllUsersLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(
    async (newPage?: number, newSize?: number, newRole?: UserRoleFilter, newStatus?: UserStatusFilter) => {
      setAllUsersLoading(true);
      const res = await fetchUsersWithForms(
        token,
        newPage ?? page,
        newSize ?? size,
        newRole ?? roleFilter,
        newStatus ?? statusFilter
      );

      setAllUsersLoading(false);
      setAllUsers(res);
    },
    [token, page, size, roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchUsers(1, size, roleFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleFilterChange = async (newRole: UserRoleFilter) => {
    setRoleFilter(newRole);
    setPage(1);
    // Directly fetch with the new role to avoid stale closure issues
    await fetchUsers(1, size, newRole, statusFilter);
  };

  const handleStatusFilterChange = async (newStatus: UserStatusFilter) => {
    setStatusFilter(newStatus);
    setPage(1);
    // Directly fetch with the new status to avoid stale closure issues
    await fetchUsers(1, size, roleFilter, newStatus);
  };

  const { isLoading, userData, transformUserData } = useUserData(allUsers!);

  const [filteredUsers, setFilteredUsers] =
    useState<UserTableContainer[]>(userData);

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    setFilteredUsers(userData);
  }, [userData]);

  useEffect(() => {
    if (typeof allUsers !== "boolean" && allUsers) {
      setTotalUsersInPage(allUsers?.data?.total);
    }
  }, [allUsers]);

  const handlePageChange = async (mode: "increment" | "decrement") => {
    setPage((prevPage) => (mode === "increment" ? prevPage + 1 : prevPage - 1));
    setAllUsersLoading(true);
    await fetchUsers(mode === "increment" ? page + 1 : page - 1);
    setAllUsersLoading(false);
  };

  const handleSizeChange = async (newSize: number) => {
    setSize(newSize);
    setAllUsersLoading(true);
    await fetchUsers(page, newSize);
    setAllUsersLoading(false);
  };

  const handleUsersSearchInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value.trim().toLowerCase();

    if (query.length > 0) {
      setSearchEnabled(true);
    }

    if (query.length === 0) {
      setFilteredUsers(userData);
      setTotalUsersInPage(
        typeof allUsers !== "boolean" && allUsers ? allUsers?.data?.total : 0
      );
      setSearchEnabled(false);
      return;
    }

    setAllUsersLoading(true);
    const response = await searchEmployee(query, token);

    if (!response?.data?.usersData || response?.data?.usersData?.length === 0) {
      setAllUsersLoading(false);
      setFilteredUsers([]);
      setTotalUsersInPage(0);
      return;
    }

    const modifiedData = await transformUserData(response);
    setTotalUsersInPage(modifiedData.length);
    setAllUsersLoading(false);
    setFilteredUsers(modifiedData);
  };

  const debouncedHandleUsersSearchInputChange = debounce(
    handleUsersSearchInputChange,
    500
  );

  return (
    <section className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-wrap gap-10 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] font-[600] text-[#101828]">Employees</h2>
          <p className="text-[16px] font-[400] text-[#475467]">
            Manage all employees here
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search employees"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full md:w-[336px] outline-none focus:border-none"
              onChange={debouncedHandleUsersSearchInputChange}
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create User
          </Button>
        </div>
      </div>

      <CreateUserModal
        open={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onUserCreated={() => fetchUsers()}
      />

      <div className="w-full flex gap-5 border-b-[1px] border-[#EAECF0]">
        <button
          onClick={() => handleRoleFilterChange("STANDARD")}
          className={`text-[14px] font-[600] pb-3 ${
            roleFilter === "STANDARD"
              ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
              : "text-[#667085]"
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => handleRoleFilterChange("CLIENT_MANAGER")}
          className={`text-[14px] font-[600] pb-3 ${
            roleFilter === "CLIENT_MANAGER"
              ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
              : "text-[#667085]"
          }`}
        >
          Client Managers
        </button>
        <button
          onClick={() => handleRoleFilterChange("ADMINISTRATOR")}
          className={`text-[14px] font-[600] pb-3 ${
            roleFilter === "ADMINISTRATOR"
              ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
              : "text-[#667085]"
          }`}
        >
          Administrators
        </button>
        <button
          onClick={() => handleRoleFilterChange("EMPLOYEE_MANAGER")}
          className={`text-[14px] font-[600] pb-3 ${
            roleFilter === "EMPLOYEE_MANAGER"
              ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
              : "text-[#667085]"
          }`}
        >
          Employee Managers
        </button>
        <button
          onClick={() => handleRoleFilterChange("all")}
          className={`text-[14px] font-[600] pb-3 ${
            roleFilter === "all"
              ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
              : "text-[#667085]"
          }`}
        >
          All Users
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[14px] font-[500] text-[#344054]">Status:</span>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Active
              </div>
            </SelectItem>
            <SelectItem value="INACTIVE">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                Inactive
              </div>
            </SelectItem>
            <SelectItem value="DISENGAGED">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Disengaged
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UsersTable
        allUsersLoading={allUsersLoading}
        isLoading={isLoading}
        total={totalUsersInPage}
        handlePageChange={handlePageChange}
        handleSizeChange={handleSizeChange}
        data={filteredUsers}
        page={page}
        searchEnabled={searchEnabled}
        onStatusChange={() => fetchUsers()}
      />
    </section>
  );
};

export default AdminPageWrapper;
