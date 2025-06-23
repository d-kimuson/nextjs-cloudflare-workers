"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { pagesPath } from "@/lib/$path";
import { Award, Book, Menu, Star, TrendingUp, User, Users } from "lucide-react";
import Link from "next/link";

export function Header() {
  const mobileMenuItems = [
    {
      href: pagesPath.doujinshi.daily_ranking.$url(),
      icon: TrendingUp,
      label: "デイリーランキング",
    },
    {
      href: pagesPath.doujinshi.new_releases.$url(),
      icon: Award,
      label: "人気作者の新作",
    },
    {
      href: pagesPath.doujinshi.makers.$url(),
      icon: Users,
      label: "作者ランキング！",
    },
    {
      href: pagesPath.mypage.$url(),
      icon: User,
      label: "マイページ",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-none">
        <div className="flex h-16 items-center justify-between min-w-0">
          {/* ロゴ・サイト名 */}
          <div className="flex items-center space-x-2">
            <Link
              href={pagesPath.$url()}
              className="flex items-center space-x-2"
            >
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">おかずNavi</span>
            </Link>
            <Badge variant="secondary" className="text-xs">
              18+
            </Badge>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Star className="h-4 w-4" />
                        <span className="hidden xl:inline">
                          公開直後！新作ランキング
                        </span>
                        <span className="xl:hidden">ランキング</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={pagesPath.doujinshi.new_releases.$url()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Award className="h-4 w-4" />
                        <span className="hidden xl:inline">人気作者の新作</span>
                        <span className="xl:hidden">新作</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={pagesPath.doujinshi.makers.$url()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden xl:inline">
                          作者ランキング！
                        </span>
                        <span className="xl:hidden">作者</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={pagesPath.mypage.$url()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <User className="h-4 w-4" />
                        <span>マイページ</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* 右側メニュー */}
          <div className="flex items-center space-x-2">
            {/* モバイルメニュー */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <Book className="h-5 w-5 text-primary" />
                      <span>おかずNavi</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="grid gap-4 py-6">
                    {mobileMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}

                    <Separator className="my-2" />

                    <div className="space-y-2 px-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        外部リンク
                      </h4>
                      <div className="space-y-1">
                        <a
                          href="https://www.dmm.co.jp/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm p-2 rounded hover:bg-muted transition-colors"
                        >
                          FANZA
                        </a>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
