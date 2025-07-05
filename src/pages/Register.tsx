
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        navigate('/login');
      } else {
        toast({
          title: "Registration successful!",
          description: "Welcome! You can now start donating items."
        });
        navigate('/');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1733a7' }}>
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
        <img
          src="/lovable-uploads/66828e04-ca12-4680-80e2-f4704d6832eb.png"
          alt="Rackis for Barn Logo"
          className="w-[600px] h-auto object-contain"
          onError={(e) => {
            console.error('Failed to load bear logo');
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      <div className="relative z-10">
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
              
              <div className="text-center space-y-2">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Already have an account? Login here
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
        </PageWrapper>
      </div>
    </div>
  );
};

export default Register;
