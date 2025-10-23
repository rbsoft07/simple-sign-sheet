-- Add the new 'comprador' value to the registration_type enum
ALTER TYPE registration_type ADD VALUE IF NOT EXISTS 'comprador';