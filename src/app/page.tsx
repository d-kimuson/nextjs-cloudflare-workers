import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/tmp">Tmp</Link>
      </nav>
    </div>
  );
}
