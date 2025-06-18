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
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import { pagesPath } from "@/lib/$path";
import { useState, useEffect, useRef } from "react";
import { searchWorksByTitle } from "@/server/actions/works";
import type { WorkItem } from "@/components/works/WorksList";
import { urlObjectToString } from "../../lib/path/urlObjectToString";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<WorkItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);

  // デバウンス付き検索実行
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchWorksByTitle(searchTerm, { limit: 5 });
        setSearchResults(results);
        setShowResults(true);
        setIsSearching(false);
      } catch (error) {
        console.error("検索エラー:", error);
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300); // 300ms のデバウンス

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // 検索結果以外をクリックした時に結果を非表示にする
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleSearchSelect = (work: WorkItem) => {
    setSearchTerm("");
    setShowResults(false);
    setSearchOpen(false);
  };

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
    {
      href: pagesPath.mypage.$url(),
      icon: User,
      label: "マイページ",
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
            {/* 検索機能 */}
            <div className="hidden md:block relative" ref={searchRef}>
              {searchOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="作品を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pr-8"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-2 top-1/2 transform -translate-y-1/2" />
                    )}

                    {/* 検索結果ドロップダウン */}
                    {showResults &&
                      (searchResults.length > 0 ||
                        searchTerm.trim().length >= 2) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                          {searchResults.length > 0 ? (
                            <div className="py-2">
                              {searchResults.map((work) => (
                                <Link
                                  key={work.id}
                                  href={urlObjectToString(
                                    pagesPath.doujinshi.works
                                      ._workId(work.id)
                                      .$url()
                                  )}
                                  onClick={() => handleSearchSelect(work)}
                                  className="flex items-center space-x-3 px-4 py-2 hover:bg-muted transition-colors"
                                >
                                  <img
                                    src={work.listImageUrl}
                                    alt={work.title}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {work.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {work.makers
                                        .map((m) => m.name)
                                        .join(", ")}
                                    </p>
                                  </div>
                                  <div className="text-sm font-medium">
                                    ¥{work.price.toLocaleString()}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center text-muted-foreground">
                              検索結果が見つかりませんでした
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchOpen(false);
                      setShowResults(false);
                      setSearchTerm("");
                    }}
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
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="作品を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-8"
                    />
                    {isSearching && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-2 top-1/2 transform -translate-y-1/2" />
                    )}
                  </div>

                  {/* モバイル検索結果 */}
                  {showResults && searchResults.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {searchResults.map((work) => (
                        <Link
                          key={work.id}
                          href={pagesPath.doujinshi.works
                            ._workId(work.id)
                            .$url()}
                          onClick={() => handleSearchSelect(work)}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted transition-colors"
                        >
                          <img
                            src={work.listImageUrl}
                            alt={work.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {work.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ¥{work.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
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
