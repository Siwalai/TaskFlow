/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTaskFlow } from "../context/TaskFlowContext";
import { TaskStatus, Priority, FilterState, Task } from "../types";
import FilterBar from "../components/FilterBar";
import PriorityBadge from "../components/PriorityBadge";
import AssigneeAvatar from "../components/AssigneeAvatar";
import {
  KanbanSquare,
  List,
  Plus,
  Calendar,
  MessageSquare,
  Undo,
  Sparkles,
  Info,
  CalendarDays,
  X,
  AlertTriangle,
} from "lucide-react";

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    projects,
    tasks,
    users,
    createTask,
    moveTask,
    updateTask,
    setActiveTaskId,
  } = useTaskFlow();

  const project = projects.find((p) => p.id === id);

  // View state: 'kanban' | 'list'
  const [viewType, setViewType] = useState<"kanban" | "list">("kanban");

  // Inline "add task" state per column
  const [inlineAddStatus, setInlineAddStatus] = useState<TaskStatus | null>(null);
  const [inlineTitleValue, setInlineTitleValue] = useState("");

  // Toast / Undo state
  const [toastMessage, setToastMessage] = useState("");
  const [undoAction, setUndoAction] = useState<{ taskId: string; oldStatus: TaskStatus } | null>(null);

  // Drag visual feedback columns
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Sorting columns in list view
  const [sortField, setSortField] = useState<"title" | "priority" | "dueDate" | "status">("dueDate");
  const [sortAsc, setSortAsc] = useState(true);

  // Sync route / view parameter
  useEffect(() => {
    if (window.location.hash.includes("/list")) {
      setViewType("list");
    } else {
      setViewType("kanban");
    }
  }, [window.location.hash]);

  // Read URL query parameters into filter states
  const getFiltersFromURL = (): FilterState => {
    const assignees = searchParams.get("assignee")?.split(",").filter(Boolean) || [];
    const priorities = (searchParams.get("priority")?.split(",").filter(Boolean) as Priority[]) || [];
    const statuses = (searchParams.get("status")?.split(",").filter(Boolean) as TaskStatus[]) || [];
    const search = searchParams.get("search") || "";

    return { assignees, priorities, statuses, search };
  };

  const handleFilterChange = (nextFilters: FilterState) => {
    const params: Record<string, string> = {};
    if (nextFilters.assignees.length > 0) params.assignee = nextFilters.assignees.join(",");
    if (nextFilters.priorities.length > 0) params.priority = nextFilters.priorities.join(",");
    if (nextFilters.statuses.length > 0) params.status = nextFilters.statuses.join(",");
    if (nextFilters.search) params.search = nextFilters.search;

    setSearchParams(params);
  };

  if (!project) {
    return (
      <div id="board-error" className="p-8 text-center select-none bg-slate-50 border border-slate-200 rounded-xl m-6">
        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Workspace Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This project does not exist or has been deleted.</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
        >
          View Workspace Directory
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const activeFilters = getFiltersFromURL();

  // Apply filters client-side
  const filteredTasks = projectTasks.filter((t) => {
    // 1. Assignees filter
    if (activeFilters.assignees.length > 0 && t.assigneeId) {
      if (!activeFilters.assignees.includes(t.assigneeId)) return false;
    } else if (activeFilters.assignees.length > 0 && !t.assigneeId) {
      return false; // Filtered but unassigned
    }

    // 2. Priority filter
    if (activeFilters.priorities.length > 0) {
      if (!activeFilters.priorities.includes(t.priority)) return false;
    }

    // 3. Status filter
    if (activeFilters.statuses.length > 0) {
      if (!activeFilters.statuses.includes(t.status)) return false;
    }

    // 4. Free-text search matching title/description/labels
    if (activeFilters.search.trim()) {
      const q = activeFilters.search.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchLabels = t.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLabels) return false;
    }

    return true;
  });

  // Toast notifier helper
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 5000); // 5s visible window
  };

  // HTML5 Native Drag Controls
  const handleDragStart = (e: React.DragEvent, taskId: string, oldStatus: TaskStatus) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setUndoAction({ taskId, oldStatus });

    // Custom ghost scaling visual feedback
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = "0.5";
    element.style.transform = "scale(1.02)";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = "1";
    element.style.transform = "none";
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(colStatus);
  };

  const handleDragDrop = (e: React.DragEvent, destStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData("text/plain");
    const dragged = tasks.find((t) => t.id === taskId);

    if (dragged && dragged.status !== destStatus) {
      moveTask(taskId, destStatus);
      showNotification(`Task moved to ${destStatus.replace("_", " ")}`);
    }
  };

  const handleUndoMove = () => {
    if (undoAction) {
      moveTask(undoAction.taskId, undoAction.oldStatus);
      setUndoAction(null);
      setToastMessage("");
      showNotification("Task move undone.");
    }
  };

  // Inline column add-task submission
  const handleInlineAddTaskSubmit = async (colStatus: TaskStatus) => {
    if (!inlineTitleValue.trim()) return;

    if (inlineTitleValue.length > 120) {
      alert("Title is too long (120 character max)");
      return;
    }

    setInlineAddStatus(null);
    setInlineTitleValue("");

    // Invoke state creator (optimistic display)
    await createTask({
      title: inlineTitleValue.trim(),
      description: null,
      projectId: project.id,
      assigneeId: null,
      priority: "medium",
      dueDate: null,
      labels: [],
      status: colStatus,
    });

    showNotification("Task created successfully");
  };

  // Check if chosen due date falls in past (overdue alert)
  const isDateOverdue = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return target < today;
  };

  // Format compact date display
  const getCompactDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const columns: { status: TaskStatus; label: string; bg: string; border: string }[] = [
    { status: "todo", label: "To Do", bg: "bg-white/20 backdrop-blur-md", border: "border-white/30" },
    { status: "in_progress", label: "In Progress", bg: "bg-white/20 backdrop-blur-md", border: "border-white/30" },
    { status: "review", label: "In Review", bg: "bg-white/20 backdrop-blur-md", border: "border-white/30" },
    { status: "done", label: "Completed", bg: "bg-emerald-50/10 backdrop-blur-md", border: "border-emerald-100/30" },
  ];

  // List View: Sorting logics
  const handleSort = (field: "title" | "priority" | "dueDate" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comp = 0;
    if (sortField === "title") {
      comp = a.title.localeCompare(b.title);
    } else if (sortField === "status") {
      comp = a.status.localeCompare(b.status);
    } else if (sortField === "priority") {
      const priorityWeights = { urgent: 3, high: 2, medium: 1, low: 0 };
      comp = priorityWeights[a.priority] - priorityWeights[b.priority];
    } else if (sortField === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      comp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return sortAsc ? comp : -comp;
  });

  return (
    <div id="board-view-viewport" className="flex flex-col h-full bg-transparent flex-1 overflow-hidden select-none">
      {/* Page Header toolbar */}
      <header id="board-header" className="bg-white/40 backdrop-blur-md px-6 py-4.5 border-b border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{project.name}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">{project.description || "Track your deliverables."}</p>
        </div>

        {/* View Layout Switcher (Kanban vs List Router anchors) */}
        <div id="board-layout-switcher" className="inline-flex bg-white/20 backdrop-blur-sm p-1 rounded-lg border border-white/40 self-start">
          <button
            id="switch-kanban-btn"
            onClick={() => {
              setViewType("kanban");
              navigate(`/projects/${project.id}/board`);
            }}
            className={`cursor-pointer inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              viewType === "kanban"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5 mr-1.5" />
            <span>Kanban Board</span>
          </button>
          <button
            id="switch-list-btn"
            onClick={() => {
              setViewType("list");
              navigate(`/projects/${project.id}/list`);
            }}
            className={`cursor-pointer inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              viewType === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5 mr-1.5" />
            <span>Table List</span>
          </button>
        </div>
      </header>

      {/* Sticky Filters toolbar */}
      <FilterBar
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        users={users}
        totalCount={projectTasks.length}
        filteredCount={filteredTasks.length}
      />

      {/* Content View Container */}
      <div id="board-panels-viewport" className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
        {/* Kanban Board Layout */}
        {viewType === "kanban" && (
          <div id="kanban-swimlanes" className="flex gap-4.5 h-full items-start pb-4">
            {columns.map((col) => {
              const columnTasks = sortedTasks.filter((t) => t.status === col.status);
              const isDraggingOverThis = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  id={`column-lane-${col.status}`}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDrop={(e) => handleDragDrop(e, col.status)}
                  className={`flex flex-col w-72 max-h-full rounded-xl border flex-shrink-0 transition-all ${col.bg} ${col.border} ${
                    isDraggingOverThis ? "border-blue-400 border-2 bg-blue-50/5" : ""
                  }`}
                >
                  {/* Column Header sticky */}
                  <div className="p-3.5 flex items-center justify-between border-b border-slate-205 select-none bg-white/70 backdrop-blur rounded-t-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 tracking-wide">{col.label}</span>
                      <span className="bg-slate-100 text-slate-550 border rounded-full px-2 py-0.5 text-[10px] font-bold">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      id={`column-add-btn-${col.status}`}
                      onClick={() => setInlineAddStatus(col.status)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks list scrollable */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[150px]">
                    {columnTasks.map((t) => {
                      const assigneeObj = users.find((u) => u.id === t.assigneeId);
                      const isOverdue = t.status !== "done" && isDateOverdue(t.dueDate);

                      return (
                        <div
                          key={t.id}
                          id={`task-card-item-${t.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id, t.status)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setActiveTaskId(t.id)}
                          className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:shadow-md p-3.5 cursor-grab active:cursor-grabbing transition-all scale-[1] hover:scale-[1.01] block space-y-3 relative group"
                        >
                          {/* Heading structure */}
                          <div>
                            <div className="flex items-center justify-between gap-2.5 mb-1.5 text-[10px] font-semibold text-slate-400">
                              <span className="truncate">#{t.id.toUpperCase()}</span>
                              <PriorityBadge level={t.priority} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                              {t.title}
                            </h4>
                          </div>

                          {/* Labels Chips Shingles */}
                          {t.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {t.labels.map((lbl) => (
                                <span
                                  key={lbl}
                                  className="text-[9px] font-semibold uppercase tracking-wide bg-slate-50 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5"
                                >
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer parameters */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-450 font-medium">
                            <div className="flex items-center space-x-2.5">
                              {/* Date chips check overdue red */}
                              {t.dueDate && (
                                <span
                                  className={`inline-flex items-center font-semibold rounded-md py-0.5 px-1.5 border ${
                                    isOverdue
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : "bg-slate-50 text-slate-500 border-slate-200"
                                  }`}
                                >
                                  <Calendar className="w-3" />
                                  <span className="ml-1 select-none">{getCompactDate(t.dueDate)}</span>
                                </span>
                              )}
                              {t.commentCount > 0 && (
                                <span className="inline-flex items-center text-slate-400">
                                  <MessageSquare className="w-3" />
                                  <span className="ml-0.5 select-none">{t.commentCount}</span>
                                </span>
                              )}
                            </div>

                            {/* Assignee Avatar tooltip helper */}
                            {assigneeObj ? (
                              <AssigneeAvatar
                                name={assigneeObj.name}
                                color={assigneeObj.color}
                                size="sm"
                                tooltipText={`${assigneeObj.name} (${assigneeObj.role})`}
                              />
                            ) : (
                              <span className="text-[9px] text-slate-400 inline-block py-0.5 font-normal">Unassigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 rounded-xl border border-dashed border-slate-300">
                        <Info className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                        <p className="text-[10px] text-slate-400 font-medium">Lanes claimed empty</p>
                      </div>
                    )}
                  </div>

                  {/* Column Footer: Inline addTask input */}
                  <div className="p-2 select-none border-t border-slate-205/40 rounded-b-xl bg-white/40">
                    {inlineAddStatus === col.status ? (
                      <div className="bg-white border rounded-xl p-3 shadow-md space-y-2.5 animate-fade-in relative z-10">
                        <input
                          id={`inline-input-${col.status}`}
                          type="text"
                          required
                          value={inlineTitleValue}
                          onChange={(e) => setInlineTitleValue(e.target.value)}
                          maxLength={121}
                          placeholder="What needs to be done? Press Enter"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineAddTaskSubmit(col.status);
                            if (e.key === "Escape") {
                              setInlineAddStatus(null);
                              setInlineTitleValue("");
                            }
                          }}
                          autoFocus
                          className="w-full text-xs font-semibold p-2 border border-blue-500 focus:ring-1 focus:ring-blue-550 rounded-lg outline-none bg-white"
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`${inlineTitleValue.length > 80 ? "text-orange-500 font-bold" : "text-slate-400"}`}>
                            {inlineTitleValue.length}/120
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setInlineAddStatus(null);
                                setInlineTitleValue("");
                              }}
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleInlineAddTaskSubmit(col.status)}
                              disabled={!inlineTitleValue.trim() || inlineTitleValue.length > 120}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`column-footer-trigger-${col.status}`}
                        onClick={() => setInlineAddStatus(col.status)}
                        className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View Layout Grid Table */}
        {viewType === "list" && (
          <div id="list-view-panel" className="bg-white/70 backdrop-blur-md rounded-xl border border-white/40 shadow-sm overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/40 text-slate-600 text-[10px] font-bold uppercase tracking-wider bg-white/40 select-none">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("title")}
                  >
                    Task Title {sortField === "title" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("status")}
                  >
                    Status {sortField === "status" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("priority")}
                  >
                    Priority {sortField === "priority" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 font-bold">Assignee</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort("dueDate")}
                  >
                    Due Date {sortField === "dueDate" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 font-bold">Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedTasks.map((t) => {
                  const assigneeObj = users.find((u) => u.id === t.assigneeId);
                  const isOverdue = t.status !== "done" && isDateOverdue(t.dueDate);

                  return (
                    <tr
                      key={t.id}
                      id={`list-row-item-${t.id}`}
                      onClick={() => setActiveTaskId(t.id)}
                      className="hover:bg-slate-50/50 cursor-pointer text-slate-700 transition-colors"
                    >
                      {/* Title */}
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-sm truncate">
                        {t.title}
                      </td>

                      {/* Status select dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-extrabold uppercase bg-slate-100 border text-slate-500 rounded-full px-2 py-0.5">
                          {t.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge level={t.priority} />
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {assigneeObj ? (
                          <div className="flex items-center space-x-2">
                            <AssigneeAvatar name={assigneeObj.name} color={assigneeObj.color} size="sm" />
                            <span className="font-semibold text-slate-700">{assigneeObj.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.dueDate ? (
                          <span
                            className={`inline-flex items-center font-semibold rounded-md py-0.5 px-1.5 border ${
                              isOverdue
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-slate-55 bg-slate-50 text-slate-450 text-slate-500 border-slate-200"
                            }`}
                          >
                            <CalendarDays className="w-3.5" />
                            <span className="ml-1">{new Date(t.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Labels */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.labels.map((lbl) => (
                            <span
                              key={lbl}
                              className="text-[9px] font-semibold bg-slate-100 border text-slate-650 text-slate-500 rounded-full px-2 py-0.5 truncate uppercase"
                            >
                              {lbl}
                            </span>
                          ))}
                          {t.labels.length === 0 && <span className="text-slate-400 font-normal">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 font-medium text-slate-400 bg-slate-50">
                      No tasks match current filtering criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over floating Toast with Undo Action trigger */}
      {toastMessage && (
        <div
          id="global-floating-toast"
          className="fixed bottom-18 md:bottom-6 right-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-xl rounded-xl p-3.5 flex items-center justify-between space-x-4 max-w-sm z-55 animate-slide-in-up"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>

          {undoAction && (
            <button
              onClick={handleUndoMove}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-750 p-1.5 px-2.5 rounded-lg border border-slate-705 cursor-pointer"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => setToastMessage("")}
            className="text-slate-500 hover:text-slate-350 p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
