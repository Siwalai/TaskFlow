/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { FilterState, Priority, TaskStatus, User } from "../types";
import { Search, ChevronDown, Check, X, Filter } from "lucide-react";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  users: User[];
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({
  filters,
  onFilterChange,
  users,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<"assignee" | "priority" | "status" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = (type: "assignee" | "priority" | "status") => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const handleSelectAssignee = (usrId: string) => {
    const isSelected = filters.assignees.includes(usrId);
    const nextAssignees = isSelected
      ? filters.assignees.filter((id) => id !== usrId)
      : [...filters.assignees, usrId];
    onFilterChange({ ...filters, assignees: nextAssignees });
  };

  const handleSelectPriority = (lvl: Priority) => {
    const isSelected = filters.priorities.includes(lvl);
    const nextPriorities = isSelected
      ? filters.priorities.filter((l) => l !== lvl)
      : [...filters.priorities, lvl];
    onFilterChange({ ...filters, priorities: nextPriorities });
  };

  const handleSelectStatus = (stat: TaskStatus) => {
    const isSelected = filters.statuses.includes(stat);
    const nextStatuses = isSelected
      ? filters.statuses.filter((s) => s !== stat)
      : [...filters.statuses, stat];
    onFilterChange({ ...filters, statuses: nextStatuses });
  };

  const handleClearAll = () => {
    onFilterChange({
      assignees: [],
      priorities: [],
      statuses: [],
      search: "",
    });
  };

  const removeAssigneeChip = (usrId: string) => {
    onFilterChange({
      ...filters,
      assignees: filters.assignees.filter((id) => id !== usrId),
    });
  };

  const removePriorityChip = (lvl: Priority) => {
    onFilterChange({
      ...filters,
      priorities: filters.priorities.filter((l) => l !== lvl),
    });
  };

  const removeStatusChip = (stat: TaskStatus) => {
    onFilterChange({
      ...filters,
      statuses: filters.statuses.filter((s) => s !== stat),
    });
  };

  const priorityLevels: Priority[] = ["urgent", "high", "medium", "low"];
  const statusLevels: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
  ];

  const hasActiveFilters =
    filters.assignees.length > 0 ||
    filters.priorities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.search.length > 0;

  return (
    <div id="filter-bar-container" className="bg-white border-b border-slate-200 py-3 px-6 select-none" ref={containerRef}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Filter Dropdowns */}
        <div id="filter-dropdowns" className="flex flex-wrap items-center gap-2">
          <div className="flex items-center text-slate-400 mr-2">
            <Filter className="w-4 h-4 mr-1 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500-custom">Filters</span>
          </div>

          {/* Dropdown: Assignee */}
          <div className="relative inline-block">
            <button
              id="filter-dropdown-assignee"
              onClick={() => toggleDropdown("assignee")}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filters.assignees.length > 0
                  ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-slate-300 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span>Assignee</span>
              {filters.assignees.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {filters.assignees.length}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDropdown === "assignee" && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5 max-h-60 overflow-y-auto">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Assignees
                </p>
                {users.map((usr) => {
                  const selected = filters.assignees.includes(usr.id);
                  return (
                    <button
                      key={usr.id}
                      onClick={() => handleSelectAssignee(usr.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: usr.color }}
                        ></div>
                        <span>{usr.name}</span>
                      </div>
                      {selected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dropdown: Status */}
          <div className="relative inline-block">
            <button
              id="filter-dropdown-status"
              onClick={() => toggleDropdown("status")}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filters.statuses.length > 0
                  ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-slate-300 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {filters.statuses.length}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDropdown === "status" && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Statuses
                </p>
                {statusLevels.map((stat) => {
                  const selected = filters.statuses.includes(stat.value);
                  return (
                    <button
                      key={stat.value}
                      onClick={() => handleSelectStatus(stat.value)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <span>{stat.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dropdown: Priority */}
          <div className="relative inline-block">
            <button
              id="filter-dropdown-priority"
              onClick={() => toggleDropdown("priority")}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filters.priorities.length > 0
                  ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-slate-300 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span>Priority</span>
              {filters.priorities.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                  {filters.priorities.length}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDropdown === "priority" && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1.5">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Priorities
                </p>
                {priorityLevels.map((lvl) => {
                  const selected = filters.priorities.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      onClick={() => handleSelectPriority(lvl)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <span className="capitalize">{lvl}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Result Count display */}
          <span id="filter-result-count" className="text-xs text-slate-500 font-medium ml-2">
            Showing {filteredCount} of {totalCount} tasks
          </span>
        </div>

        {/* Right Side: Text Search */}
        <div id="filter-search-input-wrapper" className="relative w-full md:w-64">
          <input
            id="filter-search-input"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by keywords..."
            className="w-full h-9 pl-9 pr-8 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-xs font-sans placeholder-slate-400 outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-2.5 hover:text-slate-600 text-slate-400 flex items-center justify-center p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* active filter chips row */}
      {hasActiveFilters && (
        <div id="active-filter-chips-row" className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase mr-1">Active:</span>

          {/* Search Query Chip */}
          {filters.search && (
            <span className="inline-flex items-center bg-blue-50/70 border border-blue-100 text-blue-700 rounded-full py-0.5 pl-2.5 pr-1.5 text-[10px] font-medium">
              Keyword: &quot;{filters.search}&quot;
              <button
                onClick={() => onFilterChange({ ...filters, search: "" })}
                className="ml-1 text-blue-400 hover:text-blue-700 rounded-full hover:bg-blue-100 cursor-pointer p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Assignee Chips */}
          {filters.assignees.map((id) => {
            const usr = users.find((u) => u.id === id);
            if (!usr) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center bg-slate-55 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full py-0.5 pl-2.5 pr-1.5 text-[10px] font-medium"
              >
                Assignee: {usr.name}
                <button
                  onClick={() => removeAssigneeChip(id)}
                  className="ml-1 text-indigo-400 hover:text-indigo-700 rounded-full hover:bg-indigo-100 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Status Chips */}
          {filters.statuses.map((stat) => {
            const statusLabel = statusLevels.find((s) => s.value === stat)?.label || stat;
            return (
              <span
                key={stat}
                className="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full py-0.5 pl-2.5 pr-1.5 text-[10px] font-medium"
              >
                Status: {statusLabel}
                <button
                  onClick={() => removeStatusChip(stat)}
                  className="ml-1 text-emerald-400 hover:text-emerald-700 rounded-full hover:bg-emerald-100 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Priority Chips */}
          {filters.priorities.map((lvl) => {
            return (
              <span
                key={lvl}
                className="inline-flex items-center bg-amber-50 border border-amber-100 text-amber-700 rounded-full py-0.5 pl-2.5 pr-1.5 text-[10px] font-medium"
              >
                Priority: <span className="capitalize ml-1">{lvl}</span>
                <button
                  onClick={() => removePriorityChip(lvl)}
                  className="ml-1 text-amber-400 hover:text-amber-700 rounded-full hover:bg-amber-100 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Clear All CTA */}
          <button
            id="clear-all-filters-btn"
            onClick={handleClearAll}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-0.5 cursor-pointer ml-1"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
