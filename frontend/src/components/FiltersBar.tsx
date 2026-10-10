import React from "react";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";
import { Priority, Status } from "../types";

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: Status | "ALL";
  onStatusFilterChange: (s: Status | "ALL") => void;
  priorityFilter: Priority | "ALL";
  onPriorityFilterChange: (p: Priority | "ALL") => void;
  sortBy: "date" | "company" | "priority";
  onSortByChange: (s: "date" | "company" | "priority") => void;
  totalFiltered: number;
  totalAll: number;
  onClearFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  totalFiltered,
  totalAll,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "ALL" || priorityFilter !== "ALL";

  return (
    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by company, role, tag, location..."
          className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 placeholder-gray-400 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as Status | "ALL")}
            className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Columns</option>
            <option value="WAITING">Applied / Waiting</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="APPROVED">Offer / Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
          <span className="text-gray-500 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as Priority | "ALL")}
            className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔥 High</option>
            <option value="MEDIUM">⚡ Medium</option>
            <option value="LOW">🌱 Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(e.target.value as "date" | "company" | "priority")
            }
            className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="date">Sort: Newest First</option>
            <option value="company">Sort: Company Name</option>
            <option value="priority">Sort: High Priority</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded-lg transition"
          >
            Clear Filters
          </button>
        )}

        {/* Count Badge */}
        <span className="text-xs text-gray-400 font-medium ml-1">
          Showing {totalFiltered} of {totalAll}
        </span>
      </div>
    </div>
  );
};
