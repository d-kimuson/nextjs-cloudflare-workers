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
import { pagesPath } from "../lib/$path";

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
                  <Link href={pagesPath.$url()}>
                    <Button variant="default" className="w-full">
                      ホーム
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                    <Button variant="outline" className="w-full">
                      同人ランキング
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href={pagesPath.doujinshi.makers.$url()}>
                    <Button variant="outline" className="w-full">
                      作者一覧
                    </Button>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>
    </div>
  );
}
