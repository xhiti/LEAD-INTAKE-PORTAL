CREATE TYPE profile_status AS ENUM ('unverified', 'active', 'deactivated', 'suspended', 'deleted');

ALTER TABLE public.profiles ADD COLUMN status profile_status DEFAULT 'unverified'::profile_status;

UPDATE public.profiles
SET status = 
  CASE 
    WHEN is_deleted = true THEN 'deleted'::profile_status
    WHEN is_active = false THEN 'deactivated'::profile_status
    WHEN email_verified = false THEN 'unverified'::profile_status
    ELSE 'active'::profile_status
  END;

ALTER TABLE public.profiles ALTER COLUMN status SET NOT NULL;

