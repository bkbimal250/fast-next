-- Migration script to add required_gender column to jobs table
-- Run this script on your PostgreSQL database

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'required_gender'
    ) THEN
        ALTER TABLE jobs 
        ADD COLUMN required_gender VARCHAR(255) NOT NULL DEFAULT 'Female';
        
        RAISE NOTICE 'Column required_gender added successfully';
    ELSE
        RAISE NOTICE 'Column required_gender already exists';
    END IF;
END $$;

