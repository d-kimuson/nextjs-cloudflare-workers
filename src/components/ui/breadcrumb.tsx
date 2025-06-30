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
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  className,
  showHome = true,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="パンくずナビゲーション"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto",
        className,
      )}
    >
      <ol
        className="flex items-center space-x-1"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home breadcrumb */}
        {showHome && (
          <li
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              className="flex items-center hover:text-foreground transition-colors rounded-sm p-1 hover:bg-accent"
              itemProp="item"
              aria-label="ホームページに戻る"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only" itemProp="name">
                ホーム
              </span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
        )}

        {/* Navigation items */}
        {items.map((item, index) => {
          const position = showHome ? index + 2 : index + 1;
          const isLast = index === items.length - 1;

          return (
            <li
              key={`breadcrumb-${item.label}-${index}`}
              className="flex items-center space-x-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {/* Separator */}
              {(showHome || index > 0) && (
                <ChevronRight
                  className="w-4 h-4 text-muted-foreground/50 flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {/* Breadcrumb item */}
              {item.current || !item.href || isLast ? (
                <span
                  className="font-medium text-foreground px-1 py-0.5 rounded-sm truncate max-w-[200px]"
                  itemProp="name"
                  aria-current={item.current ? "page" : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors px-1 py-0.5 rounded-sm hover:bg-accent truncate max-w-[200px]"
                  itemProp="item"
                  title={item.label}
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={position.toString()} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
