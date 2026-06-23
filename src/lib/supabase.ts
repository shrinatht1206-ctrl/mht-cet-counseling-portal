import { createClient } from '@supabase/supabase-js'
import { StudentProfile } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function fetchProfiles(): Promise<StudentProfile[]> {
  const { data, error } = await supabase.from('student_profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as StudentProfile[]
}

export async function createProfile(profile: Omit<StudentProfile, 'id' | 'created_at'>): Promise<StudentProfile> {
  const { data, error } = await supabase.from('student_profiles').insert(profile).select().single()
  if (error) throw error
  return data as StudentProfile
}

export async function updateProfile(id: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
  const { data, error } = await supabase.from('student_profiles').update(profile).eq('id', id).select().single()
  if (error) throw error
  return data as StudentProfile
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from('student_profiles').delete().eq('id', id)
  if (error) throw error
}
