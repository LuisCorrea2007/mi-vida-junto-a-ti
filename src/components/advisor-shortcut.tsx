import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircleHeart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function AdvisorShortcut({ subject }: { subject: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  async function open() {
    if (!user || pending) return;
    setPending(true);
    const { data, error } = await supabase.from('advisor_threads').insert({ user_id: user.id, title: `Ideas para ${subject}` }).select('id').single();
    setPending(false);
    if (error || !data) { toast.error('No pudimos abrir la charla.'); return; }
    void navigate({ to: '/consejero/$id', params: { id: data.id }, search: { inicio: `Quiero mejorar ${subject} en nuestra relación. Pregúntame por nuestros gustos y necesidades antes de proponer algo concreto, sin suponer cosas sobre nosotros.` } });
  }
  return <Button variant="outline" size="sm" disabled={pending} onClick={open}><MessageCircleHeart className="size-4" /> Pensarlo con el Consejero</Button>;
}