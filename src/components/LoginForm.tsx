
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonorRegistration } from "./DonorRegistration";
import { DonorLogin } from "./DonorLogin";
import { storage } from "@/utils/storage";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [view, setView] = useState<'options' | 'admin' | 'donor-register' | 'donor-options' | 'donor-login'>('options');
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
    // Save user with password to storage
    storage.addUser(donorUsername, donorPassword);
    onLogin('donator', donorUsername);
  };

  const handleDonorLogin = (donorUsername: string) => {
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

  if (view === 'donor-login') {
    return (
      <DonorLogin 
        onLogin={handleDonorLogin}
        onBack={() => setView('donor-options')}
      />
    );
  }

  if (view === 'donor-options') {
    return (
      <div className="min-h-screen relative">
        {/* Background with larger, centered Rackis logo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80">
            <img 
              src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
              alt="Rackis for Barn Logo" 
              className="w-[500px] h-auto object-contain"
            />
          </div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm shadow-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white">Donate Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-white/90 mb-6">
                Choose how you'd like to proceed with donating your items.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => setView('donor-register')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  Register as New Donor
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setView('donor-login')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  I'm Already Registered - Login
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => setView('options')}
                className="w-full mt-4 text-white/80 hover:text-white hover:bg-white/10"
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
        {/* Background with larger, centered teddy bear */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80">
            <img 
              src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
              alt="Rackis for Barn Logo" 
              className="w-[500px] h-auto object-contain"
            />
          </div>
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm shadow-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-white">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter admin username"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>

                {error && (
                  <div className="text-red-300 text-sm">{error}</div>
                )}

                <Button type="submit" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline">
                  Login as Admin
                </Button>
              </form>
              
              <Button 
                variant="ghost" 
                onClick={() => setView('options')}
                className="w-full text-white/80 hover:text-white hover:bg-white/10"
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
      {/* Background with large, centered Rackis logo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80">
          <img 
            src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png" 
            alt="Rackis for Barn Logo" 
            className="w-[600px] h-auto object-contain"
          />
        </div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-sm shadow-xl border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-4"> Welcome to Rackis for Barn!</CardTitle>
            <div className="text-lg text-white/90 space-y-3 leading-relaxed">
              <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
              <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
              <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
              <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
              <p className="font-semibold text-white">🌍 Good for students. Good for the planet.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <Button 
                variant="link" 
                onClick={() => window.open('/about', '_blank')}
                className="text-white/90 hover:text-white text-lg"
              >
                👉 Find out more about the concept, who we are, and how you can contribute.
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => onLogin('buyer')}
                className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
                variant="outline"
              >
                Browse our items
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setView('donor-options')}
                className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
              >
                Here you can donate
              </Button>
            </div>
            
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setView('admin')}
                className="text-sm text-white/60 hover:text-white/80"
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
