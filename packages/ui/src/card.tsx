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
        "rounded-lg border border-zinc-800 bg-zinc-900/60 p-4",
        hover && "transition-colors hover:border-zinc-600 hover:bg-zinc-900/80 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
