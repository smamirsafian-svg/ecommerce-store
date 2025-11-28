import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/empty-state";

/**
 * Orders Management Page
 * 
 * Placeholder page for orders management and tracking.
 * Ready for expansion with orders table, status updates, and details view.
 */
export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت سفارش‌ها"
        description="مشاهده و مدیریت سفارش‌های مشتریان"
      />

      <EmptyState
        title="لیست سفارش‌ها"
        description="این بخش آماده توسعه است و می‌تواند شامل جدول سفارش‌ها، فیلترها، به‌روزرسانی وضعیت سفارش، و جزئیات سفارش باشد."
      />
    </div>
  );
}

