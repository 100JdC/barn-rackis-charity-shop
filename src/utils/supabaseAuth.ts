
import { supabase } from '@/integrations/supabase/client';

// User Registration with Privacy Focus
export async function registerUser(email: string, password: string, username: string, displayName = '') {
  try {
    // 1. Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: username.trim()
        }
      }
    });
    
    if (error) throw error;
    
    // 2. Create user profile with privacy settings
    if (data.user) {
      // Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          display_name: displayName || username,
          email_visible: false
        });
      
      if (profileError) {
        console.warn('Profile creation failed:', profileError);
        // Don't throw error here as user is still created
      }
      
      // Set default email preferences
      const { error: prefError } = await supabase
        .from('email_preferences')
        .insert({
          user_id: data.user.id,
          account_emails: true,
          feature_updates: false,
          marketing: false
        });
      
      if (prefError) {
        console.warn('Email preferences creation failed:', prefError);
        // Don't throw error here as user is still created
      }
    }
    
    return {
      success: true,
      message: "Account created! Please check your email for verification.",
      user: data.user
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// User Login
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return {
      success: true,
      user: data.user
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Get User Profile with Privacy Settings
export async function getUserProfile() {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) throw new Error('Not authenticated');
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.warn('Profile fetch failed:', profileError);
    }
    
    // Get email preferences
    const { data: preferences, error: prefError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (prefError) {
      console.warn('Email preferences fetch failed:', prefError);
    }
    
    return {
      success: true,
      user: {
        ...user,
        profile,
        emailPreferences: preferences
      }
    };
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Update Email Preferences
export async function updateEmailPreferences(preferences: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) throw new Error('Not authenticated');
    
    // Ensure account emails can't be disabled
    const safePreferences = { ...preferences, account_emails: true };
    
    const { error } = await supabase
      .from('email_preferences')
      .update(safePreferences)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Email preferences updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return {
      success: false,
      message: error.message
    };
  }
}
