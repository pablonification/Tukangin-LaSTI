'use client';

import React, { useEffect, useState } from 'react';

interface StickyActionsProps {
  children: React.ReactNode;
  className?: string;
}

// Keeps its children pinned to the bottom and lifts above the on-screen keyboard
export const StickyActions = ({ children, className = '' }: StickyActionsProps) => {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: boolean }).MSStream;
    const vv = (window as Window & { visualViewport?: VisualViewport | null }).visualViewport;

    const computeOffset = () => {
      const viewport = (window as Window & { visualViewport?: VisualViewport | null }).visualViewport;

      if (!viewport) {
        setBottomOffset(0);
        return;
      }

      const fullHeight = window.innerHeight;
      const visibleHeight = viewport.height + viewport.offsetTop; // area not overlapped by keyboard
      let keyboardHeight = Math.max(0, Math.round(fullHeight - visibleHeight));

      // iOS sometimes needs a little extra padding to avoid being clipped
      if (isIOS && keyboardHeight > 0) {
        keyboardHeight += 48; // small cushion above iOS keyboard
      }

      setBottomOffset(keyboardHeight);
    };

    computeOffset();
    vv?.addEventListener('resize', computeOffset);
    vv?.addEventListener('scroll', computeOffset);
    window.addEventListener('resize', computeOffset);

    return () => {
      vv?.removeEventListener('resize', computeOffset);
      vv?.removeEventListener('scroll', computeOffset);
      window.removeEventListener('resize', computeOffset);
    };
  }, []);

  return (
    <div
      style={{
        position: 'sticky',
        bottom: bottomOffset,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0px)',
        background: 'white',
        zIndex: 40,
        marginTop: 'auto',
      }}
      className={`px-6 pt-3 pb-6 ${className}`}
    >
      <div className="w-full max-w-full mx-auto">
        {children}
      </div>
    </div>
  );
};
