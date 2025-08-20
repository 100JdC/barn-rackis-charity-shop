
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { storage } from "@/utils/storage";
import { PageWrapper } from "@/components/PageWrapper";

interface DonorLoginProps {
  onLogin: (username: string) => void;
  onBack: () => void;
}

export const DonorLogin = ({ onLogin, onBack }: DonorLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Both username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // SECURITY: Removed hardcoded admin credentials
      // All authentication now goes through Supabase Auth
      
      // For backwards compatibility with the old donor system,
      // check localStorage for registered users
      const users = await storage.getUsers();
      const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      
      if (!user) {
        setError("User not found. Please use the main login system or register first.");
        return;
      }

      if (!user.password || user.password !== password) {
        setError("Invalid password. Please use the main login system for secure authentication.");
        return;
      }
      
      // Note: This legacy system should be migrated to Supabase Auth
      onLogin(username.trim());
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2" style={{ color: '#1733a7' }}>
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Donor Login (Deprecated)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              This login system is deprecated for security reasons. Please use the main authentication system at /auth for secure access.
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
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
            onClick={onBack}
            className="w-full"
            style={{ borderColor: '#1733a7', color: '#1733a7' }}
            disabled={loading}
          >
            Back to Donor Options
          </Button>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};
