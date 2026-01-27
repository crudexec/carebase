"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWRMutation from "swr/mutation";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import {
  Alert,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Modal,
  SegmentedControl,
  TabsContent,
} from "@/components/ui";
import {
  AddUserHistory,
  AddUserInformation,
  CreateUserModal,
} from "@/components/user";
import ActionsCell from "@/components/user/action-button";
import { initialQuery, ROLES, userColumns, USERGROUPS } from "@/constants";
import {
  useDeleteUser,
  useDisclosure,
  useGetUsers,
  usePopulateForm,
  useTable,
} from "@/hooks";
import { getHeaderDescription, getSelectedHistory } from "@/lib";
import {
  createUserFormSchema,
  userDefaultValues,
  UserForm,
} from "@/schema/user";
import {
  userHistoryDefaultValues,
  UserHistoryForm,
  UserHistorySchema,
} from "@/schema/user/history";
import { ActionType, UserGroupType, UserListResponse } from "@/types";

function UsersPage() {
  const [active, setActive] = useQueryState("tab", { defaultValue: "all" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const {
    opened: opened3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();
  const [action, setAction] = React.useState<ActionType>();
  const [selected, setSelected] = React.useState<
    UserListResponse & { role: string }
  >();
  const [selectedHistory, setSelectedHistory] = React.useState<
    (UserHistoryForm & { id: string }) | null
  >();
  const [userId, setUserId] = React.useState("");
  const [formTab, setFormTab] = React.useState("information");
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [query, setQuery] = React.useState(initialQuery);
  const methods = useForm<UserForm>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: userDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  const userHistoryForm = useForm<UserHistoryForm>({
    resolver: zodResolver(UserHistorySchema),
    defaultValues: userHistoryDefaultValues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { data, isLoading, mutate } = useGetUsers({ tab: active });
  const {
    data: deleteResponse,
    trigger,
    isMutating,
  } = useSWRMutation("/api/user", useDeleteUser);
  const [Data, setData] = React.useState<
    (UserListResponse & { role: string })[]
  >([]);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: userColumns,
    query: query,
    setQuery: setQuery,
    name: "users",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<UserListResponse & { role: string }>) => (
        <ActionsCell
          callback={(action) => {
            const selectedHistory = getSelectedHistory(
              row.original.userHistory,
            );
            setAction(action);
            setSelected(row.original);
            setUserId(row.original.id);
            setSelectedHistory(selectedHistory);
          }}
          activeTab={active}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.users?.map((user) => ({
        ...user,
        role: ROLES.find((role) => role.value === user.role)?.label || "",
      })) || [];
    setData(tableData);
  }, [data]);

  const closeModal = () => {
    setAction(undefined);
    setSelected(undefined);
    onClose3();
    setFormTab("information");
    methods.reset(userDefaultValues);
    userHistoryForm.reset(userHistoryDefaultValues);
    setUserId("");
    setSelectedRole("");
  };

  React.useEffect(() => {
    if (deleteResponse?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${deleteResponse?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteResponse]);

  usePopulateForm<UserForm, User>(methods.reset, selected);
  usePopulateForm<UserHistoryForm, UserHistoryForm>(
    userHistoryForm.reset,
    selectedHistory as UserHistoryForm & { id: string },
  );

  const isUserGroup = (selectedRole?: string) =>
    USERGROUPS.includes(
      (ROLES.find((role) => role.label === selectedRole)
        ?.value as UserGroupType) || selectedRole,
    );

  const formTitle = getHeaderDescription(
    (selected?.role as UserGroupType) ?? active,
  ).title;

  return (
    <Shell>
      <AppLoader loading={isLoading} />
      <Alert
        title={active === "archived" ? "Activate User" : "Archive User"}
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this user?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={opened3 || action === "delete"}
        onClose={closeModal}
        callback={async () => {
          await trigger({
            ids: selected
              ? [selected.id]
              : table.getSelectedRowModel().rows.map((row) => row.original.id),
            status: active === "archived" ? "archived" : "active",
          });
        }}
        loading={isMutating}
      />

      <CreateUserModal
        title={
          action === "edit" && !isUserGroup(selected?.role)
            ? `Edit ${formTitle}`
            : action === "view" && !isUserGroup(selected?.role)
              ? `${formTitle} Details`
              : `Add ${formTitle === "All" ? ROLES.find((role) => role.value === selectedRole)?.label : formTitle}`
        }
        open={
          (!!selectedRole && !isUserGroup(selectedRole)) ||
          (action === "edit" && !isUserGroup(selected?.role)) ||
          (action === "view" && !isUserGroup(selected?.role))
        }
        refreshTable={mutate}
        onClose={closeModal}
        mode={action === "edit" || action === "view" ? action : "create"}
        selected={selected}
        role={selectedRole}
      />
      <Modal
        title={
          action === "edit" && isUserGroup(selected?.role)
            ? `Edit ${formTitle}`
            : action === "view" && isUserGroup(selected?.role)
              ? `${formTitle} Details`
              : `Add ${formTitle === "All" ? ROLES.find((role) => role.value === selectedRole)?.label : formTitle}`
        }
        open={
          (action === "edit" && isUserGroup(selected?.role)) ||
          (action === "view" && isUserGroup(selected?.role)) ||
          (!!selectedRole && isUserGroup(selectedRole))
        }
        onClose={closeModal}
        className="md:max-w-[700px]"
      >
        <SegmentedControl
          data={[
            { value: "information", label: "General Information" },
            { value: "history", label: "History" },
          ]}
          value={formTab}
          transparent
          className="mx-auto flex w-full mb-2"
          stretch
          onChange={setFormTab}
          disabled={!!selectedRole}
        >
          <TabsContent value="information">
            <AddUserInformation
              refreshTable={mutate}
              mode={action === "edit" || action === "view" ? action : "create"}
              selected={selected}
              setUserId={setUserId}
              setTab={setFormTab}
              userId={userId}
              methods={methods}
              role={selectedRole}
            />
          </TabsContent>
          <TabsContent value="history">
            <AddUserHistory
              refreshTable={mutate}
              onClose={closeModal}
              mode={action === "edit" || action === "view" ? action : "create"}
              selected={selectedHistory as UserHistoryForm & { id: string }}
              userId={userId}
              setTab={setFormTab}
              methods={userHistoryForm}
            />
          </TabsContent>
        </SegmentedControl>
      </Modal>
      <DataTable
        table={table}
        title={
          active === "all"
            ? "Active Users"
            : active == "archived"
              ? "Archived Users"
              : active?.includes("caregiver")
                ? "Caregiver Service Related Providers"
                : `${active}s`
        }
        tableKey={tableKey}
        fetching={isLoading}
        columns={tableColumns}
        subtitle={getHeaderDescription(active as UserGroupType).description}
        rawColumns={userColumns}
        setQuery={setQuery}
        search={search}
        setSearch={setSearch}
        segmentedControl={{
          data: [
            { value: "all", label: "All" },
            { value: "nurse", label: "Nurse" },
            { value: "caregiver", label: "Caregiver" },
            { value: "therapist", label: "Therapist" },
            { value: "archived", label: "Archived" },
          ],
          value: active || "all",
          onChange: setActive,
        }}
        extraToolbar={
          <>
            {active !== "archived" &&
              (active === "all" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="add user"
                      variant="default"
                      size="sm"
                      className="ml-auto h-8 lg:flex capitalize"
                    >
                      <PlusIcon />
                      Add user
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[150px]">
                    <DropdownMenuLabel className="flex items-center gap-3">
                      Select a Role{" "}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ROLES?.map((item, index) => (
                      <div key={index}>
                        <DropdownMenuItem
                          key={index}
                          onClick={() => {
                            setSelectedRole(item.value);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {
                              ROLES.find((role) => role.value === item.value)
                                ?.label
                            }
                          </div>
                        </DropdownMenuItem>
                        {index !== ROLES?.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  aria-label="add user"
                  variant="default"
                  size="sm"
                  className="ml-auto h-8 lg:flex capitalize"
                  onClick={() => {
                    setSelectedRole(active);
                  }}
                >
                  <PlusIcon />
                  Add {getHeaderDescription(active as UserGroupType).title}
                </Button>
              ))}
            {(table.getIsSomeRowsSelected() ||
              table.getIsAllRowsSelected()) && (
              <>
                <Button
                  aria-label="Activate or Archive"
                  variant={active === "archived" ? "default" : "destructive"}
                  size="sm"
                  className="ml-auto h-8 lg:flex"
                  onClick={onOpen3}
                >
                  <TrashIcon className=" size-4" />
                  {active === "archived" ? "Activate" : "Archive"}
                </Button>
              </>
            )}
          </>
        }
      />
    </Shell>
  );
}

export default UsersPage;
