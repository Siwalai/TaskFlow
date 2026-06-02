/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "./AssigneeAvatar";
import { ChevronDown, Check, Users, Sun, Moon } from "lucide-react";

export default function UserSwitcher() {
  const { users, currentUser, switchUser, theme, toggleTheme } = useTaskFlow();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="global-header-controls"
      className="fixed top-3.5 right-4 md:right-6 z-50 select-none animate-fade-in flex items-center space-x-2.5 font-sans"
    >
      {/* Dynamic Light/Dark Mode Toggle Button */}
      <button
        id="theme-toggle-btn"
        onClick={toggleTheme}
        className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-800 border border-white/50 dark:border-white/10 hover:border-white/80 dark:hover:border-white/20 transition-all duration-200 shadow-sm shadow-slate-100 dark:shadow-none cursor-pointer"
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4 text-slate-600" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400" />
        )}
      </button>

      {/* User Dropdown Group */}
      <div className="relative">
        {/* Current Active User Trigger */}
        <button
          id="user-switcher-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-800 border border-white/50 dark:border-white/10 hover:border-white/80 dark:hover:border-white/20 rounded-full pl-1.5 pr-2.5 py-1 cursor-pointer transition-all duration-200 shadow-sm shadow-slate-100 dark:shadow-none text-xs"
        >
          <AssigneeAvatar
            name={currentUser?.name || "Aria Chen"}
            color={currentUser?.color || "#2563EB"}
            avatarUrl={currentUser?.avatarUrl}
            size="sm"
          />
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-slate-800 dark:text-slate-105 leading-none">{currentUser?.name || "Aria Chen"}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-400 font-medium">{currentUser?.role || "Team Lead"}</p>
          </div>
          <ChevronDown
            id="user-switcher-chevron"
            className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Floating Dropdown Menu */}
        {isOpen && (
          <div
            id="user-switcher-dropdown"
            className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none p-2.5 space-y-1 z-50 origin-top-right transform transition-all animate-fade-in duration-150"
          >
            <div id="user-switcher-header" className="px-2 py-1.5 flex items-center space-x-1.5 border-b border-white/30 dark:border-white/10 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
              <span>Select Workspace Role</span>
            </div>

            <div id="user-switcher-list" className="pt-1.5 space-y-1">
              {users.map((u) => {
                const isSelected = u.id === currentUser?.id;
                return (
                  <button
                    key={u.id}
                    id={`user-select-row-${u.id}`}
                    onClick={() => {
                      switchUser(u.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/40 border border-white/40 dark:border-white/10"
                        : "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <AssigneeAvatar
                        name={u.name}
                        color={u.color}
                        avatarUrl={u.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0 font-sans">
                        <p className={`text-xs truncate ${isSelected ? "font-bold text-blue-700 dark:text-blue-400" : "font-medium text-slate-700 dark:text-slate-305"}`}>
                          {u.name}
                        </p>
                        <p className={`text-[9px] truncate ${isSelected ? "text-blue-500 dark:text-blue-505" : "text-slate-400 dark:text-slate-500"}`}>
                          {u.role}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check id={`user-check-icon-${u.id}`} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
