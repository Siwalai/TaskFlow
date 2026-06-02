/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import { Priority, TaskStatus } from "../types";
import { X, AlertCircle, Calendar, Plus, Tag, HelpCircle, FileText, Check, Search } from "lucide-react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  defaultProjectId,
  defaultStatus = "todo",
}: CreateTaskModalProps) {
  const { projects, users, createTask } = useTaskFlow();

  // State bindings
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>("todo");

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate defaults when opening
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setProjectId(defaultProjectId || projects[0]?.id || "");
      setAssigneeId("");
      setPriority("medium");
      setDueDate("");
      setLabels([]);
      setLabelsInput("");
      setStatus(defaultStatus);
      setAssigneeSearch("");
      setShowAssigneeSearch(false);
      setErrorMessage("");
    }
  }, [isOpen, defaultProjectId, defaultStatus, projects]);

  if (!isOpen) return null;

  // Formatting helper for rich text simulation
  const insertFormat = (tag: "bold" | "italic" | "code") => {
    const textarea = document.getElementById("task-desc-area") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (tag === "bold") {
      replacement = `**${selectedText || "bold text"}**`;
    } else if (tag === "italic") {
      replacement = `*${selectedText || "italic text"}*`;
    } else if (tag === "code") {
      replacement = `\`${selectedText || "inline code"}\``;
    }

    const newDescription = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newDescription);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      const offset = tag === "code" ? 1 : tag === "italic" ? 1 : 2;
      const textLength = selectedText.length || (tag === "code" ? 11 : tag === "italic" ? 11 : 9);
      textarea.setSelectionRange(start + offset, start + offset + textLength);
    }, 50);
  };

  // Keyboard escape handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const currentProject = projects.find((p) => p.id === projectId);

  // Filter candidates based on searchable query
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(assigneeSearch.toLowerCase().trim())
  );

  const handleAddLabel = () => {
    const trimmed = labelsInput.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelsInput("");
    }
  };

  const handleRemoveLabel = (lbl: string) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  // Check if chosen due date falls in past
  const isPastDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(dateStr);
    chosen.setHours(0, 0, 0, 0);
    return chosen < today;
  };

  const isTitleOverLimit = title.length > 120;
  const isTitleWarningRange = title.length > 80;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Task needs a title");
      return;
    }

    if (isTitleOverLimit) {
      setErrorMessage("Title is too long (120 max)");
      return;
    }

    if (!projectId) {
      setErrorMessage("Please select a project");
      return;
    }

    setIsSaving(true);
    try {
      const success = await createTask({
        title: title.trim(),
        description: description.trim() || null,
        projectId,
        assigneeId: assigneeId || null,
        priority,
        dueDate: dueDate || null,
        labels,
        status,
      });

      if (success) {
        onClose();
      } else {
        setErrorMessage("Couldn't save — check your connection.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedUser = users.find((u) => u.id === assigneeId);

  return (
    <div
      id="create-task-modal-overlay"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in focus:outline-none"
    >
      <div
        id="create-task-modal-panel"
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div id="create-task-modal-header" className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="font-semibold text-slate-800 text-base">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <form id="create-task-form" onSubmit={handleCreate} className="p-6 space-y-4 flex-1">
          {/* Project Dropdown selection */}
          <div id="form-field-project">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="task-project-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title input with character counter warning alerts */}
          <div id="form-field-title">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Task Title <span className="text-red-500">*</span>
              </label>
              <span
                id="task-title-counter"
                className={`text-[10px] font-bold ${
                  isTitleOverLimit ? "text-red-500 font-extrabold" : isTitleWarningRange ? "text-orange-500" : "text-slate-400"
                }`}
              >
                {title.length}/120
              </span>
            </div>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g., Set up SSL certificates"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-xs font-semibold p-2.5 border rounded-lg focus:ring-1 outline-none transition-all ${
                isTitleOverLimit
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : isTitleWarningRange
                  ? "border-orange-400 focus:border-orange-500 focus:ring-orange-500"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {isTitleOverLimit && (
              <p className="text-[10px] text-red-500 font-medium mt-1 inline-flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Title must check in below 120 characters limit.
              </p>
            )}
          </div>

          {/* Inline Selection controls - Status, Priority & Date */}
          <div id="form-fields-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div id="form-field-status">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div id="form-field-priority">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date with warning triggers */}
            <div id="form-field-due-date">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  id="task-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full text-xs font-medium border rounded-lg p-1.5 pr-8 bg-white outline-none focus:ring-1 transition-all ${
                    isPastDate(dueDate)
                      ? "border-orange-400 focus:border-orange-500 focus:ring-orange-500"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <Calendar className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {isPastDate(dueDate) && (
                <p className="text-[9px] text-orange-500 font-semibold mt-1 inline-flex items-center">
                  <AlertCircle className="w-2.5 h-2.5 mr-1" />
                  Due date is already past.
                </p>
              )}
            </div>
          </div>

          {/* Assignee custom searchable pickers */}
          <div id="form-field-assignee" className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assignee
            </label>
            <div
              id="assignee-picker-trigger"
              onClick={() => setShowAssigneeSearch(!showAssigneeSearch)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
            >
              {selectedUser ? (
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedUser.color }}
                  ></span>
                  <span className="font-semibold text-slate-800">{selectedUser.name}</span>
                  <span className="text-slate-400 text-[10px]">({selectedUser.role})</span>
                </div>
              ) : (
                <span className="text-slate-400">Claims unassigned</span>
              )}
              <span className="text-blue-600 text-[11px] font-semibold">Change</span>
            </div>

            {showAssigneeSearch && (
              <div id="assignee-select-panel" className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-2 max-h-56 overflow-y-auto animate-fade-in">
                {/* Search input filtering */}
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    id="assignee-search-input"
                    type="text"
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="Search members..."
                    className="w-full text-xs font-sans outline-none bg-transparent"
                  />
                </div>
                {/* Unassigned row */}
                <button
                  type="button"
                  onClick={() => {
                    setAssigneeId("");
                    setShowAssigneeSearch(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 text-left font-medium cursor-pointer"
                >
                  <span>Unassigned</span>
                  {assigneeId === "" && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                </button>
                {/* Candidates list */}
                {filteredUsers.map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => {
                      setAssigneeId(usr.id);
                      setShowAssigneeSearch(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-50 text-left font-medium cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase"
                        style={{ backgroundColor: usr.color }}
                      >
                        {usr.initials}
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold">{usr.name}</p>
                        <p className="text-[9px] text-slate-400">{usr.role}</p>
                      </div>
                    </div>
                    {assigneeId === usr.id && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="p-3 text-[10px] text-slate-400 text-center font-medium">No members found</p>
                )}
              </div>
            )}
          </div>

          {/* Description area with simulated markdown shortcut toolbars */}
          <div id="form-field-description">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </label>
              {/* Shortcut buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => insertFormat("bold")}
                  title="Make selection Bold (Ctrl+B)"
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 font-black text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-md select-none cursor-pointer"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("italic")}
                  title="Make selection Italic (Ctrl+I)"
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 italic font-mono text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-md select-none cursor-pointer"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat("code")}
                  title="Format Inline Code"
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 font-mono text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-md select-none cursor-pointer"
                >
                  &lt;/&gt;
                </button>
              </div>
            </div>
            <textarea
              id="task-desc-area"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a description, you can highlight parts or paste code snippets..."
              className="w-full text-xs font-sans p-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Label Multi-select tag entry tags row */}
          <div id="form-field-labels">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Labels / Tags
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  id="task-label-input"
                  type="text"
                  value={labelsInput}
                  onChange={(e) => setLabelsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  placeholder="e.g., design, design and layout, backend (Press Enter)"
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg pl-8 pr-16 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Tag className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="absolute right-1.5 top-1.5 px-2 py-0.5 text-[10px] font-bold bg-slate-150 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected labels chips list */}
            {labels.length > 0 && (
              <div id="task-selected-labels-shingle" className="flex flex-wrap gap-1.5 mt-2.5">
                {labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center bg-slate-100 hover:bg-slate-150 text-slate-700 text-[10px] pl-2 pr-1 py-0.5 rounded-full font-medium"
                  >
                    <span>{lbl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(lbl)}
                      className="ml-1 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-250 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {errorMessage && (
            <div id="create-task-modal-error-toast" className="p-3 bg-red-50 border border-red-150 text-red-600 text-xs rounded-lg flex items-start space-x-2 animate-pulse-once">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div id="create-modal-btn-row" className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-55 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isTitleOverLimit || !title.trim()}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer min-w-28 shadow-sm"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
