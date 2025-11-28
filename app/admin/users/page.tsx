import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/empty-state";

/**
 * Users Management Page
 * 
 * Placeholder page for users management.
 * Ready for expansion with users table, role management, and user details.
 */
export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت کاربران"
        description="مشاهده و مدیریت کاربران سیستم"
      />

      <EmptyState
        title="لیست کاربران"
        description="این بخش آماده توسعه است و می‌تواند شامل جدول کاربران، فیلترها، مدیریت نقش کاربران، و جزئیات کاربر باشد."
      />
    </div>
  );
}

