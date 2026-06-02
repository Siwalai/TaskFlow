/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { TaskFlowProvider, useTaskFlow } from "./context/TaskFlowContext";

// Page Views
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import BoardView from "./pages/BoardView";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

// Global Overlay Components
import Sidebar from "./components/Sidebar";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskDetailModal from "./components/TaskDetailModal";
import GlobalSearch from "./components/GlobalSearch";
import UserSwitcher from "./components/UserSwitcher";

function AppContent() {
  const { activeTaskId, setActiveTaskId } = useTaskFlow();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div
      id="taskflow-app-shell"
      className="flex flex-col md:flex-row h-screen w-screen overflow-hidden frosted-glass-bg font-sans text-slate-800 antialiased"
    >
      {/* Global User Switching Dropdown at Top Right */}
      <UserSwitcher />

      {/* Persistent left sidebar / footer tabs layout */}
      <Sidebar onOpenCreateTask={() => setIsCreateOpen(true)} />

      {/* Main content viewport */}
      <main id="taskflow-main-content" className="flex-1 overflow-y-auto pb-16 md:pb-0 h-full relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          {/* Support both Kanban board and List views as specified in routes list */}
          <Route path="/projects/:id/board" element={<BoardView />} />
          <Route path="/projects/:id/list" element={<BoardView />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          {/* Redirect arbitrary links safely to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Integrated Action Overlays */}
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <TaskDetailModal taskId={activeTaskId} onClose={() => setActiveTaskId(null)} />

      <GlobalSearch />
    </div>
  );
}

export default function App() {
  return (
    <TaskFlowProvider>
      <Router>
        <AppContent />
      </Router>
    </TaskFlowProvider>
  );
}
