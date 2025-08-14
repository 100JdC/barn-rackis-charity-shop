import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { storage } from "@/utils/storage";
import { Footer } from "@/components/Footer";

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password.trim()) {
      setError("Both email/username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // SECURITY: Removed hardcoded admin credentials
      // All authentication now goes through Supabase Auth for security

      // Check if input is an email or username for regular users
      const isEmail = emailOrUsername.includes('@');
      let loginEmail = emailOrUsername;

      // If it's not an email, treat it as a username and find the corresponding email
      if (!isEmail) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', emailOrUsername.toLowerCase())
            .single();

          if (profileError || !profile) {
            setError("Username not found. Please check your username or try using your email instead.");
            return;
          }

          // Get the user's email from auth.users table
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) {
            // If we can't get current user, we need to use the email from the auth system
            // For now, we'll show an error and ask them to use email
            setError("Please use your email address to log in, or contact support if you only remember your username.");
            return;
          }
        } catch (error) {
          console.error('Error finding user by username:', error);
          setError("Please use your email address to log in.");
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before logging in.");
        } else if (error.message.includes('Invalid login credentials')) {
          setError("Invalid credentials. Please check your email/username and password.");
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
      
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4" style={{ backgroundColor: '#1733a7' }}>
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl" style={{ color: '#1733a7' }}>Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  placeholder="Enter your email or username"
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
            
            <div className="text-center space-y-2">
              <Button 
                variant="link" 
                onClick={() => navigate('/register')}
                className="text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Don't have an account? Register here
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
                style={{ borderColor: '#1733a7', color: '#1733a7' }}
                disabled={loading}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
