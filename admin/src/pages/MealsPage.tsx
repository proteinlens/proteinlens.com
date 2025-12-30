// Meals Page - View all analyzed meal images
// Feature: 012-admin-dashboard
// Display all meal images with nutrition analysis details

import { useState } from 'react';
import { useAdminMeals, useAdminMealDetail } from '../hooks/useAdminMeals';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { format } from 'date-fns';
import { clsx } from 'clsx';

type Confidence = 'high' | 'medium' | 'low';
type SortBy = 'createdAt' | 'totalProtein' | 'confidence';
type SortOrder = 'asc' | 'desc';

// Confidence badge colors
const CONFIDENCE_CONFIG: Record<Confidence, { bg: string; text: string; icon: JSX.Element }> = {
  high: {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200',
    text: 'text-emerald-700',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  medium: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
    text: 'text-amber-700',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  low: {
    bg: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
    text: 'text-red-700',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function MealsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confidence, setConfidence] = useState<Confidence | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const limit = 12; // Show 12 meals per page (grid of 3x4)

  const { data, isLoading, error } = useAdminMeals({
    page,
    limit,
    search: search || undefined,
    confidence: confidence || undefined,
    sortBy,
    sortOrder,
  });

  const { data: mealDetail, isLoading: isLoadingDetail } = useAdminMealDetail(
    selectedMealId || undefined
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const resetFilters = () => {
    setSearch('');
    setConfidence('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            Analyzed Meals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View all meal images analyzed by users
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalMeals.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Meals</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageProtein.toFixed(1)}g</p>
                <p className="text-xs text-gray-500">Avg Protein/Meal</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.summary.confidenceBreakdown.high}</p>
                <p className="text-xs text-gray-500">High Confidence</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.confidenceBreakdown.medium + data.summary.confidenceBreakdown.low}
                </p>
                <p className="text-xs text-gray-500">Need Review</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by food name or notes..."
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Confidence Filter */}
            <div className="relative">
              <select
                value={confidence}
                onChange={(e) => {
                  setConfidence(e.target.value as Confidence | '');
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-gray-300 focus:border-admin-400 focus:ring-4 focus:ring-admin-500/10 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Confidence</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-gray-300 focus:border-admin-400 focus:ring-4 focus:ring-admin-500/10 focus:outline-none transition-all cursor-pointer"
              >
                <option value="createdAt">Date</option>
                <option value="totalProtein">Protein</option>
                <option value="confidence">Confidence</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              {sortOrder === 'desc' ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Newest
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Oldest
                </span>
              )}
            </button>

            {/* Reset */}
            {(search || confidence || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-admin-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-admin-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading meals...</p>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      {!isLoading && data?.meals && (
        <>
          {data.meals.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px] bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No meals found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealId(meal.id)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-admin-200 transition-all cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={meal.imageUrl}
                      alt={`Meal ${meal.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                      }}
                    />
                    {/* Confidence Badge */}
                    <div className={clsx(
                      'absolute top-2 right-2 px-2 py-1 rounded-lg border flex items-center gap-1 text-xs font-semibold',
                      CONFIDENCE_CONFIG[meal.confidence].bg,
                      CONFIDENCE_CONFIG[meal.confidence].text
                    )}>
                      {CONFIDENCE_CONFIG[meal.confidence].icon}
                      {meal.confidence}
                    </div>
                    {/* Protein Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-bold">
                      {meal.totalProtein.toFixed(1)}g protein
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {/* Foods list */}
                    <div className="space-y-1 mb-3">
                      {meal.foods.slice(0, 3).map((food) => (
                        <div key={food.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 truncate">{food.name}</span>
                          <span className="text-gray-500 ml-2 whitespace-nowrap">{food.protein}g</span>
                        </div>
                      ))}
                      {meal.foods.length > 3 && (
                        <p className="text-xs text-gray-400">+{meal.foods.length - 3} more items</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {format(new Date(meal.createdAt), 'MMM d, yyyy')}
                      </span>
                      {meal.userEmail && (
                        <span className="text-xs text-gray-400 truncate max-w-[120px]" title={meal.userEmail}>
                          {meal.userEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Meal Detail Modal */}
      {selectedMealId && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setSelectedMealId(null)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedMealId(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-96">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-admin-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-admin-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                </div>
              ) : mealDetail ? (
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-1/2 bg-gray-100">
                    <img
                      src={mealDetail.imageUrl}
                      alt={`Meal ${mealDetail.id}`}
                      className="w-full h-full object-contain max-h-[60vh] lg:max-h-[80vh]"
                    />
                  </div>

                  {/* Details */}
                  <div className="lg:w-1/2 p-6 overflow-y-auto max-h-[80vh]">
                    <div className="space-y-6">
                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={clsx(
                            'px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-sm font-semibold',
                            CONFIDENCE_CONFIG[mealDetail.confidence].bg,
                            CONFIDENCE_CONFIG[mealDetail.confidence].text
                          )}>
                            {CONFIDENCE_CONFIG[mealDetail.confidence].icon}
                            {mealDetail.confidence} confidence
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {mealDetail.totalProtein.toFixed(1)}g Total Protein
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(mealDetail.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
                        </p>
                      </div>

                      {/* Foods */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Detected Foods ({mealDetail.foods.length})
                        </h3>
                        <div className="space-y-2">
                          {mealDetail.foods.map((food) => (
                            <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div>
                                <p className="font-medium text-gray-900">{food.name}</p>
                                <p className="text-sm text-gray-500">{food.portion}</p>
                              </div>
                              <span className="text-lg font-bold text-admin-600">{food.protein}g</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User Info */}
                      {mealDetail.user && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            User Information
                          </h3>
                          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Email</span>
                              <span className="text-sm font-medium text-gray-900">{mealDetail.user.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Name</span>
                              <span className="text-sm font-medium text-gray-900">
                                {mealDetail.user.firstName || mealDetail.user.lastName 
                                  ? `${mealDetail.user.firstName || ''} ${mealDetail.user.lastName || ''}`.trim()
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Plan</span>
                              <span className={clsx(
                                'text-xs font-semibold px-2 py-0.5 rounded-full',
                                mealDetail.user.plan === 'PRO' 
                                  ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                              )}>
                                {mealDetail.user.plan}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          Technical Details
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Meal ID</span>
                            <span className="font-mono text-xs text-gray-600 truncate max-w-[200px]" title={mealDetail.id}>
                              {mealDetail.id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Request ID</span>
                            <span className="font-mono text-xs text-gray-600 truncate max-w-[200px]" title={mealDetail.requestId}>
                              {mealDetail.requestId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">AI Model</span>
                            <span className="text-gray-700">{mealDetail.aiModel}</span>
                          </div>
                          {mealDetail.blobHash && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Blob Hash</span>
                              <span className="font-mono text-xs text-gray-600 truncate max-w-[200px]" title={mealDetail.blobHash}>
                                {mealDetail.blobHash.substring(0, 16)}...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {mealDetail.notes && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            AI Notes
                          </h3>
                          <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-xl">{mealDetail.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
