-- Update all existing records from 'comprado' to 'comprador'
UPDATE public.registrations 
SET tipo = 'comprador'::registration_type
WHERE tipo::text = 'comprado';