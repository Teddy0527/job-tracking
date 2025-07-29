import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

console.log('Supabase config:', { 
  url: supabaseUrl, 
  keyPresent: !!supabaseKey,
  keyLength: supabaseKey?.length 
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const signInWithGoogle = async () => {
  // 開発環境では localhost:3000、本番環境では実際のドメインを使用
  const redirectUrl = process.env.REACT_APP_REDIRECT_URL || `${window.location.origin}/dashboard`;
  
  console.log('Auth redirect URL:', redirectUrl);
  console.log('Current origin:', window.location.origin);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
  
  console.log('OAuth result:', { data, error });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helper functions
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCompany = async (company: Omit<any, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  console.log('Creating company with data:', company);
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current user:', { user, userError });
  
  if (!user) {
    console.error('User not authenticated');
    throw new Error('Not authenticated');
  }

  const companyData = { 
    ...company, 
    user_id: user.id
  };
  console.log('Company data to insert:', companyData);

  const { data, error } = await supabase
    .from('companies')
    .insert([companyData])
    .select()
    .single();
    
  console.log('Insert result:', { data, error });
  
  if (error) {
    console.error('Database insert error:', error);
  }
  
  return { data, error };
};

export const updateCompany = async (id: string, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('companies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCompany = async (id: string) => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
  return { error };
};

// Schedule helper functions
export const getSchedules = async (companyId: string) => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('company_id', companyId)
    .order('date', { ascending: true });
  return { data, error };
};

export const createSchedules = async (companyId: string, schedules: Array<{title: string, date: string}>) => {
  if (schedules.length === 0) return { data: [], error: null };
  
  const scheduleData = schedules
    .filter(s => s.title.trim() && s.date)
    .map(schedule => ({
      company_id: companyId,
      title: schedule.title.trim(),
      date: schedule.date
    }));

  if (scheduleData.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('schedules')
    .insert(scheduleData)
    .select();
  return { data, error };
};

export const updateSchedule = async (id: string, updates: Partial<{title: string, date: string}>) => {
  const { data, error } = await supabase
    .from('schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteSchedule = async (id: string) => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);
  return { error };
};

export const deleteCompanySchedules = async (companyId: string) => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('company_id', companyId);
  return { error };
};

// Document helper functions
export const getCompanyDocuments = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_documents')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCompanyDocuments = async (companyId: string, documents: Array<{title: string, url: string}>) => {
  if (documents.length === 0) return { data: [], error: null };
  
  const documentData = documents
    .filter(d => d.title.trim() && d.url.trim())
    .map(document => ({
      company_id: companyId,
      title: document.title.trim(),
      url: document.url.trim()
    }));

  if (documentData.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('company_documents')
    .insert(documentData)
    .select();
  return { data, error };
};

export const updateCompanyDocument = async (id: string, updates: Partial<{title: string, url: string}>) => {
  const { data, error } = await supabase
    .from('company_documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCompanyDocument = async (id: string) => {
  const { error } = await supabase
    .from('company_documents')
    .delete()
    .eq('id', id);
  return { error };
};

export const deleteCompanyDocuments = async (companyId: string) => {
  const { error } = await supabase
    .from('company_documents')
    .delete()
    .eq('company_id', companyId);
  return { error };
};