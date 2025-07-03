
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [view, setView] = useState<'options' | 'login' | 'register'>('options');
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      // Check for admin credentials first - allow admin to login without email verification
      if (email.toLowerCase() === "jacob@admin.com" && password === "Rackis") {
        console.log('Admin login successful');
        toast({
          title: "Welcome back, Admin!",
          description: "You have been successfully logged in."
        });
        onLogin('admin', 'Jacob');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before logging in.");
        } else if (error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(error.message);
        }
        return;
      }
      
      console.log('User login successful:', data.user?.email);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in."
      });
      
      const userUsername = data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'User';
      onLogin('donator', userUsername);
      
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError("Email, username, and password are all required");
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.trim()
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError("An account with this email already exists. Please try logging in instead.");
        } else {
          setError(error.message);
        }
        return;
      }

      console.log('Registration successful:', data.user?.email);
      
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration successful!",
          description: "Please check your email for a confirmation link before logging in.",
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "Welcome! You can now start donating items."
        });
        
        // Auto-login after registration if email is already confirmed
        onLogin('donator', username.trim());
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
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
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
