"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Receipt,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

type ExpenseInput = z.infer<typeof expenseSchema>;

const categories = [
  "Inventory",
  "Rent",
  "Utilities",
  "Salaries",
  "Marketing",
  "Transportation",
  "Equipment",
  "Supplies",
  "Other",
];

// Sample data - in production this would come from API
const sampleExpenses = [
  {
    id: "1",
    category: "Inventory",
    description: "Stock purchase - Electronics",
    amount: 150000,
    date: new Date("2024-02-01"),
  },
  {
    id: "2",
    category: "Rent",
    description: "Monthly shop rent",
    amount: 80000,
    date: new Date("2024-02-01"),
  },
  {
    id: "3",
    category: "Utilities",
    description: "Electricity bill",
    amount: 15000,
    date: new Date("2024-02-05"),
  },
  {
    id: "4",
    category: "Marketing",
    description: "Facebook ads",
    amount: 25000,
    date: new Date("2024-02-08"),
  },
  {
    id: "5",
    category: "Transportation",
    description: "Delivery costs",
    amount: 8000,
    date: new Date("2024-02-10"),
  },
];

const categoryColors: Record<string, string> = {
  Inventory: "bg-blue-100 text-blue-800",
  Rent: "bg-purple-100 text-purple-800",
  Utilities: "bg-yellow-100 text-yellow-800",
  Salaries: "bg-green-100 text-green-800",
  Marketing: "bg-pink-100 text-pink-800",
  Transportation: "bg-orange-100 text-orange-800",
  Equipment: "bg-indigo-100 text-indigo-800",
  Supplies: "bg-teal-100 text-teal-800",
  Other: "bg-gray-100 text-gray-800",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(sampleExpenses);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses
    .filter((exp) => {
      const now = new Date();
      return (
        exp.date.getMonth() === now.getMonth() &&
        exp.date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const expensesByCategory = categories.map((cat) => ({
    category: cat,
    total: expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0),
  }));

  const onSubmit = async (data: ExpenseInput) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newExpense = {
      id: Date.now().toString(),
      ...data,
      date: new Date(data.date),
    };

    setExpenses([newExpense, ...expenses]);
    reset();
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Record a new business expense
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this expense for?"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("amount")}
                    />
                    {errors.amount && (
                      <p className="text-xs text-destructive">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...register("date")} />
                    {errors.date && (
                      <p className="text-xs text-destructive">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    Add Expense
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  This Month
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(thisMonthExpenses)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs font-medium text-green-500">
                    -5.2% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expense Records
                </p>
                <p className="text-2xl font-bold mt-1">{expenses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {expensesByCategory
              .filter((cat) => cat.total > 0)
              .sort((a, b) => b.total - a.total)
              .map((cat) => (
                <div
                  key={cat.category}
                  className="p-4 rounded-lg border bg-muted/50"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {cat.category}
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {formatCurrency(cat.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((cat.total / totalExpenses) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <Badge
                      className={categoryColors[expense.category] || ""}
                      variant="secondary"
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Receipt</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
