-- Migration script to update messages.job_id foreign key constraint
-- Changes from CASCADE to SET NULL so messages are preserved when jobs are deleted
-- Run this script on your PostgreSQL database

-- Step 1: Drop the existing foreign key constraint
-- First, find the constraint name (common names listed below)
-- You can find it with: SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'messages' AND constraint_type = 'FOREIGN KEY';

-- Drop the constraint (replace 'messages_job_id_fkey' with actual constraint name if different)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the foreign key constraint on job_id
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'messages'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'job_id'
    LIMIT 1;
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE messages DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on messages.job_id';
    END IF;
END $$;

-- Step 2: Add new foreign key constraint with SET NULL
ALTER TABLE messages 
ADD CONSTRAINT messages_job_id_fkey 
FOREIGN KEY (job_id) 
REFERENCES jobs(id) 
ON DELETE SET NULL;

-- Verify the change
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'messages'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'job_id';

-- Expected result: delete_rule should be 'SET NULL'

