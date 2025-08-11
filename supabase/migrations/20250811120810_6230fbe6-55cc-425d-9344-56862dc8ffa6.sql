-- Enable trigger for username/email login
CREATE OR REPLACE TRIGGER handle_username_or_email_sign_in
  BEFORE INSERT ON auth.audit_log_entries
  FOR EACH ROW
  WHEN (NEW.payload->>'action' = 'login')
  EXECUTE FUNCTION public.handle_username_or_email_sign_in();