"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "@/components/button/Button";
import { createUser, CreateUserPayload } from "@/use-cases/admin";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check } from "lucide-react";

type Role = "ADMINISTRATOR" | "STANDARD" | "CLIENT_MANAGER" | "EMPLOYEE_MANAGER";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  employeeManagerMode?: boolean;
}

const CreateUserModal = ({ open, onClose, onUserCreated, employeeManagerMode }: CreateUserModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdUser, setCreatedUser] = useState<{
    email: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "STANDARD" as Role,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        variant: "destructive",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token") as string;

    try {
      const response = await createUser(token, formData as CreateUserPayload);

      setCreatedUser({
        email: response.data.email,
        password: response.data.generated_password,
        name: `${response.data.first_name} ${response.data.last_name}`,
        role: response.data.role,
      });

      toast({
        description: "User created successfully!",
      });

      onUserCreated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to create user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (createdUser) {
      const credentials = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
      navigator.clipboard.writeText(credentials);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      role: "STANDARD",
    });
    setCreatedUser(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[600] text-[#101828]">
            {createdUser ? "User Created Successfully" : "Create New User"}
          </DialogTitle>
        </DialogHeader>

        {createdUser ? (
          <div className="flex flex-col gap-5 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">
                User has been created!
              </p>
              <p className="text-sm text-green-700">
                Share these credentials with the user. The password will not be shown again.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p className="font-medium">{createdUser.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="font-medium">{createdUser.email}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Role</Label>
                <p className="font-medium">{createdUser.role}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Generated Password</Label>
                <p className="font-mono font-medium bg-white p-2 rounded border">
                  {createdUser.password}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Credentials
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className="border-[#E4E4E7]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className="border-[#E4E4E7]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="border-[#E4E4E7]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#E4E4E7] bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={employeeManagerMode}
              >
                <option value="STANDARD">Standard (Employee)</option>
                {!employeeManagerMode && (
                  <>
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="CLIENT_MANAGER">Client Manager</option>
                    <option value="EMPLOYEE_MANAGER">Employee Manager</option>
                  </>
                )}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                A secure password will be automatically generated for this user.
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
