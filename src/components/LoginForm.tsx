
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
  const [view, setView] = useState<'options' | 'admin' | 'donor-register' | 'donor-options'>('options');
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
        onBack={() => setView('donor-options')}
      />
    );
  }

  if (view === 'donor-options') {
    return (
      <div className="min-h-screen relative">
        {/* Background with Rackis logo positioned to show teddy bear */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute bottom-10 right-10 opacity-30">
            <img 
              src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
              alt="Rackis for Barn Logo" 
              className="w-80 h-auto object-contain"
            />
          </div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-blue-800">Donate Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                Choose how you'd like to proceed with donating your items.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => setView('donor-register')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Register as New Donor
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => onLogin('donator')}
                  className="w-full border-blue-300 hover:bg-blue-50"
                >
                  I'm Already Registered - Login
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => setView('options')}
                className="w-full mt-4"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen relative">
        {/* Background with images */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute bottom-10 right-10 opacity-30">
            <img 
              src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
              alt="Rackis for Barn Logo" 
              className="w-80 h-auto object-contain"
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
      {/* Background with Rackis logo positioned to show teddy bear */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute bottom-10 right-10 opacity-30">
          <img 
            src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
            alt="Rackis for Barn Logo" 
            className="w-80 h-auto object-contain"
          />
        </div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-blue-800 mb-4">👋 Welcome to Rackis for Barn!</CardTitle>
            <div className="text-lg text-gray-700 space-y-3 leading-relaxed">
              <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
              <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
              <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
              <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
              <p className="font-semibold text-blue-700">🌍 Good for students. Good for the planet.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <Button 
                variant="link" 
                onClick={() => window.open('/about', '_blank')}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                👉 Find out more about the concept, who we are, and how you can contribute.
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => onLogin('buyer')}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                Browse our items
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setView('donor-options')}
                className="w-full border-blue-300 hover:bg-blue-50 h-12 text-lg"
              >
                Here you can donate
              </Button>
            </div>
            
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setView('admin')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Admin Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
