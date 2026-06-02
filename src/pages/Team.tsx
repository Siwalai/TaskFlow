/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "../components/AssigneeAvatar";
import { Mail, Globe, ShieldCheck, UserPlus, X, Info } from "lucide-react";
import { UserRole } from "../types";

export default function Team() {
  const { users, tasks, addTeamMember } = useTaskFlow();

  // Create Team Member states
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<UserRole>("Engineer");
  const [memberColor, setMemberColor] = useState("#2563EB");
  const [memberTimezone, setMemberTimezone] = useState("Asia/Bangkok");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const timezoneOptions = [
    { value: "Asia/Bangkok", label: "Indochina (Asia/Bangkok)" },
    { value: "Europe/London", label: "Greenwich Mean (Europe/London)" },
    { value: "Asia/Kolkata", label: "India Standard (Asia/Kolkata)" },
    { value: "America/New_York", label: "Eastern Standard (America/New_York)" },
    { value: "America/Los_Angeles", label: "Pacific Standard (America/Los_Angeles)" },
  ];

  // Helper to count active tasks (not Done) assigned to a user
  const getUserActiveTaskCount = (userId: string) => {
    return tasks.filter((t) => t.assigneeId === userId && t.status !== "done").length;
  };

  const getUserCompletedTaskCount = (userId: string) => {
    return tasks.filter((t) => t.assigneeId === userId && t.status === "done").length;
  };

  const handleAddMemberLocal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberName.trim() || !memberEmail.trim()) {
      return;
    }

    addTeamMember({
      name: memberName.trim(),
      email: memberEmail.trim(),
      role: memberRole,
      timezone: memberTimezone,
      color: memberColor,
    });

    // Reset Form
    setMemberName("");
    setMemberEmail("");
    setMemberRole("Engineer");
    setMemberColor("#2563EB");
    setMemberTimezone("Asia/Bangkok");
    setShowAddMember(false);

    // Show dynamic success indicator
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div id="team-viewport" className="px-6 py-8 space-y-8 select-none">
      {/* Banner */}
      <div id="team-header-banner" className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate deliverables, oversee individual workloads, and monitor operational task counts.
          </p>
        </div>

        <button
          id="add-team-member-trigger"
          onClick={() => setShowAddMember(true)}
          className="inline-flex items-center h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Success alert notification banner */}
      {showSuccessToast && (
        <div id="team-success-notification" className="p-4 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-110/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between max-w-xl animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <Info className="w-4.5 h-4.5 text-emerald-505" />
            <span className="font-bold">Team member was successfully added to the roster!</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-white cursor-pointer select-none">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid listing */}
      <div id="team-members-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((usr) => {
          const openCount = getUserActiveTaskCount(usr.id);
          const doneCount = getUserCompletedTaskCount(usr.id);

          return (
            <div
              key={usr.id}
              id={`team-card-${usr.id}`}
              className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-5"
            >
              {/* Header profile details */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <AssigneeAvatar name={usr.name} color={usr.color} size="lg" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center">
                      <span>{usr.name}</span>
                      {usr.role === "Team Lead" && (
                        <ShieldCheck className="w-4 h-4 text-blue-500 ml-1.5" title="Team Lead Permissions" />
                      )}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {usr.role}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold bg-blue-50/40 text-blue-600 px-2 py-0.5 rounded border border-white/40">
                  ● Active
                </span>
              </div>

              {/* Sub parameters */}
              <div className="space-y-2.5 text-xs text-slate-500 border-t border-b border-slate-105/10 py-3.5">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{usr.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{usr.timezone} (UTC)</span>
                </div>
              </div>

              {/* Load workloads metrics */}
              <div id="team-workload-row" className="bg-white/40 border border-white/40 rounded-xl p-3 flex items-center justify-around text-center text-xs">
                {/* Active Sprints */}
                <div>
                  <p className="font-extrabold text-[15px] text-slate-900">{openCount}</p>
                  <p className="text-[10px] text-slate-450 font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                    In Progress
                  </p>
                </div>

                {/* Split line */}
                <span className="w-[1px] h-6 bg-slate-200"></span>

                {/* Sprints Closed */}
                <div>
                  <p className="font-extrabold text-[15px] text-slate-900">{doneCount}</p>
                  <p className="text-[10px] text-slate-450 font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                    Completed
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal Overlay */}
      {showAddMember && (
        <div
          id="team-add-member-overlay"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddMember(false)}
        >
          <div
            id="team-add-member-panel"
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 max-w-md w-full p-6 space-y-4 animate-fade-in text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/40 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5 font-sans">
                <UserPlus className="w-4.5 h-4.5 text-blue-600" />
                <span>Add Team Member</span>
              </h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMemberLocal} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  id="member-name-input"
                  type="text"
                  required
                  placeholder="e.g., Jennifer Lopez"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  id="member-email-input"
                  type="email"
                  required
                  placeholder="e.g., jennifer@taskflow.io"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                />
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Organization Role
                </label>
                <select
                  id="member-role-select"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as UserRole)}
                  className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                >
                  <option value="Team Lead">Team Lead</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Designer">Designer</option>
                  <option value="QA">QA Specialist</option>
                  <option value="PM">Product Manager</option>
                </select>
              </div>

              {/* Timezone Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Timezone Location
                </label>
                <select
                  id="member-timezone-select"
                  value={memberTimezone}
                  onChange={(e) => setMemberTimezone(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                >
                  {timezoneOptions.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Color Palette Accent */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Visual Avatar Accent Color
                </label>
                <div id="member-color-opts-row" className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMemberColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 ${
                        memberColor === c ? "border-slate-800 dark:border-white scale-110 shadow" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Actions submit footer bar */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!memberName.trim() || !memberEmail.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
