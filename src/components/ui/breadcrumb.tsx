import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

interface BreadcrumbItem {
  href?: string;
  label: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="パンくずナビゲーション"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">ホーム</span>
      </Link>

      {items.map((item, index) => (
        <div
          key={`breadcrumb-${item.label}-${index}`}
          className="flex items-center space-x-1"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {item.current || !item.href ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
