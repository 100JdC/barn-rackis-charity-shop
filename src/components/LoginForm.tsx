
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonorRegistration } from "./DonorRegistration";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [view, setView] = useState<'options' | 'admin' | 'donor-register'>('options');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === "Jacob" && password === "Rackis") {
      onLogin('admin');
    } else {
      setError("Invalid admin credentials");
    }
  };

  const handleDonorRegister = (donorUsername: string, donorPassword: string) => {
    // In a real app, you'd save this to a database
    // For now, we'll just proceed with the username
    onLogin('donator', donorUsername);
  };

  if (view === 'donor-register') {
    return (
      <DonorRegistration 
        onRegister={handleDonorRegister}
        onBack={() => setView('options')}
      />
    );
  }

  if (view === 'admin') {
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
              <CardTitle className="text-center text-2xl text-gray-800">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter admin username"
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
                    placeholder="Enter admin password"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Login as Admin
                </Button>
              </form>
              
              <Button 
                variant="outline" 
                onClick={() => setView('options')}
                className="w-full"
              >
                Back to Options
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-center text-2xl text-gray-800">Access Inventory System</CardTitle>
            <p className="text-gray-600 text-center">Choose your access level</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setView('admin')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Admin Login
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setView('donor-register')}
              className="w-full border-blue-300 hover:bg-blue-50"
            >
              Register as Donor
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onLogin('buyer')}
              className="w-full border-blue-300 hover:bg-blue-50"
            >
              Proceed as Buyer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
