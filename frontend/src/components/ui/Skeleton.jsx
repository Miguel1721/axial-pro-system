import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  animation = 'pulse',
  ...props
}) => {
  const { isDark } = useTheme();

  const baseClasses = `
    ${animation === 'pulse' ? 'animate-pulse' : 'animate-shimmer'}
    ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
    rounded
  `;

  const variants = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: '',
    card: 'rounded-xl',
    avatar: 'rounded-full'
  };

  const renderSkeleton = (index) => {
    const specificClasses = variants[variant] || variants.text;
    const styleProps = {
      ...(width && { width }),
      ...(height && { height }),
      ...props
    };

    return (
      <div
        key={index}
        className={`${baseClasses} ${specificClasses} ${className}`}
        style={styleProps}
        aria-hidden="true"
      />
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </>
  );
};

// Skeleton subcomponents for specific use cases
export const SkeletonText = ({ lines = 3, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '70%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '', ...props }) => {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export const SkeletonList = ({ items = 3, className = '', ...props }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard key={index} {...props} />
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 }
  };

  return (
    <Skeleton
      variant="avatar"
      {...sizes[size]}
      className={className}
    />
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width={120} height={32} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={100} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Skeleton variant="text" width="40%" className="mb-4" />
          <SkeletonList items={3} />
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Skeleton variant="text" width="40%" className="mb-4" />
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;