/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Priority } from "../types";
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

interface PriorityBadgeProps {
  level: Priority;
  className?: string;
}

export default function PriorityBadge({ level, className = "" }: PriorityBadgeProps) {
  let bgClass = "";
  let textClass = "";
  let icon = null;

  switch (level) {
    case "urgent":
      bgClass = "bg-red-50 border border-red-200 text-red-600";
      textClass = "text-red-700 font-semibold";
      icon = <AlertCircle id="prio-icon-urgent" className="w-3.5 h-3.5 text-red-500 mr-1 flex-shrink-0" />;
      break;
    case "high":
      bgClass = "bg-orange-50 border border-orange-200 text-orange-600";
      textClass = "text-orange-700 font-semibold";
      icon = <ArrowUp id="prio-icon-high" className="w-3.5 h-3.5 text-orange-500 mr-1 flex-shrink-0" />;
      break;
    case "medium":
      bgClass = "bg-blue-50 border border-blue-200 text-blue-600";
      textClass = "text-blue-700 font-medium";
      icon = <ArrowDown id="prio-icon-medium" className="w-3.5 h-3.5 text-blue-500 mr-1 flex-shrink-0 rotate-180" />;
      break;
    case "low":
    default:
      bgClass = "bg-slate-50 border border-slate-200 text-slate-500";
      textClass = "text-slate-600 font-normal";
      icon = <ArrowDown id="prio-icon-low" className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />;
      break;
  }

  return (
    <span
      id={`priority-badge-${level}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs transition-all duration-150 ${bgClass} ${className}`}
    >
      {icon}
      <span className={textClass}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
    </span>
  );
}
