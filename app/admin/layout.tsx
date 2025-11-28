import { requireAdmin } from "@/lib/utils/admin-auth";
import { AdminSidebar } from "./_components/admin-sidebar";

/**
 * Protected Admin Layout
 * 
 * This layout is completely isolated from /account layout.
 * It uses server-side authentication and role checking.
 * 
 * Protection flow:
 * 1. Checks if user is authenticated → redirects to /auth/login if not
 * 2. Checks if user has admin role → redirects to / if not admin
 * 3. Renders admin layout with sidebar if user is admin
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not authenticated or not admin
  await requireAdmin();

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Admin Sidebar Navigation */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

