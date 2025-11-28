import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteCategoryAndRedirect } from "./_actions/category-actions";
import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/empty-state";
import { TableWrapper } from "../_components/table-wrapper";

/**
 * Categories List Page
 * 
 * Displays all active categories with edit and delete actions
 */
export default async function AdminCategoriesPage() {
  const supabase = createSupabaseAdminClient();

  // Fetch all active categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Handle error
  if (error) {
    console.error("Error fetching categories:", error);
  }

  const categoryList = categories || [];

  // Client component for delete button will call Server Action directly

  // Format date for display
  function formatDate(dateString: string | null) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت دسته‌بندی‌ها"
        description="افزودن، ویرایش و حذف دسته‌بندی‌های محصولات"
        action={{
          label: "+ افزودن دسته‌بندی جدید",
          href: "/admin/categories/create",
        }}
      />

      {categoryList.length === 0 ? (
        <EmptyState
          title="لیست دسته‌بندی‌ها"
          description="هنوز دسته‌بندی‌ای ایجاد نشده است"
          action={{
            label: "افزودن اولین دسته‌بندی",
            href: "/admin/categories/create",
          }}
        />
      ) : (
        <TableWrapper
          title="لیست دسته‌بندی‌ها"
          description="تمام دسته‌بندی‌های فعال سیستم"
          count={categoryList.length}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right p-4 text-sm font-semibold">نام</th>
                <th className="text-right p-4 text-sm font-semibold">Slug</th>
                <th className="text-right p-4 text-sm font-semibold">توضیحات</th>
                <th className="text-right p-4 text-sm font-semibold">تاریخ ایجاد</th>
                <th className="text-right p-4 text-sm font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map((category) => (
                <tr
                  key={category.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="font-medium text-sm">{category.name}</div>
                  </td>
                  <td className="p-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {category.description || "-"}
                    </p>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(category.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/categories/edit/${category.id}`}>
                        <Button variant="outline" size="sm">
                          ویرایش
                        </Button>
                      </Link>
                      <form action={deleteCategoryAndRedirect} className="inline">
                        <input type="hidden" name="id" value={category.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          حذف
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </div>
  );
}
