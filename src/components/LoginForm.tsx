
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DonorRegistration } from "./DonorRegistration";
import { DonorLogin } from "./DonorLogin";
import { storage } from "@/utils/storage";
import { PageWrapper } from "@/components/PageWrapper";

interface LoginFormProps {
  onLogin: (role: 'admin' | 'donator' | 'buyer', username?: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [view, setView] = useState<'options' | 'admin' | 'donor-register' | 'donor-options' | 'donor-login'>('options');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const session = storage.getSession();
    if (session.role) {
      onLogin(session.role, session.username);
    }
  }, [onLogin]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Jacob" && password === "Rackis") {
      storage.saveSession('admin', username);
      onLogin('admin');
    } else {
      setError("Invalid admin credentials");
    }
  };

  const handleDonorRegister = async (donorUsername: string, donorPassword: string) => {
    try {
      await storage.addUser(donorUsername, donorPassword);
      storage.saveSession('donator', donorUsername);
      onLogin('donator', donorUsername);
    } catch (error) {
      console.error('Error registering user:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const handleDonorLogin = (donorUsername: string) => {
    storage.saveSession('donator', donorUsername);
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
      <PageWrapper>
        <div className="w-full max-w-2xl text-white space-y-6">
          <h2 className="text-center text-2xl">Donate Items</h2>
          <p className="text-center text-white/90">
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
              onClick={() => setView('donor-login')}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              I'm Already Registered - Login
            </Button>
          </div>
          <Button
            onClick={() => setView('options')}
            className="w-full mt-4 text-white/80 hover:text-white hover:bg-white/10"
            variant="ghost"
          >
            Back to Home
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (view === 'admin') {
    return (
      <PageWrapper>
        <div className="w-full max-w-2xl text-white space-y-6">
          <h2 className="text-center text-2xl">Admin Login</h2>
          <form onSubmit={handleAdminSubmit} className="space-y-4" autoComplete="on">
            <div>
              <Label htmlFor="admin-username" className="text-white">Username</Label>
              <Input
                id="admin-username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter admin username"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-white">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
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
            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              Login as Admin
            </Button>
          </form>
          <Button
            onClick={() => setView('options')}
            className="w-full text-white/80 hover:text-white hover:bg-white/10"
            variant="ghost"
          >
            Back to Options
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-4xl text-white space-y-6">
        <h1 className="text-3xl text-center mb-4 text-white">Welcome to Rackis for Barn!</h1>
        <div className="text-lg text-white/90 space-y-3 leading-relaxed text-center">
          <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
          <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
          <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
          <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
          <p className="font-semibold text-white">🌍 Good for students. Good for the planet.</p>
        </div>
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => window.open('/about', '_blank')}
            className="text-white/90 hover:text-white text-lg underline"
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
            onClick={() => setView('donor-options')}
            className="w-full bg-white/20 hover:bg-white/30 text-white h-12 text-lg border-white/30"
            variant="outline"
          >
            Here you can donate
          </Button>
        </div>
        <div className="text-center pt-4">
          <Button
            onClick={() => setView('admin')}
            className="text-sm text-white/60 hover:text-white/80"
            variant="ghost"
          >
            Admin Access
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};
