"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Home,
  TrendingUp,
  Users,
  Book,
  Star,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { pagesPath } from "@/lib/$path";
import { useState } from "react";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const mobileMenuItems = [
    {
      href: pagesPath.$url(),
      icon: Home,
      label: "ホーム",
    },
    {
      href: pagesPath.doujinshi.daily_ranking.$url(),
      icon: TrendingUp,
      label: "デイリーランキング",
    },
    {
      href: pagesPath.doujinshi.makers.$url(),
      icon: Users,
      label: "作者一覧",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ・サイト名 */}
          <div className="flex items-center space-x-2">
            <Link
              href={pagesPath.$url()}
              className="flex items-center space-x-2"
            >
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">DoujinShare</span>
            </Link>
            <Badge variant="secondary" className="text-xs">
              18+
            </Badge>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href={pagesPath.$url()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Home className="h-4 w-4" />
                        <span>ホーム</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>ランキング</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <div className="grid gap-1">
                        <NavigationMenuLink asChild>
                          <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              デイリーランキング
                            </Button>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
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
                        <span>作者一覧</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* 右側メニュー */}
          <div className="flex items-center space-x-2">
            {/* 検索機能 */}
            <div className="hidden md:block">
              {searchOpen ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="作品を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center space-x-1"
                >
                  <Search className="h-4 w-4" />
                  <span>検索</span>
                </Button>
              )}
            </div>

            {/* モバイル検索 */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-4">
                  <Input
                    type="text"
                    placeholder="作品を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* モバイルメニュー */}
            <div className="md:hidden">
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
                      <span>DoujinShare</span>
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
