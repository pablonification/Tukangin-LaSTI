import React from "react";

interface BaseCanvasProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
  centerContent?: boolean;
  padding?: string;
}

export const BaseCanvas = ({
  children,
  className = "",
  withBottomNav = false,
  centerContent = true,
  padding = "px-6"
}: BaseCanvasProps) => {
  const mainClasses = [
    "min-h-screen",
    "flex",
    "flex-col",
    withBottomNav ? "pb-16" : "",
    className
  ].filter(Boolean).join(" ");

  const contentClasses = [
    "flex-1",
    centerContent ? "flex flex-col items-center justify-center" : "flex flex-col",
    padding,
    withBottomNav ? "pb-safe" : ""
  ].filter(Boolean).join(" ");

  return (
    <main className={mainClasses}>
      <div className={contentClasses}>
        {children}
      </div>
    </main>
  );
};

