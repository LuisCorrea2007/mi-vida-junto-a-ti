import { createFileRoute } from '@tanstack/react-router';
import { CoupleCare } from '@/components/couple-care';
export const Route = createFileRoute('/_authenticated/rituales')({
  head: () => ({ meta: [{ title: 'Nuestros rituales — Nuestro Espacio' }, { name: 'description', content: 'Los pequeños hábitos compartidos que nos acercan cada día.' }, { property: 'og:title', content: 'Nuestros rituales — Nuestro Espacio' }, { property: 'og:description', content: 'Momentos cotidianos elegidos por los dos.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: () => <CoupleCare kind="rituals" />,
});