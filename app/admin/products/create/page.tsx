import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createProduct } from "../_actions/product-actions";
import { PageHeader } from "../../_components/page-header";
import { FormCard } from "../../_components/form-card";
import { FormActions } from "../../_components/form-actions";

/**
 * Create Product Page
 * 
 * Form to create a new product
 */
export default async function CreateProductPage() {
  const supabase = createSupabaseAdminClient();

  // Fetch active categories for dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categoryList = categories || [];

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await createProduct(formData);
    
    if (result.success) {
      redirect("/admin/products");
    } else {
      // Return error - in a real app you might want to use a toast or error state
      redirect(`/admin/products/create?error=${encodeURIComponent(result.error || "خطای ناشناخته")}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="افزودن محصول جدید"
        description="اطلاعات محصول جدید را وارد کنید"
      />

      <FormCard
        title="اطلاعات محصول"
        description="اطلاعات محصول را وارد کنید. Slug به صورت خودکار تولید می‌شود."
      >
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              نام محصول *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="مثال: گوشی موبایل سامسونگ"
              className="text-right"
              required
              minLength={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              نام محصول باید حداقل ۲ کاراکتر و حداکثر ۲۰۰ کاراکتر باشد
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">
              توضیحات
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="توضیحات اختیاری برای این محصول..."
              className="flex min-h-[100px] w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              توضیحات اختیاری (حداکثر ۱۰۰۰ کاراکتر)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-right">
              دسته‌بندی *
            </Label>
            <select
              id="category_id"
              name="category_id"
              className="flex h-10 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
              required
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categoryList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground text-right">
              دسته‌بندی محصول را انتخاب کنید
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-right">
              قیمت (تومان) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="مثال: 5000000"
              className="text-right"
              required
              min="0"
              step="1"
            />
            <p className="text-xs text-muted-foreground text-right">
              قیمت محصول را به تومان وارد کنید
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-right">
              تصویر محصول
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="text-right file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-foreground/10 file:text-foreground hover:file:bg-foreground/20"
            />
            <p className="text-xs text-muted-foreground text-right">
              تصویر محصول (حداکثر ۵ مگابایت، فرمت‌های مجاز: JPG, PNG, WebP)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs" className="text-right">
              مشخصات (JSON)
            </Label>
            <textarea
              id="specs"
              name="specs"
              placeholder='{"رنگ": "مشکی", "حافظه": "128GB", "RAM": "8GB"}'
              className="flex min-h-[120px] w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-right resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              مشخصات محصول به صورت JSON (کلید/مقدار). مثال: {"{"}"رنگ": "مشکی", "حافظه": "128GB"{"}"}
            </p>
          </div>

          <FormActions
            cancelHref="/admin/products"
            submitLabel="ذخیره محصول"
          />
        </form>
      </FormCard>
    </div>
  );
}

