import { Info } from "lucide-react";

export const BetaNotice = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-2">
      <div className="flex items-center">
        <Info className="h-4 w-4 text-amber-600 mr-2" />
        <p className="text-sm text-amber-700">
          <strong>Beta Version:</strong> This platform is currently in development. Some features may be incomplete or change without notice.
        </p>
      </div>
    </div>
  );
};