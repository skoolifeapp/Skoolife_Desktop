-- Drop finance tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.finance_transactions;
DROP TABLE IF EXISTS public.finance_budgets;
DROP TABLE IF EXISTS public.finance_settings;
DROP TABLE IF EXISTS public.finance_accounts;
DROP TABLE IF EXISTS public.finance_categories;

-- Drop tasks table
DROP TABLE IF EXISTS public.tasks;