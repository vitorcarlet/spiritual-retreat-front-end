import dynamic from 'next/dynamic';

import LoadingScreenCircular from '@/src/components/loading-screen/client/LoadingScreenCircular';

const RetreatOutBox = dynamic(() => import('@/src/components/OutBox'), {
  loading: () => <LoadingScreenCircular />,
});
export default async function Page() {
  return <RetreatOutBox />;
}
