import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Faltan las variables de Supabase en el archivo .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── AUTH ────────────────────────────────────────────────────

export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ─── PROFILES ────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// ─── WORKS ───────────────────────────────────────────────────

export const getWorks = async ({ cat, prov, search } = {}) => {
  let query = supabase
    .from('works')
    .select(`
      *,
      profiles:user_id ( name, avatar_url ),
      postulaciones ( id, user_id, price_offered, message, status, confirmed,
        profiles:user_id ( name, avatar_url ) )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (cat && cat !== 'Todos') query = query.eq('cat', cat);
  if (prov) query = query.eq('prov', prov);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  return { data, error };
};

export const getMyWorks = async (userId) => {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      postulaciones ( id, user_id, price_offered, message, status, confirmed,
        profiles:user_id ( name, avatar_url ) )
    `)
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createWork = async (workData) => {
  const { data, error } = await supabase
    .from('works')
    .insert(workData)
    .select()
    .single();
  return { data, error };
};

export const updateWork = async (workId, updates) => {
  const { data, error } = await supabase
    .from('works')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', workId)
    .select()
    .single();
  return { data, error };
};

// ─── SPECIALISTS ─────────────────────────────────────────────

export const getSpecialists = async ({ cat, prov, search } = {}) => {
  let query = supabase
    .from('specialists')
    .select(`
      *,
      specialist_jobs ( id, title, rating )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (cat && cat !== 'Todos') query = query.eq('cat', cat);
  if (prov) query = query.eq('prov', prov);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  return { data, error };
};

export const getMySpecialistProfile = async (userId) => {
  const { data, error } = await supabase
    .from('specialists')
    .select(`*, specialist_jobs ( id, title, rating )`)
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
};

export const createSpecialist = async (specData) => {
  const { data, error } = await supabase
    .from('specialists')
    .insert(specData)
    .select()
    .single();
  return { data, error };
};

// ─── POSTULACIONES ───────────────────────────────────────────

export const createPostulacion = async (postData) => {
  const { data, error } = await supabase
    .from('postulaciones')
    .insert(postData)
    .select()
    .single();
  return { data, error };
};

export const getMyPostulaciones = async (userId) => {
  const { data, error } = await supabase
    .from('postulaciones')
    .select(`
      *,
      works ( *, profiles:user_id ( name, avatar_url ) )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const confirmPostulacion = async (postId) => {
  const { data, error } = await supabase
    .from('postulaciones')
    .update({ confirmed: true, status: 'aceptada' })
    .eq('id', postId)
    .select()
    .single();
  return { data, error };
};

// ─── MESSAGES (CHAT) ─────────────────────────────────────────

export const getMessages = async (userId, otherId, workId) => {
  let query = supabase
    .from('messages')
    .select('*, sender:sender_id ( name, avatar_url )')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (workId) query = query.eq('work_id', workId);

  const { data, error } = await query;
  return { data, error };
};

export const sendMessage = async (senderId, receiverId, content, workId = null) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content, work_id: workId })
    .select()
    .single();
  return { data, error };
};

export const subscribeToMessages = (userId, otherId, callback) => {
  return supabase
    .channel(`chat-${[userId, otherId].sort().join('-')}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, payload => callback(payload.new))
    .subscribe();
};

// ─── STORAGE (fotos) ─────────────────────────────────────────

export const uploadPhoto = async (file, path) => {
  const { _data, error } = await supabase.storage
    .from('photos')
    .upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
  return { url: publicUrl, error: null };
};
// ─── LICITACIONES ─────────────────────────────────────────────
export const getLicitaciones = async () =>
  supabase.from("licitaciones").select("*, profiles(name, avatar_url)").order("created_at", { ascending: false });

export const getMyLicitaciones = async (userId) =>
  supabase.from("licitaciones").select("*").eq("user_id", userId).order("created_at", { ascending: false });

export const createLicitacion = async (data) =>
  supabase.from("licitaciones").insert([data]).select().single();

export const updateLicitacion = async (id, data) =>
  supabase.from("licitaciones").update(data).eq("id", id);

export const getPropuestas = async (licitacionId) =>
  supabase.from("propuestas").select("*, profiles(name, avatar_url)").eq("licitacion_id", licitacionId);

export const createPropuesta = async (data) =>
  supabase.from("propuestas").insert([data]).select().single();

export const adjudicarPropuesta = async (licitacionId, propuestaId, winnerId) => {
  await supabase.from("propuestas").update({ status: "rechazada" }).eq("licitacion_id", licitacionId);
  await supabase.from("propuestas").update({ status: "ganadora" }).eq("id", propuestaId);
  return supabase.from("licitaciones").update({ status: "adjudicada", winner_id: winnerId }).eq("id", licitacionId);
}
export const resetPassword = async (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://solumatch.com/reset-password',
  });
  export const createCalificacion = async (data) =>
  supabase.from("calificaciones").insert([data]).select().single();

export const getCalificaciones = async (userId) =>
  supabase.from("calificaciones").select("*, profiles(name, avatar_url)").eq("to_user_id", userId);