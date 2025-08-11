import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'donor';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  username: string;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('donor');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout to prevent infinite loading - reduced to 2 seconds
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('⏰ Auth loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 2000); // 2 seconds timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session result:', session?.user?.email || 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event, session?.user?.email || 'No session');
        
        if (!mounted) return;
        
        // Don't override manually cleared state during logout
        if (event === 'SIGNED_OUT') {
          console.log('🚪 Auth state: SIGNED_OUT detected');
          setSession(null);
          setUser(null);
          setUserRole('donor');
          setUsername('');
          setLoading(false); // Ensure loading is false
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id);
            }
          }, 0);
        } else {
          setUserRole('donor');
          setUsername('');
        }
        
        // Always ensure loading is false after auth state changes
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // Set defaults if profile loading fails
        setUsername('User');
        setUserRole('donor');
        return;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        setUsername(profile.username || 'User');
        // Map 'buyer' to 'donor' for consistency in the frontend
        const frontendRole = (profile.role === 'buyer' || profile.role === 'donor') ? 'donor' : profile.role as UserRole;
        setUserRole(frontendRole || 'donor');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set defaults if profile loading fails
      setUsername('User');
      setUserRole('donor');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Starting sign in...');
      setLoading(true);
      
      // Try to sign in with the provided credentials
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false); // Ensure loading is cleared on error
        throw error;
      }

      console.log('✅ Sign in successful');
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Don't set loading false here - let auth state listener handle it
    } catch (error: any) {
      setLoading(false); // Clear loading on error
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.toLowerCase()
          }
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email for verification (if required)",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Starting logout process...');
    
    // Immediately clear ALL state to prevent any loading loops
    console.log('🔄 Clearing all auth state immediately');
    setLoading(false); // CRITICAL: Set loading false FIRST
    setUser(null);
    setSession(null);
    setUserRole('donor');
    setUsername('');
    
    // Show success message immediately
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

    console.log('✅ UI logout completed immediately');

    // Background Supabase cleanup (completely non-blocking)
    setTimeout(() => {
      console.log('🔧 Starting background Supabase cleanup');
      supabase.auth.signOut().then(({ error }) => {
        if (error) {
          console.warn('⚠️ Background signOut warning (non-critical):', error);
        } else {
          console.log('✅ Background Supabase signOut completed');
        }
      }).catch((error) => {
        console.warn('⚠️ Background signOut error (non-critical):', error);
      });
    }, 0);
  };

  const value = {
    user,
    session,
    userRole,
    username,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};