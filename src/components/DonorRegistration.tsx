
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/utils/storage";

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
    
    // Save user to storage
    storage.addUser(username.trim());
    
    onRegister(username.trim(), password);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with images */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="absolute top-0 left-0 w-1/2 h-1/3 opacity-20">
          <img 
            src="/lovable-uploads/74b13bd1-2a11-44cc-986f-298a9ebc67b6.png" 
            alt="Background" 
            className="w-full h-full object-cover rounded-br-3xl"
          />
        </div>
        <div className="absolute top-8 right-8 w-32 h-32">
          <img 
            src="/lovable-uploads/e864de0e-0b29-4248-a8d7-0a94ae10521b.png" 
            alt="Barncancerfonden Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800">Donor Registration</CardTitle>
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

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Register as Donor
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full border-blue-300 hover:bg-blue-50"
            >
              Back to Login Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
