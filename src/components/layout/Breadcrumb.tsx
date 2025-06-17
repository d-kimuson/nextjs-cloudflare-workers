import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";
import { pagesPath } from "@/lib/$path";

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface SiteBreadcrumbProps {
  items: BreadcrumbItemData[];
}

export function SiteBreadcrumb({ items }: SiteBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href={pagesPath.$url()}
              className="flex items-center space-x-1"
            >
              <Home className="h-4 w-4" />
              <span>ホーム</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <div key={item.label} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href && index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
