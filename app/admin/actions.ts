'use server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin';

export async function setShop(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '');
  const enabled = String(formData.get('enabled')) === 'true';
  if (!id) return;
  const { error } = await admin().from('profiles').update({ shop_enabled: enabled }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function setUserLock(formData: FormData) {
  const me = await requireAdmin();
  const id = String(formData.get('id') || '');
  const lock = String(formData.get('lock')) === 'true';
  if (!id || id === me.id) return;
  const { error } = await admin().auth.admin.updateUserById(id, { ban_duration: lock ? '876000h' : 'none' });
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function markOrder(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('id'));
  const status = String(formData.get('status'));
  if (!id || !['paid','cancelled'].includes(status)) return;
  const db = admin();
  const { data: order, error } = await db.from('orders').select('*').eq('id', id).single();
  if (error || !order) throw new Error(error?.message || 'Không tìm thấy đơn');
  await db.from('orders').update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null }).eq('id', id);
  if (status === 'paid' && order.feature === 'shop') await db.from('profiles').update({ shop_enabled: true }).eq('id', order.user_id);
  revalidatePath('/admin');
}
