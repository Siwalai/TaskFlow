/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import { Search, X, Folder, CalendarClock, MessageSquare, CornerDownLeft, Terminal, Trash, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GlobalSearch() {
  const { isSearchOpen, setIsSearchOpen, tasks, projects, comments, users, setActiveTaskId } = useTaskFlow();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("tf_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, [isSearchOpen]);

  // Keyboard action short handlers (⌘K / Ctrl+K and arrow navigation)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // Add search query to recent searches log
  const pushToRecent = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const cleanTerm = searchTerm.trim();
    const updated = [cleanTerm, ...recentSearches.filter((t) => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("tf_recent_searches", JSON.stringify(updated));
  };

  const handleDeleteRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("tf_recent_searches", JSON.stringify(updated));
  };

  const isQueryValid = query.trim().length >= 2;

  // Filter computations
  const lowercaseQuery = query.toLowerCase().trim();

  const filteredProjects = isQueryValid
    ? projects.filter((p) => p.name.toLowerCase().includes(lowercaseQuery) || p.description.toLowerCase().includes(lowercaseQuery))
    : [];

  const filteredTasks = isQueryValid
    ? tasks.filter((t) => t.title.toLowerCase().includes(lowercaseQuery) || (t.description && t.description.toLowerCase().includes(lowercaseQuery)))
    : [];

  const filteredComments = isQueryValid
    ? comments.filter((c) => c.body.toLowerCase().includes(lowercaseQuery))
    : [];

  // Combine results to allow unified arrow keyboard navigation
  const flatResults: any[] = [];
  filteredProjects.forEach((p) => flatResults.push({ type: "project", item: p }));
  filteredTasks.forEach((t) => flatResults.push({ type: "task", item: t }));
  filteredComments.forEach((c) => flatResults.push({ type: "comment", item: c }));

  const handleResultClick = (res: any) => {
    pushToRecent(query);
    setIsSearchOpen(false);

    if (res.type === "project") {
      navigate(`/projects/${res.item.id}/board`);
    } else if (res.type === "task") {
      navigate(`/projects/${res.item.projectId}/board`);
      setActiveTaskId(res.item.id);
    } else if (res.type === "comment") {
      const parentTask = tasks.find((t) => t.id === res.item.taskId);
      if (parentTask) {
        navigate(`/projects/${parentTask.projectId}/board`);
        setActiveTaskId(parentTask.id);
      }
    }
  };

  const handleKeyDownResult = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % Math.max(1, flatResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleResultClick(flatResults[selectedIndex]);
      } else if (!isQueryValid && query.trim() !== "") {
        // Validation clause on Enter press
      }
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div
      id="global-search-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 select-none"
    >
      <div
        id="global-search-modal-panel"
        className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[70vh] animate-slide-in-down"
        onKeyDown={handleKeyDownResult}
      >
        {/* Input area */}
        <div className="flex items-center space-x-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            id="global-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, tasks, or comments... (Esc to Close)"
            className="w-full bg-transparent text-sm placeholder-slate-400 font-sans font-medium outline-none text-slate-900 border-none select-text"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content results list */}
        <div id="global-search-results-viewport" className="overflow-y-auto max-h-[50vh] p-4 space-y-4">
          {/* Empty search input displays recent searches */}
          {query.trim() === "" && (
            <div id="search-recent-panel" className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Searches</h4>
              {recentSearches.length > 0 ? (
                <div id="recent-search-row" className="divide-y divide-slate-100 border border-slate-200/60 rounded-lg overflow-hidden">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        setSelectedIndex(0);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                        <span>{term}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRecent(term, e)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-semibold text-xs py-1 leading-relaxed">No searches recorded yet</p>
              )}
            </div>
          )}

          {/* Search query validation warning */}
          {query.trim() !== "" && !isQueryValid && (
            <div id="search-length-warning" className="flex items-center space-x-2 text-orange-500 font-semibold text-xs py-2 bg-orange-50 border border-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Type at least 2 characters to search.</span>
            </div>
          )}

          {/* Categorized matching listings */}
          {isQueryValid && flatResults.length > 0 && (
            <div id="search-candidate-rows" className="space-y-3">
              {/* Projects Category */}
              {filteredProjects.length > 0 && (
                <div id="search-group-projects" className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</h4>
                  {filteredProjects.map((p) => {
                    const idx = flatResults.findIndex((item) => item.type === "project" && item.item.id === p.id);
                    const selected = idx === selectedIndex;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleResultClick({ type: "project", item: p })}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? "bg-blue-600/5 border-blue-400"
                            : "bg-white border-slate-100 hover:border-slate-350"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Folder
                            className="w-4.5 h-4.5 flex-shrink-0"
                            style={{ color: p.color }}
                          />
                          <span className="text-slate-800 truncate">{p.name}</span>
                        </div>
                        {selected && <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tasks Category */}
              {filteredTasks.length > 0 && (
                <div id="search-group-tasks" className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</h4>
                  {filteredTasks.map((t) => {
                    const idx = flatResults.findIndex((item) => item.type === "task" && item.item.id === t.id);
                    const selected = idx === selectedIndex;
                    const proj = projects.find((p) => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleResultClick({ type: "task", item: t })}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          selected
                            ? "bg-blue-600/5 border-blue-400 font-bold"
                            : "bg-white border-slate-100 hover:border-slate-350 font-semibold"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: proj?.color || "#94A3B8" }}
                          ></span>
                          <span className="text-slate-800 truncate">{t.title}</span>
                          <span className="text-[10px] text-slate-400 truncate opacity-80 font-normal">
                            ({proj?.name})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-[9px] font-bold uppercase py-0.5 px-1.5 text-slate-500 bg-slate-100 border border-slate-200 rounded-full">
                            {t.status.replace("_", " ")}
                          </span>
                          {selected && <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comments Category */}
              {filteredComments.length > 0 && (
                <div id="search-group-comments" className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comments</h4>
                  {filteredComments.map((c) => {
                    const idx = flatResults.findIndex((item) => item.type === "comment" && item.item.id === c.id);
                    const selected = idx === selectedIndex;
                    const author = users.find((u) => u.id === c.authorId);
                    const parentTask = tasks.find((t) => t.id === c.taskId);
                    const proj = parentTask ? projects.find((p) => p.id === parentTask.projectId) : null;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleResultClick({ type: "comment", item: c })}
                        className={`p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-start justify-between ${
                          selected
                            ? "bg-blue-600/5 border-blue-400 font-bold"
                            : "bg-white border-slate-100 hover:border-slate-350 font-semibold"
                        }`}
                      >
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] mb-1 font-normal select-none">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{author?.name} in &ldquo;{parentTask?.title}&rdquo;</span>
                          </div>
                          <p className="text-slate-700 italic truncate text-xs">&ldquo;{c.body}&rdquo;</p>
                        </div>
                        {selected && <CornerDownLeft className="w-3.5 h-3.5 text-blue-500 ml-2 mt-2 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No search results found */}
          {isQueryValid && flatResults.length === 0 && (
            <div id="search-no-results-panel" className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl">
              <Terminal className="w-7 h-7 mx-auto text-slate-350 mb-2" />
              <p className="text-xs text-slate-800 font-bold">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-[10px] text-slate-400 px-4 mt-1 leading-relaxed font-semibold">
                Try a different keyword or create a new task.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold bg-white border px-1 rounded">↑↓</span>
            <span>Navigate</span>
            <span className="font-extrabold bg-white border px-1 rounded ml-1.5">Enter</span>
            <span>Open</span>
          </div>
          <p className="font-medium text-slate-500">Shortcut: ⌘K to Toggle</p>
        </div>
      </div>
    </div>
  );
}
