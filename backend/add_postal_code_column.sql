-- Migration script to add postalCode column to jobs and spas tables
-- Run this script on your PostgreSQL database

-- Add postalCode to jobs table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='jobs' AND column_name='postalCode'
    ) THEN
        ALTER TABLE jobs ADD COLUMN "postalCode" VARCHAR(10);
        RAISE NOTICE 'Added postalCode column to jobs table';
    ELSE
        RAISE NOTICE 'postalCode column already exists in jobs table';
    END IF;
END $$;

-- Add postalCode to spas table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='spas' AND column_name='postalCode'
    ) THEN
        ALTER TABLE spas ADD COLUMN "postalCode" VARCHAR(10);
        RAISE NOTICE 'Added postalCode column to spas table';
    ELSE
        RAISE NOTICE 'postalCode column already exists in spas table';
    END IF;
END $$;

