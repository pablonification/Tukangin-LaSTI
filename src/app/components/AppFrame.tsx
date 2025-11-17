import React from "react";

interface AppFrameProps {
  children: React.ReactNode;
}

export const AppFrame = ({ children }: AppFrameProps) => {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full min-h-screen pb-6">
        {children}
      </div>
    </div>
  );
};


