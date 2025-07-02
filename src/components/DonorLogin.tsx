
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Check if user exists and password matches
      const users = await storage.getUsers();
      const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      
      if (!user) {
        setError("User not found. Please register first.");
        return;
      }

      if (!user.password || user.password !== password) {
        setError("Invalid password");
        return;
      }
      
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
          <CardTitle className="text-center text-2xl" style={{ color: '#1733a7' }}>Donor Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {loading ? 'Logging in...' : 'Login as Donor'}
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
