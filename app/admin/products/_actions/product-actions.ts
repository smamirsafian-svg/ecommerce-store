'use server';

import { requireAdmin } from '@/lib/utils/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Server Action: Create a new product
 */
export async function createProduct(formData: FormData) {
  // Validate admin access
  const { user, profile } = await requireAdmin();
  if (!user || profile.role !== 'admin') {
    return {
      success: false,
      error: 'شما دسترسی لازم برای این عملیات را ندارید',
    };
  }

  // Extract form data
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const price = formData.get('price') as string;
  const categoryId = formData.get('category_id') as string;
  const image = formData.get('image') as File | null;
  const specsJson = formData.get('specs') as string | null;

  // Validate inputs
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      error: 'نام محصول باید حداقل ۲ کاراکتر باشد',
    };
  }

  if (name.trim().length > 200) {
    return {
      success: false,
      error: 'نام محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد',
    };
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return {
      success: false,
      error: 'قیمت باید یک عدد مثبت باشد',
    };
  }

  if (!categoryId) {
    return {
      success: false,
      error: 'لطفاً یک دسته‌بندی انتخاب کنید',
    };
  }

  if (description && description.length > 1000) {
    return {
      success: false,
      error: 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد',
    };
  }

  // Validate specs JSON if provided
  let specs = null;
  if (specsJson && specsJson.trim()) {
    try {
      specs = JSON.parse(specsJson.trim());
      if (typeof specs !== 'object' || Array.isArray(specs)) {
        return {
          success: false,
          error: 'مشخصات باید یک شیء JSON معتبر باشد',
        };
      }
    } catch {
      return {
        success: false,
        error: 'فرمت JSON مشخصات معتبر نیست',
      };
    }
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: 'دسته‌بندی انتخاب شده یافت نشد',
      };
    }

    // Generate slug from name
    const baseSlug = generateSlug(name.trim());

    if (!baseSlug) {
      return {
        success: false,
        error: 'نمی‌توان از نام انتخابی slug مناسب ساخت',
      };
    }

    // Check for existing slugs
    const { data: existingProducts } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true);

    const existingSlugs = existingProducts?.map((p) => p.slug) || [];
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // Handle image upload
    let images: string[] = [];
    if (image && image.size > 0) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return {
          success: false,
          error: 'فایل انتخابی باید یک تصویر باشد',
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        return {
          success: false,
          error: 'حجم تصویر نمی‌تواند بیشتر از ۵ مگابایت باشد',
        };
      }

      // Generate unique filename (ASCII only for storage compatibility)
      const fileExt = image.name.split('.').pop() || 'jpg';
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Convert File to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return {
          success: false,
          error: 'خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.',
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      images = [urlData.publicUrl];
    }

    // Insert new product
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || null,
        price: Number(price),
        category_id: categoryId,
        images: images,
        specs: specs,
        inventory: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      // If product creation failed but image was uploaded, try to delete image
      if (images.length > 0) {
        const imageUrl = images[0];
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('products').remove([fileName]);
        }
      }
      return {
        success: false,
        error: 'خطا در ایجاد محصول. لطفاً دوباره تلاش کنید.',
      };
    }

    // Revalidate products page
    revalidatePath('/admin/products');

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    return {
      success: false,
      error: 'خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Server Action: Update an existing product
 */
export async function updateProduct(id: string, formData: FormData) {
  // Validate admin access
  const { user, profile } = await requireAdmin();
  if (!user || profile.role !== 'admin') {
    return {
      success: false,
      error: 'شما دسترسی لازم برای این عملیات را ندارید',
    };
  }

  // Extract form data
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const price = formData.get('price') as string;
  const categoryId = formData.get('category_id') as string;
  const image = formData.get('image') as File | null;
  const specsJson = formData.get('specs') as string | null;

  // Validate inputs
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      error: 'نام محصول باید حداقل ۲ کاراکتر باشد',
    };
  }

  if (name.trim().length > 200) {
    return {
      success: false,
      error: 'نام محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد',
    };
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    return {
      success: false,
      error: 'قیمت باید یک عدد مثبت باشد',
    };
  }

  if (!categoryId) {
    return {
      success: false,
      error: 'لطفاً یک دسته‌بندی انتخاب کنید',
    };
  }

  if (description && description.length > 1000) {
    return {
      success: false,
      error: 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد',
    };
  }

  // Validate specs JSON if provided
  let specs = {};
  if (specsJson && specsJson.trim()) {
    try {
      const parsed = JSON.parse(specsJson.trim());
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {
          success: false,
          error: 'مشخصات باید یک شیء JSON معتبر باشد',
        };
      }
      specs = parsed;
    } catch {
      return {
        success: false,
        error: 'فرمت JSON مشخصات معتبر نیست',
      };
    }
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Get existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('name, slug, images')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: 'محصول یافت نشد',
      };
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: 'دسته‌بندی انتخاب شده یافت نشد',
      };
    }

    // Check if name changed - regenerate slug if needed
    let slug = existingProduct.slug;
    if (existingProduct.name.trim() !== name.trim()) {
      const baseSlug = generateSlug(name.trim());
      if (baseSlug) {
        // Check for existing slugs (excluding current product)
        const { data: otherProducts } = await supabase
          .from('products')
          .select('slug')
          .eq('is_active', true)
          .neq('id', id);

        const existingSlugs = otherProducts?.map((p) => p.slug) || [];
        slug = generateUniqueSlug(baseSlug, existingSlugs);
      }
    }

    // Handle image upload/replacement
    let images: string[] = existingProduct.images || [];
    if (image && image.size > 0) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return {
          success: false,
          error: 'فایل انتخابی باید یک تصویر باشد',
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        return {
          success: false,
          error: 'حجم تصویر نمی‌تواند بیشتر از ۵ مگابایت باشد',
        };
      }

      // Generate unique filename (ASCII only for storage compatibility)
      const fileExt = image.name.split('.').pop() || 'jpg';
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Convert File to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return {
          success: false,
          error: 'خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.',
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const newImageUrl = urlData.publicUrl;

      // Delete old images if they exist
      if (existingProduct.images && existingProduct.images.length > 0) {
        try {
          for (const oldImageUrl of existingProduct.images) {
            const oldFileName = oldImageUrl.split('/').pop();
            if (oldFileName) {
              await supabase.storage
                .from('products')
                .remove([oldFileName]);
            }
          }
        } catch (deleteError) {
          // Log but don't fail the update if image deletion fails
          console.error('Error deleting old images:', deleteError);
        }
      }

      // Replace with new image
      images = [newImageUrl];
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price: Number(price),
        category_id: categoryId,
        images: images,
        specs: specs,
        // updated_at is handled by trigger
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: 'خطا در به‌روزرسانی محصول. لطفاً دوباره تلاش کنید.',
      };
    }

    // Revalidate products pages
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/edit/${id}`);

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    return {
      success: false,
      error: 'خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Server Action: Delete a product (soft delete by setting is_active = false)
 */
export async function deleteProduct(id: string) {
  // Validate admin access
  const { user, profile } = await requireAdmin();
  if (!user || profile.role !== 'admin') {
    return {
      success: false,
      error: 'شما دسترسی لازم برای این عملیات را ندارید',
    };
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Get product images before deleting (for potential cleanup)
    const { data: product } = await supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .single();

    // Soft delete: set is_active to false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: 'خطا در حذف محصول. لطفاً دوباره تلاش کنید.',
      };
    }

    // Optionally delete image from storage (commented out to keep images for potential restore)
    // if (product?.image_url) {
    //   try {
    //     const fileName = product.image_url.split('/').pop();
    //     if (fileName) {
    //       await supabase.storage.from('products').remove([`products/${fileName}`]);
    //     }
    //   } catch (deleteError) {
    //     console.error('Error deleting product image:', deleteError);
    //   }
    // }

    // Revalidate products page
    revalidatePath('/admin/products');

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return {
      success: false,
      error: 'خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Server Action: Handle delete with redirect
 * This is a wrapper that handles the delete and redirect in one action
 */
export async function deleteProductAndRedirect(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    redirect('/admin/products');
    return;
  }

  const result = await deleteProduct(id);

  // Always redirect, even on error (errors will be logged)
  redirect('/admin/products');
}

