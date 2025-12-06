import { ReactNode } from "react";
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary" | "custom";
  size?: "sm" | "md" | "lg" | "custom";
  className?: string;
  disabled?: boolean;
  href?: string;
}

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "lg",
  className = "",
  disabled = false,
  href,
}: ButtonProps) => {
  const baseStyles = "w-full flex items-center justify-center space-x-3 cursor-pointer rounded-2xl text-sh3b transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-[#0CA2EB] text-white active:bg-[#0CA2EB]/90 disabled:active:bg-[#0CA2EB]",
    secondary: "bg-[#F5F9FC] text-[#0082C9] active:bg-[#F5F9FC]/90",
    tertiary: "bg-[#F5F9FC] text-[#0082C9] active:bg-[#F5F9FC]/90 opacity-50",
    custom: "",
  };

  const sizeStyles = {
    sm: "px-3 py-2 min-h-[44px]",
    md: "px-4 py-3 min-h-[48px]",
    lg: "px-6 py-4 min-h-[52px]",
    custom: ""
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

export default Button;
