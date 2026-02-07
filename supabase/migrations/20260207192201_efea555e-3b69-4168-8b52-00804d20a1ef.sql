-- Add cedula column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN cedula text NOT NULL DEFAULT '';

-- Create unique index on cedula (excluding empty values for existing records)
CREATE UNIQUE INDEX idx_registrations_cedula ON public.registrations (cedula) WHERE cedula != '';

-- Create unique index on phone
CREATE UNIQUE INDEX idx_registrations_phone ON public.registrations (phone);