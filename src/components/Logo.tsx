
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const Logo = ({ size = "md", animated = true }: LogoProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };
  
  const animationClass = animated ? "transition-all duration-300" : "";
  
  return (
    <div 
      className={`font-bold ${sizeClasses[size]} ${animationClass} flex items-center gap-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`text-finance-blue ${isHovered ? "text-finance-accent" : ""} ${animationClass}`}>Profit</span>
      <span className={`text-finance-dark dark:text-white ${isHovered ? "text-finance-blue dark:text-finance-accent" : ""} ${animationClass}`}>aly</span>
    </div>
  );
};
