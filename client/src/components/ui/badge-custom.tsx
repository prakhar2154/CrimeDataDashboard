import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  textColor?: string;
}

export function StatusBadge({ 
  children, 
  className, 
  bgColor = "bg-secondary", 
  textColor = "text-foreground" 
}: BadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", 
        bgColor, 
        textColor,
        className
      )}
    >
      {children}
    </span>
  );
}
