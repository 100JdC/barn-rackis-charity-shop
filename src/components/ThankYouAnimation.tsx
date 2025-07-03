
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface ThankYouAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const ThankYouAnimation = ({ isVisible, onComplete }: ThankYouAnimationProps) => {
  const [phase, setPhase] = useState<'jumping' | 'thanking' | 'complete'>('jumping');

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => {
      setPhase('thanking');
    }, 1500);

    const timer2 = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
        <div className="space-y-4">
          {/* Teddy Says Thanks Animation */}
          <div className="flex justify-center">
            <div className={`transition-all duration-300 ${
              phase === 'jumping' 
                ? 'animate-bounce' 
                : phase === 'thanking' 
                ? 'scale-110' 
                : 'scale-100'
            }`}>
              <img 
                src="/lovable-uploads/826485e4-8e7b-4da4-8296-5679cab7c192.png" 
                alt="Teddy says thanks"
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>

          {/* Thank You Message */}
          <div className={`transition-all duration-500 ${
            phase === 'thanking' || phase === 'complete' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
            </div>
            <p className="text-gray-700">
              Your donation has been submitted successfully and is awaiting approval.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`bg-green-500 h-1 rounded-full transition-all duration-2000 ${
                phase === 'jumping' ? 'w-1/3' : 
                phase === 'thanking' ? 'w-2/3' : 
                'w-full'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
