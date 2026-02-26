import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          巨头视野 <span className="text-blue-400 text-sm align-top">BETA</span>
        </Link>
        <nav className="space-x-6">
          <Link href="/" className="hover:text-blue-300 transition-colors">
            每日简报
          </Link>
          <Link href="/news" className="hover:text-blue-300 transition-colors">
            情报聚合
          </Link>
          <Link href="/ask" className="hover:text-blue-300 transition-colors">
            问问巨头
          </Link>
          <Link href="/admin" className="hover:text-yellow-300 transition-colors text-gray-400 text-sm">
            ⚙️ 管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
