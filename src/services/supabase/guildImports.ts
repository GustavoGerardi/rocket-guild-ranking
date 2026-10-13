import { supabase } from '../../lib/supabase.ts';
import type { GuildData } from '../../types/guild.ts';

export const isSupabaseConfigured = Boolean(supabase);

export function loadLatestGuildImport() {
  return supabase!
    .from('guild_imports')
    .select('data, file_name')
    .eq('id', 'latest')
    .maybeSingle();
}

export function saveLatestGuildImport(data: GuildData, fileName: string) {
  return supabase!.from('guild_imports').upsert({
    id: 'latest',
    data,
    file_name: fileName,
    imported_at: new Date().toISOString(),
  });
}
