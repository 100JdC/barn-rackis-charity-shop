
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    // Check if username already exists
    const existingUsers = storage.getUsers();
    if (existingUsers.some(user => user.username.toLowerCase() === username.trim().toLowerCase())) {
      setError("Username already exists");
      return;
    }
    
    // Save user with password to storage
    storage.addUser(username.trim(), password);
    
    onRegister(username.trim(), password);
  };

  return (
    <PageWrapper>
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl" style={{ color: '#1733a7' }}>Donor Registration</CardTitle>
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
                placeholder="Choose a username"
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
              />
              <p className="text-sm text-gray-600 mt-1">
                For safety reasons, please use a random, non-secret password
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" style={{ backgroundColor: '#1733a7' }}>
              Register as Donor
            </Button>
          </form>
          
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full"
            style={{ borderColor: '#1733a7', color: '#1733a7' }}
          >
            Back to Login Options
          </Button>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};
