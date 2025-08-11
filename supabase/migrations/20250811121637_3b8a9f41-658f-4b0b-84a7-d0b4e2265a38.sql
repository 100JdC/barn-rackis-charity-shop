-- Remove the problematic trigger that doesn't work properly
DROP TRIGGER IF EXISTS handle_username_or_email_sign_in ON auth.audit_log_entries;

-- Create a simpler approach: update the existing handle_new_user function to also handle email lookup
-- This function will be used when users sign up to ensure consistent username handling