import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-redbook">
          RedNote <span className="text-sm">小红书文案生成器</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/about" className="text-text-medium hover:text-redbook">
                功能介绍
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-text-medium hover:text-redbook">
                联系我们
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 