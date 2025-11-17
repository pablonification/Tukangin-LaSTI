const Loading = () => {
  return (
    <div className="p-5 space-y-4">
      <div className="h-28 bg-gray-200 animate-pulse rounded-xl" />
      <div className="h-12 bg-gray-200 animate-pulse rounded-xl" />
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-16 w-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 w-14 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;


