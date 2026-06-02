/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "../components/AssigneeAvatar";
import PriorityBadge from "../components/PriorityBadge";
import {
  Briefcase,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  History,
  FolderSync,
} from "lucide-react";

export default function Dashboard() {
  const { tasks, projects, activity, users, currentUser, setActiveTaskId } = useTaskFlow();
  const navigate = useNavigate();

  // Filter tasks assigned to current user
  const myTasks = tasks
    .filter((t) => t.assigneeId === currentUser.id)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // Calculate upcoming deadlines (next 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const upcomingDeadlines = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due >= today && due <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Progress calculations per project
  const getProjectStats = (projId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projId);
    const total = projTasks.length;
    const done = projTasks.filter((t) => t.status === "done").length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const activeMembers = users.filter((u) => getStoredProjects().find((p) => p.id === projId)?.memberIds.includes(u.id));

    return { total, done, progress, activeMembers };
  };

  // Convert timeline logs beautifully
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div id="dashboard-viewport" className="px-6 py-8 space-y-8 select-none">
      {/* Upper Banner Section */}
      <div id="dashboard-header-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Welcome back, {currentUser.name}!</span>
            <span className="text-xl animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and cooperate with your engineering and design team. Here is your overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-800">Team Status</p>
            <p className="text-slate-500 font-medium">
              {tasks.filter((t) => t.status === "done").length} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* Grid Bento Components */}
      <div id="dashboard-bento-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Columns details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Grid */}
          <div id="dashboard-projects-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-slate-400-custom" />
                <span>Active Projects</span>
              </h2>
              <Link
                to="/projects"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
              >
                <span>View all projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div id="dashboard-projects-cards" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const { total, done, progress } = getProjectStats(proj.id);
                const projMembers = users.filter((u) => proj.memberIds.includes(u.id));

                return (
                  <div
                    key={proj.id}
                    id={`proj-card-${proj.id}`}
                    onClick={() => navigate(`/projects/${proj.id}/board`)}
                    className="bg-white/70 backdrop-blur-md border border-white/40 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all p-4 cursor-pointer relative group flex flex-col justify-between"
                  >
                    <div>
                      {/* Name Header and Tag color indicator */}
                      <div className="flex items-center justify-between">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        ></span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
                          {total - done} open tasks
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mt-3 group-hover:text-blue-600 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-450 text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {proj.description || "No project description provided."}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {/* Project Member avatars row */}
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {projMembers.slice(0, 3).map((m) => (
                          <AssigneeAvatar
                            key={m.id}
                            name={m.name}
                            color={m.color}
                            size="sm"
                            tooltipText={`${m.name} (${m.role})`}
                          />
                        ))}
                        {projMembers.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm">
                            +{projMembers.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Progress slider bar indicator */}
                      <div className="w-24">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal assigned Tasks widget - My Tasks */}
          <div id="dashboard-mytasks-section" className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Assigned to Me ({myTasks.length})</span>
            </h2>

            {myTasks.length > 0 ? (
              <div id="dashboard-mytasks-list" className="bg-white/70 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden divide-y divide-white/20">
                {myTasks.map((t) => {
                  const p = projects.find((proj) => proj.id === t.projectId);
                  return (
                    <div
                      key={t.id}
                      id={`mytask-row-${t.id}`}
                      onClick={() => {
                        navigate(`/projects/${t.projectId}/board`);
                        setActiveTaskId(t.id);
                      }}
                      className="p-3.5 hover:bg-white/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p?.color || "#e2e8f0" }}
                        ></span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate hover:text-blue-600">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {p?.name} &middot; <span className="capitalize">{t.status.replace("_", " ")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <PriorityBadge level={t.priority} />
                        {t.dueDate && (
                          <span className="text-[10px] font-sans font-semibold text-slate-550 text-slate-500 flex items-center bg-slate-50 border rounded-md px-1.5 py-0.5">
                            <Clock className="w-3" />
                            <span className="ml-1">{new Date(t.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div id="mytasks-empty-state" className="text-center py-8 bg-white/70 backdrop-blur-md border border-white/40 rounded-xl p-4">
                <Award className="w-7 h-7 mx-auto text-yellow-500 mb-2" />
                <p className="text-xs text-slate-700 font-bold">You are fully caught up!</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">No open tasks are assigned to you.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column sidebar widgets */}
        <div className="space-y-6">
          {/* Upcoming Deadlines next 7 days widget */}
          <div id="dashboard-deadlines-section" className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Upcoming Deadlines</span>
            </h2>

            {upcomingDeadlines.length > 0 ? (
              <div id="dashboard-deadlines-list" className="bg-white/70 backdrop-blur-md border border-white/40 rounded-xl p-4 space-y-3">
                {upcomingDeadlines.map((t) => {
                  const p = projects.find((proj) => proj.id === t.projectId);
                  const isOverdueSoon = t.priority === "urgent" || t.priority === "high";

                  return (
                    <div
                      key={t.id}
                      id={`upcoming-row-${t.id}`}
                      onClick={() => {
                        navigate(`/projects/${t.projectId}/board`);
                        setActiveTaskId(t.id);
                      }}
                      className="text-xs flex items-center justify-between gap-3 border-b border-slate-100 last:border-b-0 pb-2.5 last:pb-0 hover:bg-slate-50 cursor-pointer p-1 rounded transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{t.title}</p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">Project: {p?.name}</p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`inline-block text-[10px] font-bold py-0.5 px-2 rounded-md border ${
                            isOverdueSoon
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-orange-50 text-orange-600 border-orange-200"
                          }`}
                        >
                          {new Date(t.dueDate!).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div id="deadlines-empty-state" className="text-center py-6 bg-white/70 backdrop-blur-md border border-white/40 rounded-xl p-3">
                <Clock className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-700 font-semibold">No critical deadlines</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Nothing due inside the next 7 days.</p>
              </div>
            )}
          </div>

          {/* Chronological team activity log feed */}
          <div id="dashboard-activity-section" className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <History className="w-4 h-4 text-slate-400" />
              <span>Recent Activity Feed</span>
            </h2>

            <div id="dashboard-activity-panel" className="bg-white/70 backdrop-blur-md border border-white/40 rounded-xl p-4.5 max-h-[360px] overflow-y-auto space-y-4">
              {activity.slice(0, 15).map((log) => {
                const triggerActor = users.find((u) => u.id === log.userId) || currentUser;
                const parentTask = tasks.find((t) => t.id === log.taskId);

                return (
                  <div key={log.id} className="flex items-start space-x-3 text-xs leading-relaxed">
                    <span
                      className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center uppercase flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: triggerActor.color }}
                    >
                      {triggerActor.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 font-medium whitespace-normal">
                        <strong className="text-slate-800 font-bold">{triggerActor.name}</strong>{" "}
                        <span>{log.action}</span>{" "}
                        {parentTask && (
                          <span
                            onClick={() => {
                              navigate(`/projects/${parentTask.projectId}/board`);
                              setActiveTaskId(parentTask.id);
                            }}
                            className="text-blue-600 hover:underline font-bold cursor-pointer inline"
                          >
                            &ldquo;{parentTask.title}&rdquo;
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {activity.length === 0 && (
                <p className="text-xs text-slate-400 text-center font-medium py-4">No recent activity captured.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const getStoredProjects = (): any[] => {
  const item = localStorage.getItem("tf_projects");
  if (!item) return [];
  try {
    return JSON.parse(item);
  } catch (e) {
    return [];
  }
};
