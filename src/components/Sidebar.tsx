/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "./AssigneeAvatar";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  onOpenCreateTask: () => void;
}

export default function Sidebar({ onOpenCreateTask }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { projects, currentUser, setIsSearchOpen } = useTaskFlow();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const mainNavItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Team Members", path: "/team", icon: Users },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const checkActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        id="taskflow-sidebar"
        className={`hidden md:flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl text-slate-700 dark:text-slate-300 border-r border-white/40 dark:border-white/10 transition-all duration-300 relative select-none flex-shrink-0 ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        {/* Toggle Button */}
        <button
          id="sidebar-toggle-btn"
          className="absolute -right-3 top-6 bg-white/60 dark:bg-slate-800 hover:bg-white/80 dark:hover:bg-slate-700 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full p-1 shadow-md z-40 transition-colors cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Logo & Header */}
        <div id="sidebar-header" className="h-16 flex items-center px-4 border-b border-white/40 dark:border-white/10 overflow-hidden">
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-lg shadow-blue-200">
              TF
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                TaskFlow
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Search & Add Buttons */}
        <div id="sidebar-actions" className="p-3 border-b border-white/40 dark:border-white/10 space-y-2">
          {/* Global Search Button */}
          <button
            id="sidebar-search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center text-left text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/85 border border-white/40 dark:border-white/10 rounded-lg py-2 px-2.5 transition-all cursor-pointer group"
          >
            <Search className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Search tasks...</span>
                <kbd className="bg-white/60 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-450 px-1.5 py-0.5 rounded border border-white/50 dark:border-white/10">
                  ⌘K
                </kbd>
              </div>
            )}
          </button>

          {/* Quick Create Task */}
          <button
            id="sidebar-new-task-trigger"
            onClick={onOpenCreateTask}
            className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {!collapsed && <span>New Task</span>}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav id="sidebar-main-nav" className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = checkActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                id={`nav-item-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-l-[3px] border-blue-600 dark:border-blue-400 rounded-l-none pl-2.5 font-semibold"
                    : "hover:bg-white/50 dark:hover:bg-slate-800/40 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-450 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  } ${collapsed ? "" : "mr-3"}`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* pinned / active project lists section */}
          {!collapsed && projects.length > 0 && (
            <div id="sidebar-projects-section" className="pt-6 mt-4 border-t border-white/40 dark:border-white/10">
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                My Projects
              </span>
              <div id="sidebar-projects-list" className="mt-2 space-y-1">
                {projects.map((proj) => {
                  const projectPath = `/projects/${proj.id}/board`;
                  const isProjActive = currentPath.startsWith(`/projects/${proj.id}`);
                  return (
                    <Link
                      key={proj.id}
                      id={`nav-project-${proj.id}`}
                      to={projectPath}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isProjActive
                          ? "bg-white/60 dark:bg-slate-805/40 text-blue-700 dark:text-blue-400 font-semibold shadow-sm dark:shadow-none"
                          : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white py-1 px-1.5 flex duration-150"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0"
                        style={{ backgroundColor: proj.color }}
                      ></span>
                      <span className="truncate">{proj.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Account / Settings Quick link at bottom */}
        <div id="sidebar-footer" className="p-3 border-t border-white/40 dark:border-white/10 bg-white/20 dark:bg-slate-900/10">
          <div
            id="sidebar-user-block"
            onClick={() => navigate("/settings")}
            className="flex items-center transition-colors hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg p-1.5 cursor-pointer overflow-hidden group"
          >
            <AssigneeAvatar
              name={currentUser.name || "Aria Chen"}
              color={currentUser.color || "#2563EB"}
              size="md"
              tooltipText="My Settings"
            />
            {!collapsed && (
              <div className="ml-2.5 min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300 font-bold uppercase tracking-wider scale-[0.9] origin-left">
                  {currentUser.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Navigation (Screens ≤ 767px) */}
      <nav
        id="mobile-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border-t border-white/40 dark:border-white/10 flex items-center justify-around px-2 z-40 text-slate-500 dark:text-slate-400 select-none shadow-lg dark:shadow-none"
      >
        {mainNavItems.slice(0, 2).map((item) => {
          const isActive = checkActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              id={`mob-nav-${item.name.toLowerCase()}`}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${
                isActive ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 font-semibold" : "hover:text-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Elevated Plus Button in center for speed */}
        <button
          id="mob-nav-add-task"
          onClick={onOpenCreateTask}
          className="w-12 h-12 -translate-y-3 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6 flex-shrink-0" />
        </button>

        {mainNavItems.slice(2, 4).map((item) => {
          const isActive = checkActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              id={`mob-nav-${item.name.toLowerCase()}`}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${
                isActive ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 font-semibold" : "hover:text-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
