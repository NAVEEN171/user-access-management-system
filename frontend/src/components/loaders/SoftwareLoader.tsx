const SkeletonLoader = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between animate-pulse">
      <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto mb-4 sm:mb-0">
        <div className="bg-gray-200 p-2 rounded-lg mr-3 sm:mr-6">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40"></div>
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-48 sm:w-64"></div>
        </div>
      </div>
      <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
        <div className="h-9 sm:h-10 bg-gray-200 rounded-md w-16 sm:w-20"></div>
        <div className="h-9 sm:h-10 bg-gray-200 rounded-md w-28 sm:w-36"></div>
      </div>
    </div>
  );
};

const SoftwareCardLoader = () => {
  return (
    <div className="  p-4 space-y-4">
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonLoader key={index} />
      ))}
    </div>
  );
};

export default SoftwareCardLoader;
