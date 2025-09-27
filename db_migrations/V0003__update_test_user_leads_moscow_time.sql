-- Update created_at for leads of test user to current Moscow time
UPDATE t_p72874800_user_registration_vi.video_leads 
SET created_at = TIMEZONE('Europe/Moscow', NOW()) 
WHERE user_id = 11;