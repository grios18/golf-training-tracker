'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Daily', path: '/' },
    { name: 'Weekly', path: '/weekly' },
    { name: 'Monthly', path: '/monthly' },
    { name: 'Yearly', path: '/yearly' },
  ];

  return (
    <nav className="bg-green-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              prefetch={true}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.path
                  ? 'bg-green-900 text-white'
                  : 'text-green-100 hover:bg-green-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 