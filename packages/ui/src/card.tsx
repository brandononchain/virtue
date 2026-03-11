import React from "react";
import { cn } from "./utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-card border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5",
        hover &&
          "transition-all duration-300 cursor-pointer hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:shadow-panel-hover hover:-translate-y-0.5 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}
