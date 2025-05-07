import React from 'react';
import Link from 'next/link';
import { FaWeibo, FaWeixin, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-gray py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-text-medium">&copy; {new Date().getFullYear()} RedNote 小红书文案生成器. 保留所有权利</p>
          </div>
          <div className="flex space-x-4 items-center">
            <Link href="/privacy" className="text-text-medium hover:text-redbook">
              隐私政策
            </Link>
            <Link href="/terms" className="text-text-medium hover:text-redbook">
              使用条款
            </Link>
            <div className="flex space-x-3 ml-4">
              <a href="#" className="text-text-medium hover:text-redbook">
                <FaWeibo size={20} />
              </a>
              <a href="#" className="text-text-medium hover:text-redbook">
                <FaWeixin size={20} />
              </a>
              <a href="https://github.com" className="text-text-medium hover:text-redbook">
                <FaGithub size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 