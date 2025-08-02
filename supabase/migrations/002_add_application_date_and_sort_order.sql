-- Add application_date and sort_order columns to companies table
-- Migration for selection steps update

-- Add application_date column
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS application_date DATE;

-- Add sort_order column for ordering within steps
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add index for sort_order to improve query performance
CREATE INDEX IF NOT EXISTS companies_sort_order_idx ON public.companies(sort_order);

-- Add index for application_date
CREATE INDEX IF NOT EXISTS companies_application_date_idx ON public.companies(application_date);

-- Update existing companies with default sort_order based on creation date
-- This ensures existing companies have a proper sort order within their steps
UPDATE public.companies 
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY current_step ORDER BY created_at) as row_num
  FROM public.companies
  WHERE sort_order IS NULL OR sort_order = 0
) sub
WHERE companies.id = sub.id;