/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "../components/AssigneeAvatar";
import { Mail, Globe, Layers, UserCheck, ShieldCheck } from "lucide-react";

export default function Team() {
  const { users, tasks } = useTaskFlow();

  // Helper to count active tasks (not Done) assigned to a user
  const getUserActiveTaskCount = (userId: string) => {
    return tasks.filter((t) => t.assigneeId === userId && t.status !== "done").length;
  };

  const getUserCompletedTaskCount = (userId: string) => {
    return tasks.filter((t) => t.assigneeId === userId && t.status === "done").length;
  };

  return (
    <div id="team-viewport" className="px-6 py-8 space-y-8 select-none">
      {/* Banner */}
      <div id="team-header-banner">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team Roster</h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate deliverables, oversee individual workloads, and monitor operational task counts.
        </p>
      </div>

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
                  <span>{usr.timezone} (UTC)</span>
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
    </div>
  );
}
