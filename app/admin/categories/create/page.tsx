import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory } from "../_actions/category-actions";
import { PageHeader } from "../../_components/page-header";
import { FormCard } from "../../_components/form-card";
import { FormActions } from "../../_components/form-actions";

/**
 * Create Category Page
 * 
 * Form to create a new category
 */
export default function CreateCategoryPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await createCategory(formData);
    
    if (result.success) {
      redirect("/admin/categories");
    } else {
      // Return error - in a real app you might want to use a toast or error state
      redirect(`/admin/categories/create?error=${encodeURIComponent(result.error || "خطای ناشناخته")}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="افزودن دسته‌بندی جدید"
        description="اطلاعات دسته‌بندی جدید را وارد کنید"
      />

      <FormCard
        title="اطلاعات دسته‌بندی"
        description="نام و توضیحات دسته‌بندی را وارد کنید. Slug به صورت خودکار تولید می‌شود."
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
            />
            <p className="text-xs text-muted-foreground text-right">
              نام دسته‌بندی باید حداقل ۲ کاراکتر و حداکثر ۱۰۰ کاراکتر باشد
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
            />
            <p className="text-xs text-muted-foreground text-right">
              توضیحات اختیاری (حداکثر ۵۰۰ کاراکتر)
            </p>
          </div>

          <FormActions
            cancelHref="/admin/categories"
            submitLabel="ذخیره دسته‌بندی"
          />
        </form>
      </FormCard>
    </div>
  );
}

