/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "../components/AssigneeAvatar";
import { Plus, FolderPlus, Calendar, Info, X, Users, Check, Shield } from "lucide-react";
import { Project } from "../types";

export default function Projects() {
  const { projects, tasks, users, createProject, updateProjectMembers } = useTaskFlow();
  const navigate = useNavigate();

  // Create Project states
  const [showCreateProj, setShowCreateProj] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projColor, setProjColor] = useState("#2563EB"); // Default Blue
  const [projError, setProjError] = useState("");

  // Manage Project Members states
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tempMemberIds, setTempMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const colorOptions = [
    "#2563EB", // Primary Blue
    "#7C3AED", // Royal Violet
    "#0891B2", // Cyan Marine
    "#22C55E", // Success Green
    "#EF4444", // Passion Red
    "#F59E0B", // Caution Yellow
    "#EC4899", // Magenta/Pink
    "#0F172A", // Dark Slate
  ];

  const handleCreateProjectLocal = (e: React.FormEvent) => {
    e.preventDefault();
    setProjError("");

    if (!projName.trim()) {
      setProjError("Project needs a name");
      return;
    }

    // Attempt to invoke state context logic (validating uniqueness inline)
    const success = createProject(projName.trim(), projDesc, projColor);
    if (!success) {
      setProjError("A project with this name already exists.");
      return;
    }

    // Reset and Close
    setProjName("");
    setProjDesc("");
    setProjColor("#2563EB");
    setShowCreateProj(false);
  };

  const handleToggleMember = (userId: string) => {
    if (tempMemberIds.includes(userId)) {
      // Prevent removing the last member completely just as a validation safeguard
      if (tempMemberIds.length === 1) return;
      setTempMemberIds(tempMemberIds.filter((id) => id !== userId));
    } else {
      setTempMemberIds([...tempMemberIds, userId]);
    }
  };

  const handleSaveMembers = () => {
    if (selectedProject) {
      updateProjectMembers(selectedProject.id, tempMemberIds);
      setShowManageMembers(false);
      setSelectedProject(null);
      setTempMemberIds([]);
      setMemberSearchQuery("");
    }
  };

  return (
    <div id="projects-viewport" className="px-6 py-8 space-y-8 select-none">
      {/* Header Banner */}
      <div id="projects-header-banner" className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Projects Directorate</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and launch workspaces for engineering, design, or QA sprints.</p>
        </div>

        <button
          id="new-project-btn-trigger"
          onClick={() => setShowCreateProj(true)}
          className="inline-flex items-center h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid Display */}
      <div id="projects-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const doneTasks = projTasks.filter((t) => t.status === "done").length;
          const openTasks = projTasks.length - doneTasks;
          const projMembers = users.filter((u) => proj.memberIds.includes(u.id));

          // Simple readable date formatter
          const formattedUpdatedDate = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={proj.id}
              id={`project-card-${proj.id}`}
              onClick={() => navigate(`/projects/${proj.id}/board`)}
              className="bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 cursor-pointer relative group flex flex-col justify-between"
            >
              <div>
                {/* Visual Label Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{proj.id.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-semibold bg-blue-50/40 border border-white/40 rounded-md px-2 py-0.5">
                    {openTasks} active sprints
                  </span>
                </div>

                {/* Listing Metadata */}
                <h3 className="font-bold text-slate-800 text-base mt-4 group-hover:text-blue-600 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 h-10 line-clamp-2 leading-relaxed">
                  {proj.description || "No project description provided."}
                </p>
              </div>

              {/* Footer summaries */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-450 text-slate-400">
                {/* Members row list avatars with add/remove capability */}
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1 overflow-hidden" title="Workspace Members">
                    {projMembers.map((m) => (
                      <AssigneeAvatar
                        key={m.id}
                        name={m.name}
                        color={m.color}
                        size="sm"
                        tooltipText={`${m.name} (${m.role})`}
                      />
                    ))}
                  </div>

                  {/* Add / Manage project members trigger */}
                  <button
                    id={`add-project-member-trigger-${proj.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(proj);
                      setTempMemberIds([...proj.memberIds]);
                      setShowManageMembers(true);
                    }}
                    className="w-6 h-6 rounded-full border border-dashed border-slate-300 hover:border-blue-500 text-slate-400 hover:text-blue-550 flex items-center justify-center transition-all cursor-pointer bg-white/50"
                    title="Manage Project Members (Add/Remove)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Last updated timestamp */}
                <span className="inline-flex items-center text-[10px] font-medium text-slate-450">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Updated {formattedUpdatedDate}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Create Modal Dialog */}
      {showCreateProj && (
        <div
          id="project-create-modal-overlay"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateProj(false)}
        >
          <div
            id="project-create-modal-panel"
            className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 max-w-md w-full p-6 space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderPlus className="w-4.5 h-4.5 text-blue-600" />
                <span>Initialize Workspace</span>
              </h3>
              <button
                onClick={() => setShowCreateProj(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProjectLocal} className="space-y-4.5">
              {/* Project title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Workspace Title
                </label>
                <input
                  id="project-title-input"
                  type="text"
                  required
                  placeholder="e.g., Marketing Campaign v3"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                />
              </div>

              {/* Color options choice list */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Theme Accent Color
                </label>
                <div id="project-color-opts-row" className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProjColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 ${
                        projColor === c ? "border-slate-800 scale-110 shadow" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Project descriptions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  id="project-desc-textarea"
                  rows={3}
                  placeholder="Summarize the core mandates for this project workspace..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all resize-none"
                />
              </div>

              {/* Inline duplicate error validations alerts */}
              {projError && (
                <div id="project-error-toast" className="p-3 bg-red-50 border border-red-151 text-red-650 text-xs rounded-lg flex items-start space-x-2 animate-pulse-once">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                  <span className="font-semibold text-red-600">{projError}</span>
                </div>
              )}

              {/* Actions submit footer bar */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateProj(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projName.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Member Management Overlay */}
      {showManageMembers && selectedProject && (
        <div
          id="project-members-modal-overlay"
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
          onClick={() => {
            setShowManageMembers(false);
            setSelectedProject(null);
            setTempMemberIds([]);
            setMemberSearchQuery("");
          }}
        >
          <div
            id="project-members-modal-panel"
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-fade-in text-slate-850 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  <span>Workspace Members</span>
                </h3>
                <p className="text-[11px] text-slate-450 text-slate-500 dark:text-slate-400 font-medium">
                  Grant access or restrict members for <strong className="text-slate-705 dark:text-slate-200">{selectedProject.name}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowManageMembers(false);
                  setSelectedProject(null);
                  setTempMemberIds([]);
                  setMemberSearchQuery("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Member Search box */}
            <div className="relative">
              <input
                id="member-modal-search"
                type="text"
                placeholder="Search team roster..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold p-2 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
              />
            </div>

            {/* Members scrolling roster list */}
            <div id="modal-members-roster-list" className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {users
                .filter((u) => u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                .map((u) => {
                  const isChecked = tempMemberIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      id={`modal-member-row-${u.id}`}
                      onClick={() => handleToggleMember(u.id)}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                        isChecked
                          ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/30"
                          : "bg-white/40 dark:bg-slate-850/20 border-transparent hover:bg-white/80 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <AssigneeAvatar name={u.name} color={u.color} size="md" />
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center">
                            <span>{u.name}</span>
                            {u.role === "Team Lead" && (
                              <Shield className="w-3 h-3 text-blue-500 ml-1 flex-shrink-0" />
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-450 truncate font-semibold">
                            {u.role} &bull; {u.email}
                          </p>
                        </div>
                      </div>

                      {/* Custom circular selection marker indicator */}
                      <div
                        id={`member-check-sphere-${u.id}`}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                          isChecked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}

              {users.filter((u) => u.name.toLowerCase().includes(memberSearchQuery.toLowerCase())).length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-xs">No project members found</p>
                </div>
              )}
            </div>

            {/* Actions submit footer bar */}
            <div className="flex items-center justify-end space-x-2 pt-3.5 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowManageMembers(false);
                  setSelectedProject(null);
                  setTempMemberIds([]);
                  setMemberSearchQuery("");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMembers}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Save Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
