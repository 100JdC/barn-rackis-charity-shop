import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // 🔁 NEW CLEAN HOMEPAGE WITHOUT CARD, BLUR, OR OVERLAYS
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-br from-blue-600 to-blue-800">
      <img
        src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png"
        alt="Rackis for Barn Logo"
        className="w-72 h-auto mb-8"
      />

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        👋 Welcome to Rackis for Barn!
      </h1>

      <div className="text-lg text-white/90 space-y-4 max-w-2xl">
        <p>A platform for students in Uppsala to exchange second-hand items during move-ins and move-outs.</p>
        <p>We collect useful items from outgoing students and sell them at fair prices to new tenants.</p>
        <p>All profits go to Barncancerfonden, supporting children with cancer and their families.</p>
        <p>It's simple: buy and donate things you only need in Uppsala (duvets, curtains, bikes and much more) — sustainably and for a good cause.</p>
        <p className="font-semibold">🌍 Good for students. Good for the planet.</p>
      </div>

      <div className="mt-8 space-y-4 w-full max-w-md">
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

      <div className="mt-6">
        <Button
          variant="link"
          onClick={() => window.open('/about', '_blank')}
          className="text-white/90 hover:text-white text-base"
        >
          👉 Find out more about the concept, who we are, and how you can contribute.
        </Button>
      </div>

      <div className="mt-4">
        <Button
          variant="ghost"
          onClick={() => setView('admin')}
          className="text-sm text-white/60 hover:text-white/80"
        >
          Admin Access
        </Button>
      </div>
    </div>
  );
};
if (view === 'admin') {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-br from-blue-600 to-blue-800">
      <img
        src="/lovable-uploads/f66a4279-172c-4960-8e91-d687f82c9610.png"
        alt="Rackis for Barn Logo"
        className="w-72 h-auto mb-8"
      />

      <h2 className="text-3xl text-white mb-6 font-semibold">Admin Login</h2>

      <form onSubmit={handleAdminSubmit} className="space-y-4 w-full max-w-sm">
        <div className="text-left">
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

        <div className="text-left">
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

        <Button
          type="submit"
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          variant="outline"
        >
          Login as Admin
        </Button>

        <Button
          variant="ghost"
          onClick={() => setView('options')}
          className="w-full text-white/80 hover:text-white hover:bg-white/10"
        >
          Back to Home
        </Button>
      </form>
    </div>
  );
}
