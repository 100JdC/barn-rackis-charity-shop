
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Both username and password are required");
      return;
    }

    // Check if user exists and password matches
    const users = storage.getUsers();
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
  };

  return (
    <PageWrapper>
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-blue-800">Donor Login</CardTitle>
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
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Login as Donor
            </Button>
          </form>
          
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full border-blue-300 hover:bg-blue-50"
          >
            Back to Donor Options
          </Button>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};
