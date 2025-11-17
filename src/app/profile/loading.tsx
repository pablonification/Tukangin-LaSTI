import { BaseCanvas } from '@/app/components/BaseCanvas';
import { BottomNav } from '@/app/components/BottomNav';

export default function Loading() {
  return (
    <BaseCanvas withBottomNav={true} centerContent={false} padding="px-6">
      <div className="animate-pulse flex flex-col gap-6 px-0 py-6">
        {/* Header skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded" />
        {/* Profile block skeleton */}
        <div className="flex items-center gap-5">
          <div className="h-21 w-21 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        {/* Info badge skeleton */}
        <div className="h-12 bg-gray-200 rounded-2xl" />
        {/* Settings skeleton items */}
        <div className="space-y-3">
          {[0,1].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-200 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        {/* Social icons skeleton */}
        <div className="flex items-center gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="h-13 w-13 bg-gray-200 rounded-full" />
          ))}
        </div>
        {/* Logout button skeleton */}
        <div className="h-12 bg-gray-200 rounded-2xl mt-4" />
      </div>
      <BottomNav active="profile" />
    </BaseCanvas>
  );
}


