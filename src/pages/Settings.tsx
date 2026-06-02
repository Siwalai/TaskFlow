/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useTaskFlow } from "../context/TaskFlowContext";
import AssigneeAvatar from "../components/AssigneeAvatar";
import { Save, User, UserPlus, Bell, Shield, Check, Info } from "lucide-react";

export default function Settings() {
  const { currentUser, updateProfile } = useTaskFlow();

  // State bindings local to profile
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [timezone, setTimezone] = useState("");
  const [color, setColor] = useState("");

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [digestNotifs, setDigestNotifs] = useState(true);

  const [savingStatus, setSavingStatus] = useState("");

  // Populate state on mount / user change
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setName(currentUser.name);
      setRole(currentUser.role);
      setTimezone(currentUser.timezone);
      setColor(currentUser.color);
    }
  }, [currentUser]);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus("");

    if (!name.trim()) return;

    updateProfile(name.trim(), role, timezone, color);
    setSavingStatus("Profile configuration saved successfully!");

    setTimeout(() => {
      setSavingStatus("");
    }, 4000);
  };

  return (
    <div id="settings-viewport" className="px-6 py-8 max-w-2xl select-none mx-auto space-y-8">
      {/* Header Banner */}
      <div id="settings-header-banner">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile & Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Synchronize user display details and manage communication parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Core Profile Card details */}
        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-white/40">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Profile Information</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Profile Avatar visual representation */}
              <div id="settings-visual-avatar" className="flex flex-col items-center space-y-2">
                <AssigneeAvatar name={name || "Aria"} color={color || "#2563EB"} size="lg" />
                <span className="text-[10px] text-slate-400 font-bold bg-white/40 border border-slate-200/50 px-2 py-0.5 rounded-full select-none">
                  {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "UN"}
                </span>
              </div>

              {/* Grid inputs */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Display Name
                  </label>
                  <input
                    id="settings-display-name"
                    type="text"
                    required
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all"
                  />
                </div>

                {/* Role select list */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Organizational Role
                  </label>
                  <select
                    id="settings-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all cursor-pointer"
                  >
                    <option value="Team Lead">Team Lead</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Designer">Designer</option>
                    <option value="QA">QA Specialist</option>
                    <option value="PM">Product Coordinator</option>
                  </select>
                </div>

                {/* Timezone Selection details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Local Timezone
                  </label>
                  <select
                    id="settings-timezone-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-white/40 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all cursor-pointer"
                  >
                    <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (UTC+5.5)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>

                {/* Theme selection pick color accent row */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Avatar Theme Color
                  </label>
                  <div className="flex items-center gap-1.5 h-10 select-none">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5.5 h-5.5 rounded-full cursor-pointer transition-all border-2 ${
                          color === c ? "border-slate-800 scale-110 shadow" : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Parameters Section */}
            <div id="settings-notifications-block" className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-orange-550" />
                <h4 className="text-xs font-bold text-slate-850 uppercase tracking-widest text-slate-500">Communication Alerts</h4>
              </div>

              <div className="space-y-3 pl-1 text-xs">
                {/* Email triggers */}
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    id="trigger-email-notifs"
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-slate-900">Email Notifications</p>
                    <p className="text-[10px] text-slate-450 text-slate-500">Notify my inbox instantly when tagged in comments</p>
                  </div>
                </label>

                {/* Push triggers */}
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    id="trigger-push-notifs"
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-slate-900">Browser Push Alerts</p>
                    <p className="text-[10px] text-slate-450 text-slate-500">Enable micro-indicator alert bubbles on browser margins</p>
                  </div>
                </label>

                {/* Digest newsletter checkbox */}
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    id="trigger-newsletters-digest"
                    type="checkbox"
                    checked={digestNotifs}
                    onChange={(e) => setDigestNotifs(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-slate-900">Sprint Digest Summaries</p>
                    <p className="text-[10px] text-slate-450 text-slate-500">Send brief weekly recaps summarizing project velocity and milestones</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Validation alerts messages */}
            {savingStatus && (
              <div id="settings-success-alert" className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 animate-fade-in">
                <Check className="w-4.5 h-4.5 flex-shrink-0 text-emerald-500" />
                <span className="font-semibold">{savingStatus}</span>
              </div>
            )}

            {/* Submit layout */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                id="save-profile-btn"
                type="submit"
                disabled={!name.trim()}
                className="inline-flex items-center h-10 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
