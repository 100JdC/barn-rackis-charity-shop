
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="w-full max-w-4xl text-white space-y-6">
        <h1 className="text-3xl text-center mb-4 text-white">Welcome to Rackis for Barn!</h1>
        <div className="text-lg text-white/90 space-y-3 leading-relaxed text-center">
          <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
          <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
          <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
          <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
          <p className="font-semibold text-white">🌍 Good for students. Good for the planet.</p>
        </div>
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => window.open('/about', '_blank')}
            className="text-white/90 hover:text-white text-lg underline"
          >
            👉 Find out more about the concept, who we are, and how you can contribute.
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => onLogin('buyer')}
            className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
            variant="outline"
          >
            Browse our items
          </Button>
          <Button
            onClick={() => navigate('/register')}
            className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
            variant="outline"
          >
            Register to donate
          </Button>
        </div>
        <div className="text-center">
          <Button
            onClick={() => navigate('/login')}
            className="text-white/80 hover:text-white text-lg underline"
            variant="link"
          >
            Already have an account? Login here
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};
