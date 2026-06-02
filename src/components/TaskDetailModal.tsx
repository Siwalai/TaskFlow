/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import { Priority, TaskStatus, Comment } from "../types";
import {
  X,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
  CalendarClock,
  Send,
  Plus,
  ArrowRight,
  RefreshCw,
  Clipboard,
  History,
  MessageSquare,
} from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import AssigneeAvatar from "./AssigneeAvatar";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const {
    tasks,
    projects,
    users,
    comments,
    activity,
    currentUser,
    updateTask,
    deleteTask,
    addComment,
    deleteComment,
  } = useTaskFlow();

  const task = tasks.find((t) => t.id === taskId);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // New Comment input states
  const [commentText, setCommentText] = useState("");
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);

  // Label entry state
  const [newLabel, setNewLabel] = useState("");

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const mentionPanelRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Sync state variables with active task structure
  useEffect(() => {
    if (task) {
      setTitleInput(task.title);
      setDescInput(task.description || "");
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setCommentText("");
      setShowMentionPicker(false);
    }
  }, [task]);

  if (!task || !project) return null;

  // Relative Date Formatter
  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return "yesterday";
    // Standard compact fallback
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Inline format processors for markdown-lite tags
  const renderMarkdownLite = (text: string) => {
    // Escape standard HTML first to prevent XSS injection
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace bold tags: **text** -> <strong>text</strong>
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');

    // Replace italic tags: *text* -> <em>text</em>
    safe = safe.replace(/\*(.*?)\*/g, '<em class="italic text-slate-850">$1</em>');

    // Replace code blocks: `code` -> <code class="font-mono bg-slate-100 text-slate-800 rounded px-1 text-xs">code</code>
    safe = safe.replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-slate-100 border border-slate-200 text-slate-700 px-1 py-0.5 rounded">$1</code>');

    // Highlight mentions dynamically
    users.forEach((u) => {
      const token = `@${u.name}`;
      const searchRegex = new RegExp(token, "g");
      safe = safe.replace(
        searchRegex,
        `<span class="text-blue-600 font-bold inline-flex items-center hover:underline cursor-pointer">@${u.name}</span>`
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: safe }} />;
  };

  // Handles inline title changes
  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== task.title) {
      if (titleInput.length <= 120) {
        updateTask(task.id, { title: titleInput.trim() });
      }
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    updateTask(task.id, { description: descInput.trim() || null });
    setIsEditingDesc(false);
  };

  // Handles comment typing and mention triggers
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);

    const selectionIndex = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, selectionIndex);
    const lastAtOffset = textBeforeCursor.lastIndexOf("@");

    if (lastAtOffset !== -1) {
      const query = textBeforeCursor.substring(lastAtOffset + 1);
      // Ensure no whitespace is within the token
      if (!query.includes(" ")) {
        setShowMentionPicker(true);
        setMentionQuery(query);
        setMentionStartIndex(lastAtOffset);
        return;
      }
    }

    setShowMentionPicker(false);
  };

  const selectMention = (usr: any) => {
    const text = commentText;
    const beforeAt = text.substring(0, mentionStartIndex);
    const afterCursor = text.substring(commentInputRef.current?.selectionStart || 0);

    const nextCommentText = `${beforeAt}@${usr.name} ${afterCursor}`;
    setCommentText(nextCommentText);
    setShowMentionPicker(false);

    // Refocus text area
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
        const nextPromptCursorOffset = beforeAt.length + usr.name.length + 2;
        commentInputRef.current.setSelectionRange(nextPromptCursorOffset, nextPromptCursorOffset);
      }
    }, 50);
  };

  // Submits a user comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Scan for mentions
    const mentionsFound: string[] = [];
    users.forEach((u) => {
      if (commentText.includes(`@${u.name}`)) {
        mentionsFound.push(u.id);
      }
    });

    addComment(task.id, commentText.trim(), mentionsFound);
    setCommentText("");
  };

  // Dropdown edits for status, assignee, priority
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTask(task.id, { status: e.target.value as TaskStatus });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateTask(task.id, { assigneeId: value || null });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTask(task.id, { priority: e.target.value as Priority });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTask(task.id, { dueDate: e.target.value || null });
  };

  // Add individual label
  const handleAddLabelLocal = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLabel.trim()) {
      e.preventDefault();
      const trimmed = newLabel.trim().toLowerCase();
      if (!task.labels.includes(trimmed)) {
        updateTask(task.id, { labels: [...task.labels, trimmed] });
      }
      setNewLabel("");
    }
  };

  const handleRemoveLabelLocal = (lbl: string) => {
    updateTask(task.id, { labels: task.labels.filter((l) => l !== lbl) });
  };

  // Fetch comments matching taskId
  const taskComments = comments.filter((c) => c.taskId === task.id);

  // Fetch log history actions matching taskId
  const taskLogs = activity
    .filter((act) => act.taskId === task.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter list of selectable users for comments mentions matching typed search query
  const mentionCandidates = users.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div
      id="task-detail-overlay-wrapper"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in"
      onClick={onClose}
    >
      {/* Drawer Panel Sliding container */}
      <div
        id="task-detail-side-panel"
        className="bg-slate-50 w-full max-w-full md:max-w-[520px] h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Bar / Toolbar */}
        <div id="detail-modal-navbar" className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center space-x-2">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            ></span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 truncate">
              {project.name}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              id="detail-delete-task-btn"
              onClick={() => {
                if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                  deleteTask(task.id);
                  onClose();
                }
              }}
              title="Delete Task"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div id="detail-scroller" className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Title Section with Inline Edit */}
          <div id="detail-section-title">
            {isEditingTitle ? (
              <div className="space-y-1.5">
                <input
                  id="detail-title-inline-input"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  maxLength={121}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setTitleInput(task.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-full text-lg font-bold font-sans p-2 border border-blue-500 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  Press Enter to Save, Esc to Cancel (Title limit is max 120 char).
                </span>
              </div>
            ) : (
              <h2
                id="detail-title-heading"
                onClick={() => {
                  setTitleInput(task.title);
                  setIsEditingTitle(true);
                }}
                className="text-lg font-bold text-slate-900 leading-snug cursor-pointer hover:bg-slate-200/50 hover:text-blue-600 py-1.5 px-2 rounded-lg transition-colors"
                title="Click to edit title inline"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Quick Stats Grid Selector Widgets */}
          <div id="detail-stats-card" className="bg-white rounded-xl border border-slate-200 p-4.5 grid grid-cols-2 gap-y-4 gap-x-2">
            {/* Status Dropdown */}
            <div id="stat-widget-status">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </span>
              <select
                id="detail-widget-status-select"
                value={task.status}
                onChange={handleStatusChange}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2.5 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Indicator */}
            <div id="stat-widget-priority">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Priority
              </span>
              <select
                id="detail-widget-priority-select"
                value={task.priority}
                onChange={handlePriorityChange}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2.5 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Selection */}
            <div id="stat-widget-assignee">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assignee
              </span>
              <select
                id="detail-widget-assignee-select"
                value={task.assigneeId || ""}
                onChange={handleAssigneeChange}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2.5 max-w-[150px] outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map((usr) => (
                  <option key={usr.id} value={usr.id}>
                    {usr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date widget */}
            <div id="stat-widget-due-date">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Due Date
              </span>
              <input
                id="detail-widget-date-input"
                type="date"
                value={task.dueDate || ""}
                onChange={handleDateChange}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg py-0.5 px-2 outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Description Block */}
          <div id="detail-section-description" className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
            {isEditingDesc ? (
              <div className="space-y-2 bg-white p-2 border border-slate-200 rounded-lg">
                <textarea
                  id="detail-desc-inline-area"
                  rows={4}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Insert some details..."
                  className="w-full text-xs font-sans outline-none resize-y text-slate-800"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setDescInput(task.description || "");
                      setIsEditingDesc(false);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-500 rounded-md cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="bg-white rounded-xl border border-slate-200 p-4 min-h-[80px] text-xs leading-relaxed text-slate-700 hover:border-slate-300 cursor-pointer transition-colors"
                title="Click to edit description"
              >
                {task.description ? (
                  <p className="whitespace-pre-line">{task.description}</p>
                ) : (
                  <span className="text-slate-400 font-medium">Add task description ...</span>
                )}
              </div>
            )}
          </div>

          {/* Labels List Shingle */}
          <div id="detail-section-labels" className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Labels</h4>
            <div className="flex flex-wrap items-center gap-1.5">
              {task.labels.map((lbl) => (
                <span
                  key={lbl}
                  className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center border border-slate-200"
                >
                  <span>{lbl}</span>
                  <button
                    onClick={() => handleRemoveLabelLocal(lbl)}
                    aria-label={`Remove label ${lbl}`}
                    className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <div className="relative inline-block">
                <input
                  id="detail-label-inline-input"
                  type="text"
                  placeholder="+ Label..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={handleAddLabelLocal}
                  className="bg-white hover:bg-slate-100 border border-slate-300 rounded-full text-[10px] font-medium px-2 py-0.5 w-20 outline-none focus:w-28 focus:border-blue-500 focus:bg-white transition-all text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* History System Audit logs timeline */}
          <div id="detail-section-history" className="space-y-3">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-200/50">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity timeline</h4>
            </div>
            <div id="detail-history-feed" className="space-y-3 text-[11px] max-h-32 overflow-y-auto pl-1 text-slate-500">
              {taskLogs.map((log) => {
                const triggerActor = users.find((u) => u.id === log.userId) || currentUser;
                return (
                  <div key={log.id} className="flex items-start space-x-2 leading-tight">
                    <span
                      className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center uppercase flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: triggerActor.color }}
                    >
                      {triggerActor.initials}
                    </span>
                    <p className="flex-1">
                      <strong className="text-slate-700 font-semibold">{triggerActor.name}</strong>{" "}
                      <span>{log.action}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                        ({getRelativeTime(log.timestamp)})
                      </span>
                    </p>
                  </div>
                );
              })}
              {taskLogs.length === 0 && (
                <p className="text-slate-400 font-medium">No actions captured</p>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div id="detail-section-comments" className="space-y-4">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-200/50">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Comments ({taskComments.length})
              </h4>
            </div>

            {/* List block */}
            <div id="detail-comments-list" className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {taskComments.map((comment) => {
                const commentActor = users.find((u) => u.id === comment.authorId);
                if (!commentActor) return null;
                const isMyComment = commentActor.id === currentUser.id;

                return (
                  <div
                    key={comment.id}
                    id={`comment-item-${comment.id}`}
                    className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-100 hover:shadow-sm transition-all group relative"
                  >
                    {/* User profile identifier */}
                    <AssigneeAvatar name={commentActor.name} color={commentActor.color} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-700">{commentActor.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>

                        {/* Allowed Delete action on hover */}
                        {isMyComment && (
                          <button
                            id={`delete-comment-${comment.id}`}
                            onClick={() => {
                              if (confirm("Delete your comment permanently?")) {
                                deleteComment(comment.id);
                              }
                            }}
                            className="text-slate-350 hover:text-red-500 scale-90 group-hover:block hidden p-0.5 rounded cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {/* Body Markdown Lite parsed text */}
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                        {renderMarkdownLite(comment.body)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {taskComments.length === 0 && (
                <div className="text-center py-4 bg-white rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">No comments posted yet. Start the discussion!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Comment Compose Editor Bar at bottom */}
        <div id="detail-comment-composer" className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handlePostComment} className="relative">
            {/* TextArea with Mention support */}
            <textarea
              id="comment-composer-text-area"
              ref={commentInputRef}
              rows={2}
              value={commentText}
              onChange={handleCommentChange}
              placeholder="Post a comment... tag a colleague using @Marcus Webb"
              className="w-full text-xs font-sans p-2 border border-slate-300 rounded-lg pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !showMentionPicker) {
                  e.preventDefault();
                  handlePostComment(e);
                }
              }}
            />

            {/* Float Mention search panel matches */}
            {showMentionPicker && (
              <div
                id="comment-mention-panel"
                ref={mentionPanelRef}
                className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-52 z-55 max-h-44 overflow-y-auto"
              >
                <p className="px-2.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Mention Colleague
                </p>
                {mentionCandidates.map((usr) => (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => selectMention(usr)}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 focus:bg-slate-100 hover:bg-slate-50 text-left font-medium cursor-pointer"
                  >
                    <span
                      className="w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center uppercase flex-shrink-0"
                      style={{ backgroundColor: usr.color }}
                    >
                      {usr.initials}
                    </span>
                    <span className="text-xs text-slate-700 truncate">{usr.name}</span>
                  </button>
                ))}
                {mentionCandidates.length === 0 && (
                  <p className="p-2 text-[10px] text-slate-400 text-center">No colleagues found</p>
                )}
              </div>
            )}

            {/* Send submit button element */}
            <button
              id="submit-comment-button"
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-2 bottom-4 p-1.5 bg-blue-600 hover:bg-shadow text-white hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-350 rounded-lg transition-colors cursor-pointer"
              title="Post Comment (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
