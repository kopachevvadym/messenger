import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { name } = JSON.parse(req.body);
  const { data, error } = await supabase
    .from('users')
    .insert([{ name }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.status(200).json(data);
}
