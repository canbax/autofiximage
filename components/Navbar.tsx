import React from 'react';
import { Button } from './Button';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-white">PixelPerfect AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" className="bg-transparent hover:bg-gray-700">Pricing</Button>
            <Button variant="primary">Login</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
