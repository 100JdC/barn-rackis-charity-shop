
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { storage } from "@/utils/storage";
import { PageWrapper } from "@/components/PageWrapper";

interface DonorRegistrationProps {
  onRegister: (username: string, password: string) => void;
  onBack: () => void;
}

export const DonorRegistration = ({ onRegister, onBack }: DonorRegistrationProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if username already exists
      const existingUsers = await storage.getUsers();
      if (existingUsers.some(user => user.username.toLowerCase() === username.trim().toLowerCase())) {
        setError("Username already exists");
        return;
      }
      
      onRegister(username.trim(), password);
    } catch (error) {
      console.error('Registration error:', error);
      setError("Registration failed. Please try again.");
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
            Donor Registration (Deprecated)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              This registration system is deprecated for security reasons. Please use the main authentication system at /auth for secure registration.
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
                placeholder="Choose a username"
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
                placeholder="Choose a password"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 mt-1">
                For safety reasons, please use a random, non-secret password
              </p>
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
            onClick={onBack}
            className="w-full"
            style={{ borderColor: '#1733a7', color: '#1733a7' }}
            disabled={loading}
          >
            Back to Login Options
          </Button>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};
