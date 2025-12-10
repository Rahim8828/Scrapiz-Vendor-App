import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack: () => void;
  rightElement?: React.ReactNode;
  isTransparent?: boolean;
  textColor?: string;
}

const Header = ({ title, onBack, rightElement, isTransparent, textColor }: HeaderProps) => {
  const headerClasses = isTransparent
    ? 'bg-transparent shadow-none px-4 py-4 flex items-center justify-between sticky top-0 z-30'
    : 'bg-white shadow-sm px-4 py-4 flex items-center justify-between sticky top-0 z-30';

  const titleColor = textColor || 'text-[#333333]';
  const iconColor = textColor || 'text-[#333333]';

  return (
    <div className={headerClasses}>
      <button
        onClick={onBack}
        className={`p-2 -ml-2 ${iconColor} hover:bg-gray-100 rounded-lg transition-all active:scale-95`}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <h1 className={`text-lg font-semibold ${titleColor} flex-1 text-center`} style={{ fontFamily: 'Poppins' }}>
        {title}
      </h1>
      
      <div className="w-10 flex justify-end">
        {rightElement}
      </div>
    </div>
  );
};

export default Header;