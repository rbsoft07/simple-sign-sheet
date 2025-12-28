-- Add new columns for conditional fields
ALTER TABLE public.registrations 
ADD COLUMN bought_from_name text,
ADD COLUMN bought_from_lastname text,
ADD COLUMN inherited_from_name text,
ADD COLUMN inherited_from_lastname text,
ADD COLUMN inherited_from_signature text;

-- Fix the typo: rename 'herdero' to 'heredero' in the enum
ALTER TYPE public.registration_type RENAME VALUE 'herdero' TO 'heredero';