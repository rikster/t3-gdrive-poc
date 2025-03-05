'use client';

interface LoadingSpinnerProps {
  containerClassName?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  containerClassName = "", 
  spinnerSize = 'md',
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinnerSizeClasses = {
    sm: 'h-4 w-4 border-b-1',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-b-3',
  };

  const baseContainerClass = fullScreen 
    ? "h-screen flex items-center justify-center bg-white dark:bg-gray-950" 
    : "flex items-center justify-center";
  
  const containerClass = `${baseContainerClass} ${containerClassName}`;

  return (
    <div className={containerClass}>
      <div className={`animate-spin rounded-full ${spinnerSizeClasses[spinnerSize]} border-gray-900 dark:border-gray-100`}></div>
    </div>
  );
}
