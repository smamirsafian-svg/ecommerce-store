import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "./_components/page-header";

/**
 * Admin Dashboard Homepage
 * 
 * This is the main admin dashboard page.
 * Ready for expansion with stats, charts, and quick actions.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد مدیریت"
        description="خوش آمدید به پنل مدیریت فروشگاه"
      />

      {/* Stats Cards Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">دسته‌بندی‌ها</CardTitle>
            <CardDescription className="text-xs">تعداد دسته‌بندی‌ها</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">محصولات</CardTitle>
            <CardDescription className="text-xs">تعداد محصولات</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">سفارش‌ها</CardTitle>
            <CardDescription className="text-xs">تعداد سفارش‌ها</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">کاربران</CardTitle>
            <CardDescription className="text-xs">تعداد کاربران</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>عملیات سریع</CardTitle>
          <CardDescription>
            دسترسی سریع به بخش‌های مختلف پنل مدیریت
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            این بخش آماده توسعه است و می‌تواند شامل عملیات سریع مانند افزودن محصول جدید،
            مشاهده سفارش‌های جدید، و غیره باشد.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

