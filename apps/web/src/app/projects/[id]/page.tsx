import ProjectDetailView from './ProjectDetailView';

export function generateStaticParams() {
  return [
    { id: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311' },
    { id: '027c41fa-8f90-4bac-989d-b5f80652ab0c' },
    { id: 'default' },
  ];
}

export default function ProjectDetailPage() {
  return <ProjectDetailView />;
}
