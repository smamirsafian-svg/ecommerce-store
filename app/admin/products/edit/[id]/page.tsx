import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateProduct } from "../../_actions/product-actions";
import { PageHeader } from "../../../_components/page-header";
import { FormCard } from "../../../_components/form-card";
import { FormActions } from "../../../_components/form-actions";

/**
 * Edit Product Page
 * 
 * Form to edit an existing product
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  // Fetch product data
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      category_id,
      images,
      specs
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch active categories for dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categoryList = categories || [];

  // Format specs as JSON string for textarea
  const specsJson = product.specs
    ? JSON.stringify(product.specs, null, 2)
    : "";

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await updateProduct(id, formData);
    
    if (result.success) {
      redirect("/admin/products");
    } else {
      // Return error
      redirect(`/admin/products/edit/${id}?error=${encodeURIComponent(result.error || "خطای ناشناخته")}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ویرایش محصول"
        description="اطلاعات محصول را ویرایش کنید"
      />

      <FormCard
        title="اطلاعات محصول"
        description="اطلاعات محصول را ویرایش کنید. در صورت تغییر نام، Slug به صورت خودکار به‌روزرسانی می‌شود."
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
              defaultValue={product.name}
            />
            <p className="text-xs text-muted-foreground text-right">
              نام محصول باید حداقل ۲ کاراکتر و حداکثر ۲۰۰ کاراکتر باشد
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
              value={product.slug}
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
              placeholder="توضیحات اختیاری برای این محصول..."
              className="flex min-h-[100px] w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right resize-none"
              maxLength={1000}
              defaultValue={product.description || ""}
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
              defaultValue={product.category_id}
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
              defaultValue={product.price}
            />
            <p className="text-xs text-muted-foreground text-right">
              قیمت محصول را به تومان وارد کنید
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-right">تصویر فعلی</Label>
            {product.images && product.images.length > 0 && product.images[0] ? (
              <div className="relative w-32 h-32 rounded-md overflow-hidden border border-foreground/20">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground border border-foreground/20">
                بدون تصویر
              </div>
            )}
            <p className="text-xs text-muted-foreground text-right">
              برای تغییر تصویر، فایل جدید انتخاب کنید
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-right">
              تصویر جدید (اختیاری)
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="text-right file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-foreground/10 file:text-foreground hover:file:bg-foreground/20"
            />
            <p className="text-xs text-muted-foreground text-right">
              برای تغییر تصویر، فایل جدید انتخاب کنید (حداکثر ۵ مگابایت)
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
              defaultValue={specsJson}
            />
            <p className="text-xs text-muted-foreground text-right">
              مشخصات محصول به صورت JSON (کلید/مقدار). مثال: {"{"}"رنگ": "مشکی", "حافظه": "128GB"{"}"}
            </p>
          </div>

          <FormActions
            cancelHref="/admin/products"
            submitLabel="ذخیره تغییرات"
          />
        </form>
      </FormCard>
    </div>
  );
}

