import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteProductAndRedirect } from "./_actions/product-actions";
import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/empty-state";
import { TableWrapper } from "../_components/table-wrapper";

/**
 * Products List Page
 * 
 * Displays all active products with edit and delete actions
 */
export default async function AdminProductsPage() {
  const supabase = createSupabaseAdminClient();

  // Fetch all active products with category information
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      images,
      created_at,
      category_id,
      categories(id, name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Handle error
  if (error) {
    console.error("Error fetching products:", error);
  }

  const productList = products || [];

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

  // Format price with Persian numbers
  function formatPrice(price: number) {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت محصولات"
        description="افزودن، ویرایش و حذف محصولات"
        action={{
          label: "+ افزودن محصول جدید",
          href: "/admin/products/create",
        }}
      />

      {productList.length === 0 ? (
        <EmptyState
          title="لیست محصولات"
          description="هنوز محصولی ایجاد نشده است"
          action={{
            label: "افزودن اولین محصول",
            href: "/admin/products/create",
          }}
        />
      ) : (
        <TableWrapper
          title="لیست محصولات"
          description="تمام محصولات فعال سیستم"
          count={productList.length}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right p-4 text-sm font-semibold">تصویر</th>
                <th className="text-right p-4 text-sm font-semibold">نام</th>
                <th className="text-right p-4 text-sm font-semibold">دسته‌بندی</th>
                <th className="text-right p-4 text-sm font-semibold">قیمت</th>
                <th className="text-right p-4 text-sm font-semibold">تاریخ ایجاد</th>
                <th className="text-right p-4 text-sm font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product: any) => (
                <tr
                  key={product.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-foreground/20">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        بدون تصویر
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-sm">{product.name}</div>
                    <code className="text-xs text-muted-foreground mt-1 block">
                      {product.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{product.categories?.name || "-"}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">{formatPrice(product.price)}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Button variant="outline" size="sm">
                          ویرایش
                        </Button>
                      </Link>
                      <form action={deleteProductAndRedirect} className="inline">
                        <input type="hidden" name="id" value={product.id} />
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

