
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [view, setView] = useState<'options' | 'login' | 'register'>('options');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Both email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log('Login successful:', data.user.email);
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in."
        });
        // The onAuthStateChange will handle the login automatically
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Both email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log('Registration successful:', data.user.email);
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account."
        });
        // The onAuthStateChange will handle the login automatically
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl" style={{ color: '#1733a7' }}>Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                style={{ backgroundColor: '#1733a7' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              onClick={() => setView('options')}
              className="w-full"
              style={{ borderColor: '#1733a7', color: '#1733a7' }}
              disabled={loading}
            >
              Back to Options
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (view === 'register') {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl" style={{ color: '#1733a7' }}>Register as Donor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Choose a password (min 6 characters)"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>

              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                <strong>⚠️ Security Notice:</strong> For safety reasons, please use a unique password that you don't use for other important accounts.
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                style={{ backgroundColor: '#1733a7' }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Donor'}
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              onClick={() => setView('options')}
              className="w-full"
              style={{ borderColor: '#1733a7', color: '#1733a7' }}
              disabled={loading}
            >
              Back to Options
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

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
            onClick={() => setView('register')}
            className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
            variant="outline"
          >
            Register to donate
          </Button>
        </div>
        <div className="text-center">
          <Button
            onClick={() => setView('login')}
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
