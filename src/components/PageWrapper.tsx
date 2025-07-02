// src/components/PageWrapper.tsx
import { ReactNode } from "react";
import { BackgroundLogo } from "./BackgroundLogo";

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#1733a7' }}>


      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-80">
        <BackgroundLogo />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};
