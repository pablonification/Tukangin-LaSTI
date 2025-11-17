const Loading = () => {
  return (
    <div className="p-5 space-y-4">
      <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
      <div className="h-10 bg-gray-200 animate-pulse rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 animate-pulse rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
};

export default Loading;


