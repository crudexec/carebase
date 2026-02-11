import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

async function getStats(businessId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    currentMonthOrders,
    lastMonthOrders,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    db.product.count({ where: { businessId } }),
    db.order.count({ where: { businessId } }),
    db.customer.count({ where: { businessId } }),
    db.order.findMany({
      where: {
        businessId,
        createdAt: { gte: startOfMonth },
      },
      select: { total: true },
    }),
    db.order.findMany({
      where: {
        businessId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      select: { total: true },
    }),
    db.order.findMany({
      where: { businessId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.inventory.findMany({
      where: {
        product: { businessId },
        quantity: { lte: db.inventory.fields.lowStock },
      },
      take: 5,
      include: { product: true, location: true },
    }),
  ]);

  const currentRevenue = currentMonthOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const lastRevenue = lastMonthOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const revenueChange = lastRevenue > 0
    ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
    : 0;

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    currentRevenue,
    revenueChange,
    recentOrders,
    lowStockProducts,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && trendValue && (
              <div className="flex items-center mt-1">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span
                  className={`text-xs font-medium ${
                    trend === "up"
                      ? "text-green-500"
                      : trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();
  if (!user?.businessId) {
    return <div>No business found. Please set up your business first.</div>;
  }

  const stats = await getStats(user.businessId);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.currentRevenue)}
          icon={DollarSign}
          trend={stats.revenueChange >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(stats.revenueChange).toFixed(1)}% from last month`}
        />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} />
      </div>

      {/* Recent orders and low stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link
              href="/orders"
              className="text-sm text-primary hover:underline flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName || ""}`
                          : order.customerName || "Guest"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "success"
                            : order.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Alert</CardTitle>
            <Link
              href="/products"
              className="text-sm text-primary hover:underline flex items-center"
            >
              Manage <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">All products are well stocked</p>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{inv.product.name}</p>
                      <p className="text-sm text-muted-foreground">{inv.location.name}</p>
                    </div>
                    <Badge variant="warning">{inv.quantity} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
