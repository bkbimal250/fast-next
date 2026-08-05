'use client';

import { FormEvent } from 'react';
import { FaSearch } from 'react-icons/fa';
import { JobCategory } from '@/lib/job';

type PublicJobMiniFiltersProps = {
  categories: JobCategory[];
  searchText: string;
  selectedCategory: string;
  onSearchTextChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export default function PublicJobMiniFilters({
  categories,
  searchText,
  selectedCategory,
  onSearchTextChange,
  onCategoryChange,
  onSubmit,
  onClear,
}: PublicJobMiniFiltersProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const hasValue = searchText.trim() || selectedCategory;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
        <label className="relative block">
          <span className="sr-only">Search jobs</span>
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search job title, skill, or keyword"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="sr-only">Job category</span>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">All job categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-11 rounded-lg bg-brand-700 px-5 text-sm font-bold text-white transition hover:bg-brand-800"
          >
            Search
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={onClear}
              className="h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
