import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FormActionsProps {
  cancelHref: string;
  submitLabel?: string;
  isLoading?: boolean;
}

export function FormActions({
  cancelHref,
  submitLabel = "ذخیره",
  isLoading = false,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border pt-6 mt-6">
      <Link href={cancelHref}>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="min-w-[80px]"
        >
          لغو
        </Button>
      </Link>
      <Button type="submit" disabled={isLoading} className="min-w-[120px]">
        {isLoading ? "در حال ذخیره..." : submitLabel}
      </Button>
    </div>
  );
}

