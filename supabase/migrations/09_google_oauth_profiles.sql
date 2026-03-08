CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_given_name TEXT;
  v_family_name TEXT;
  v_avatar_url TEXT;
BEGIN 
  v_given_name := COALESCE(
    NEW.raw_user_meta_data->>'given_name',
    NEW.raw_user_meta_data->>'first_name',
    split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
    split_part(NEW.email, '@', 1),
    'User'
  );

  v_family_name := COALESCE(
    NEW.raw_user_meta_data->>'family_name',
    NEW.raw_user_meta_data->>'last_name',
    SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1),
    ''
  );

  IF v_family_name = NEW.raw_user_meta_data->>'full_name' THEN
    v_family_name := '';
  END IF;

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, name, surname, avatar_url, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@no-email.internal'),
    v_given_name,
    v_family_name,
    v_avatar_url,
    'user',
    'unverified'::profile_status
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    surname = EXCLUDED.surname,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
