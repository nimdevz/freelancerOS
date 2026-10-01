import ClientDetailView from './ClientDetailView';

export function generateStaticParams() {
  return [
    { id: '11111111-1111-1111-1111-111111111111' },
    { id: '33333333-3333-3333-3333-333333333333' },
    { id: '44444444-4444-4444-4444-444444444444' },
    { id: '55555555-5555-5555-5555-555555555555' },
    { id: 'default' },
  ];
}

export default function ClientDetailPage() {
  return <ClientDetailView />;
}
