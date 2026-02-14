const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size];

  return (
    <div className="flex justify-center items-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner;
