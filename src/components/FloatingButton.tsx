import { useState } from 'react';
import { Focus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingButton = ({ onClick, isOpen }: FloatingButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-[999998] group"
      aria-label="Open FocusDock"
    >
      <div className={`
        flex items-center gap-2 px-4 py-3 rounded-full
        bg-gradient-to-r from-primary to-accent
        text-primary-foreground font-medium text-sm
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        ${isHovered ? 'pr-5' : ''}
      `}>
        <Focus className="w-5 h-5" />
        <span className={`
          overflow-hidden transition-all duration-300 ease-out whitespace-nowrap
          ${isHovered ? 'max-w-32 opacity-100' : 'max-w-0 opacity-0'}
        `}>
          FocusDock
        </span>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-40 blur-lg -z-10 group-hover:opacity-60 transition-opacity" />
    </button>
  );
};
