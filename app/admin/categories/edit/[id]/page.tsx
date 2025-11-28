import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateCategory } from "../../_actions/category-actions";
import { PageHeader } from "../../../_components/page-header";
import { FormCard } from "../../../_components/form-card";
import { FormActions } from "../../../_components/form-actions";

/**
 * Edit Category Page
 * 
 * Form to edit an existing category
 */
export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  // Fetch category data
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !category) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await updateCategory(id, formData);
    
    if (result.success) {
      redirect("/admin/categories");
    } else {
      // Return error
      redirect(`/admin/categories/edit/${id}?error=${encodeURIComponent(result.error || "خطای ناشناخته")}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ویرایش دسته‌بندی"
        description="اطلاعات دسته‌بندی را ویرایش کنید"
      />

      <FormCard
        title="اطلاعات دسته‌بندی"
        description="نام و توضیحات دسته‌بندی را ویرایش کنید. در صورت تغییر نام، Slug به صورت خودکار به‌روزرسانی می‌شود."
      >
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              نام دسته‌بندی *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="مثال: الکترونیک"
              className="text-right"
              required
              minLength={2}
              maxLength={100}
              defaultValue={category.name}
            />
            <p className="text-xs text-muted-foreground text-right">
              نام دسته‌بندی باید حداقل ۲ کاراکتر و حداکثر ۱۰۰ کاراکتر باشد
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-right">
              Slug (فقط خواندنی)
            </Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              className="text-right bg-muted"
              value={category.slug}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground text-right">
              Slug به صورت خودکار از نام تولید می‌شود و در صورت تغییر نام به‌روزرسانی می‌شود
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">
              توضیحات
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="توضیحات اختیاری برای این دسته‌بندی..."
              className="flex min-h-[100px] w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right resize-none"
              maxLength={500}
              defaultValue={category.description || ""}
            />
            <p className="text-xs text-muted-foreground text-right">
              توضیحات اختیاری (حداکثر ۵۰۰ کاراکتر)
            </p>
          </div>

          <FormActions
            cancelHref="/admin/categories"
            submitLabel="ذخیره تغییرات"
          />
        </form>
      </FormCard>
    </div>
  );
}

