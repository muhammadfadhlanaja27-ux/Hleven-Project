import React from "react";

const STATUS_STYLES = {
  pending: {
    bg: "bg-[#eae1d8]/60",
    text: "text-[#615b54]",
    label: "Pending Verification",
    icon: "schedule",
  },
  under_review: {
    bg: "bg-[#ceeac7]/60",
    text: "text-[#4c6549]",
    label: "Under Review",
    icon: "visibility",
  },
  needs_revision: {
    bg: "bg-[#ffdad6]/40",
    text: "text-[#ba1a1a]",
    label: "Needs Revision",
    icon: "edit_note",
  },
  approved: {
    bg: "bg-[#d5e8cf]/70",
    text: "text-[#3b4b39]",
    label: "Approved",
    icon: "verified",
  },
  rejected: {
    bg: "bg-[#ffdad6]/60",
    text: "text-[#93000a]",
    label: "Rejected",
    icon: "cancel",
  },
};

const StatusBadge = ({ status, size = "md" }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const padding = size === "sm" ? "px-2 py-0.5 gap-1 text-[10px]" : "px-3 py-1 gap-1.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider ${style.bg} ${style.text} ${padding}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: size === "sm" ? "12px" : "14px" }}>
        {style.icon}
      </span>
      {style.label}
    </span>
  );
};

export const getStatusLabel = (status) => STATUS_STYLES[status]?.label || "Pending Verification";
export default StatusBadge;
