import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <SearchX className="size-16" strokeWidth={0.5}/>
      {children}
    </div>
  )
}