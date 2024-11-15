import { Suspense } from 'react';
import ProblemContent from './ProblemContent';

export default function ProblemPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const storyId = searchParams.id || null;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProblemContent storyId={storyId} />
    </Suspense>
  );
}
