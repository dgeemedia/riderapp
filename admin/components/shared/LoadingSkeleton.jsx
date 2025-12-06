// admin/components/shared/LoadingSkeleton.jsx
import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
  const renderCardSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`glass-card rounded-lg sm:rounded-xl p-4 ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/3"></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-700 ml-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg bg-slate-800/30 ${className}`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-700"></div>
            <div className="ml-3 space-y-2 flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMapSkeleton = () => (
    <div className="h-full w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-primary rounded-full mx-auto mb-4 animate-pulse-subtle"></div>
          <p className="text-sm text-slate-400">Loading map...</p>
        </div>
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="glass-card rounded-lg sm:rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-20"></div>
              <div className="h-8 bg-slate-700 rounded w-12"></div>
              <div className="h-3 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-700"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="overflow-hidden">
      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex items-center p-3 bg-slate-800/50 rounded-t-lg">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: count }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center p-3 border-b border-slate-700/30">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-700"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  // Select skeleton type
  switch (type) {
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'map':
      return renderMapSkeleton();
    case 'stats':
      return renderStatsSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'spinner':
      return renderSpinner();
    default:
      return renderCardSkeleton();
  }
}

// Individual skeleton components for more control
export const CardSkeleton = ({ count = 1, className = '' }) => 
  <LoadingSkeleton type="card" count={count} className={className} />;

export const ListSkeleton = ({ count = 5, className = '' }) => 
  <LoadingSkeleton type="list" count={count} className={className} />;

export const MapSkeleton = () => 
  <LoadingSkeleton type="map" />;

export const StatsSkeleton = ({ count = 4 }) => 
  <LoadingSkeleton type="stats" count={count} />;

export const TableSkeleton = ({ rows = 5 }) => 
  <LoadingSkeleton type="table" count={rows} />;

export const Spinner = () => 
  <LoadingSkeleton type="spinner" />;