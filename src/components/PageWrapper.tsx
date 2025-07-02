
import { ReactNode } from "react";
import { BackgroundLogo } from "./BackgroundLogo";

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: '#1733a7' }}
    >
      <BackgroundLogo />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};
