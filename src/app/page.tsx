import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            同人アフィリエイトサイト
          </h1>
          <p className="text-muted-foreground text-lg">
            人気同人作品をご紹介します
          </p>
        </header>

        <nav className="flex justify-center mb-8">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-4">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/">
                    <Button variant="default" className="w-full">
                      ホーム
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/doujinshi/daily-ranking">
                    <Button variant="outline" className="w-full">
                      同人ランキング
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/authors">
                    <Button variant="outline" className="w-full">
                      作者一覧
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <main className="text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-8">
              最新の同人ランキングをチェックして、お気に入りの作品を見つけましょう。
              人気作者の作品や試し読みも充実しています。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/doujinshi/daily-ranking">
                <Button size="lg" className="text-lg px-8 py-4">
                  ランキングを見る
                </Button>
              </Link>
              <Link href="/authors">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  作者一覧
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
