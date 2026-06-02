/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AvatarSize } from "../types";

interface AssigneeAvatarProps {
  key?: React.Key;
  name: string;
  avatarUrl?: string | null;
  color: string;
  size?: AvatarSize;
  onClick?: (e: React.MouseEvent) => void;
  tooltipText?: string;
}

export default function AssigneeAvatar({
  name,
  avatarUrl,
  color,
  size = "md",
  onClick,
  tooltipText,
}: AssigneeAvatarProps) {
  let sizeClasses = "w-8 h-8 text-xs";
  if (size === "sm") {
    sizeClasses = "w-6 h-6 text-[10px]";
  } else if (size === "lg") {
    sizeClasses = "w-10 h-10 text-sm";
  }

  const safeName = name || "Unknown";

  // Get initials if no image is present
  const initials = safeName
    .split(" ")
    .map((n) => n ? n[0] : "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleContainerClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div
      id={`avatar-${safeName.replace(/\s+/g, "-").toLowerCase()}`}
      className={`relative group inline-block flex-shrink-0 ${onClick ? "cursor-pointer" : ""}`}
      onClick={handleContainerClick}
    >
      <div
        style={{ backgroundColor: color || "#3B82F6" }}
        className={`${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white tracking-wider border-2 border-white shadow-sm overflow-hidden select-none`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={safeName}
            id={`avatar-img-${safeName.replace(/\s+/g, "-").toLowerCase()}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image path fails or doesn't resolve in local setup
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* High-quality styled tooltip */}
      <div
        id={`avatar-tooltip-${safeName.replace(/\s+/g, "-").toLowerCase()}`}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-slate-100 text-[11px] font-medium py-1 px-1.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
      >
        {tooltipText || safeName}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-sm overflow-hidden border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
