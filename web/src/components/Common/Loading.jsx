export const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const container = fullScreen ? (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`${sizeMap[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full dark:border-gray-700 dark:border-t-blue-500"></div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizeMap[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full dark:border-gray-700 dark:border-t-blue-500"></div>
      </div>
    </div>
  );

  return container;
};

export default Loading;
