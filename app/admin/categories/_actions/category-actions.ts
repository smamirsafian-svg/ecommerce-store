'use server';

import { requireAdmin } from '@/lib/utils/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Server Action: Create a new category
 */
export async function createCategory(formData: FormData) {
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

  // Validate inputs
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      error: 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد',
    };
  }

  if (name.trim().length > 100) {
    return {
      success: false,
      error: 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد',
    };
  }

  if (description && description.length > 500) {
    return {
      success: false,
      error: 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد',
    };
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Generate slug from name
    const baseSlug = generateSlug(name.trim());

    if (!baseSlug) {
      return {
        success: false,
        error: 'نمی‌توان از نام انتخابی slug مناسب ساخت',
      };
    }

    // Check for existing slugs
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true);

    const existingSlugs = existingCategories?.map((cat) => cat.slug) || [];
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // Insert new category
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: 'خطا در ایجاد دسته‌بندی. لطفاً دوباره تلاش کنید.',
      };
    }

    // Revalidate categories page
    revalidatePath('/admin/categories');

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    return {
      success: false,
      error: 'خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Server Action: Update an existing category
 */
export async function updateCategory(id: string, formData: FormData) {
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

  // Validate inputs
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      error: 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد',
    };
  }

  if (name.trim().length > 100) {
    return {
      success: false,
      error: 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد',
    };
  }

  if (description && description.length > 500) {
    return {
      success: false,
      error: 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد',
    };
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Get existing category to check if name changed
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingCategory) {
      return {
        success: false,
        error: 'دسته‌بندی یافت نشد',
      };
    }

    // Check if name changed - regenerate slug if needed
    let slug = existingCategory.slug;
    if (existingCategory.name.trim() !== name.trim()) {
      const baseSlug = generateSlug(name.trim());
      if (baseSlug) {
        // Check for existing slugs (excluding current category)
        const { data: otherCategories } = await supabase
          .from('categories')
          .select('slug')
          .eq('is_active', true)
          .neq('id', id);

        const existingSlugs = otherCategories?.map((cat) => cat.slug) || [];
        slug = generateUniqueSlug(baseSlug, existingSlugs);
      }
    }

    // Update category
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        // updated_at is handled by trigger
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: 'خطا در به‌روزرسانی دسته‌بندی. لطفاً دوباره تلاش کنید.',
      };
    }

    // Revalidate categories pages
    revalidatePath('/admin/categories');
    revalidatePath(`/admin/categories/edit/${id}`);

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    return {
      success: false,
      error: 'خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Server Action: Delete a category (soft delete by setting is_active = false)
 */
export async function deleteCategory(id: string) {
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

    // Soft delete: set is_active to false
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: 'خطا در حذف دسته‌بندی. لطفاً دوباره تلاش کنید.',
      };
    }

    // Revalidate categories page
    revalidatePath('/admin/categories');

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
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
export async function deleteCategoryAndRedirect(formData: FormData) {
  const id = formData.get("id") as string;
  
  if (!id) {
    redirect("/admin/categories");
    return;
  }

  const result = await deleteCategory(id);
  
  // Always redirect, even on error (errors will be logged)
  redirect("/admin/categories");
}

