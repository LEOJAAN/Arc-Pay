import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, eyebrow = "Workspace", action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-3">
        <Badge variant="outline">{eyebrow}</Badge>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
