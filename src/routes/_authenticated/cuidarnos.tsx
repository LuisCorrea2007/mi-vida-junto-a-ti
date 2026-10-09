import { createFileRoute } from '@tanstack/react-router';
import { CoupleCare } from '@/components/couple-care';
export const Route = createFileRoute('/_authenticated/cuidarnos')({
  head: () => ({ meta: [{ title: 'Cuidarnos mejor — Nuestro Espacio' }, { name: 'description', content: 'Nuestras necesidades, límites y formas de sentirnos queridos.' }, { property: 'og:title', content: 'Cuidarnos mejor — Nuestro Espacio' }, { property: 'og:description', content: 'Una guía íntima para entendernos y acompañarnos.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: () => <CoupleCare kind="care" />,
});