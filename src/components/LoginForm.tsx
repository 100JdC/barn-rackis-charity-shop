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
