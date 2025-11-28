import { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface TableWrapperProps {
  title: string;
  description?: string;
  count?: number;
  children: ReactNode;
}

export function TableWrapper({
  title,
  description,
  count,
  children,
}: TableWrapperProps) {
  const displayTitle = count !== undefined ? `${title} (${count})` : title;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{displayTitle}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-border">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

