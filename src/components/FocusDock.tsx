import { useState } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import { FloatingButton } from './FloatingButton';

export const FocusDock = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <FloatingButton 
        onClick={() => setIsOpen(true)} 
        isOpen={isOpen} 
      />
      <Sidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};
