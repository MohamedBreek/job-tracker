import React from "react";
import { Application, Status, Priority } from "../types";
import { DndContext, DragEndEvent, useDroppable, useDraggable } from "@dnd-kit/core";
import {
  Clock,
  MessageSquare,
  Award,
  XCircle,
  Plus,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface Props {
  applications: Application[];
  onUpdateStatus: (id: string, status: Status) => void;
  onEditApplication: (application: Application) => void;
  onDeleteApplication: (id: string) => void;
  onQuickAdd: (status: Status) => void;
}

const COLUMN_CONFIG: {
  status: Status;
  label: string;
  icon: React.ReactNode;
  bgLight: string;
  borderColor: string;
  accentBadge: string;
  headerColor: string;
}[] = [
  {
    status: "WAITING",
    label: "Applied / Waiting",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
    bgLight: "bg-amber-50/30",
    borderColor: "border-amber-200/80",
    accentBadge: "bg-amber-100 text-amber-800",
    headerColor: "text-amber-900",
  },
  {
    status: "INTERVIEWING",
    label: "Interviewing",
    icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
    bgLight: "bg-blue-50/30",
    borderColor: "border-blue-200/80",
    accentBadge: "bg-blue-100 text-blue-800",
    headerColor: "text-blue-900",
  },
  {
    status: "APPROVED",
    label: "Offer / Approved",
    icon: <Award className="h-4 w-4 text-emerald-600" />,
    bgLight: "bg-emerald-50/30",
    borderColor: "border-emerald-200/80",
    accentBadge: "bg-emerald-100 text-emerald-800",
    headerColor: "text-emerald-900",
  },
  {
    status: "REJECTED",
    label: "Rejected / Archived",
    icon: <XCircle className="h-4 w-4 text-rose-500" />,
    bgLight: "bg-rose-50/20",
    borderColor: "border-gray-200",
    accentBadge: "bg-gray-100 text-gray-700",
    headerColor: "text-gray-800",
  },
];

export const KanbanBoard: React.FC<Props> = ({
  applications,
  onUpdateStatus,
  onEditApplication,
  onDeleteApplication,
  onQuickAdd,
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as Status;

    const validStatuses: Status[] = ["WAITING", "INTERVIEWING", "APPROVED", "REJECTED"];
    if (validStatuses.includes(newStatus)) {
      onUpdateStatus(applicationId, newStatus);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start pb-12">
        {COLUMN_CONFIG.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);
          return (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              icon={col.icon}
              bgLight={col.bgLight}
              borderColor={col.borderColor}
              accentBadge={col.accentBadge}
              headerColor={col.headerColor}
              applications={colApps}
              onEditApplication={onEditApplication}
              onDeleteApplication={onDeleteApplication}
              onQuickAdd={() => onQuickAdd(col.status)}
              onUpdateStatus={onUpdateStatus}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

interface ColumnProps {
  status: Status;
  label: string;
  icon: React.ReactNode;
  bgLight: string;
  borderColor: string;
  accentBadge: string;
  headerColor: string;
  applications: Application[];
  onEditApplication: (application: Application) => void;
  onDeleteApplication: (id: string) => void;
  onQuickAdd: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const Column: React.FC<ColumnProps> = ({
  status,
  label,
  icon,
  bgLight,
  borderColor,
  accentBadge,
  headerColor,
  applications,
  onEditApplication,
  onDeleteApplication,
  onQuickAdd,
  onUpdateStatus,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border ${borderColor} ${bgLight} p-3.5 flex flex-col transition-all duration-150 ${
        isOver ? "ring-2 ring-indigo-500/50 bg-indigo-50/30 scale-[1.01]" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 mb-2 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className={`font-bold text-xs tracking-tight ${headerColor}`}>{label}</h2>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${accentBadge}`}
          >
            {applications.length}
          </span>
        </div>
        <button
          onClick={onQuickAdd}
          className="p-1 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-white/80 transition shadow-xs"
          title={`Add application to ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-3 min-h-[480px]">
        {applications.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-gray-200/80 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs font-medium p-4 text-center">
            <span>Drop applications here</span>
          </div>
        ) : (
          applications.map((app) => (
            <JobCard
              key={app.id}
              application={app}
              onEdit={onEditApplication}
              onDelete={onDeleteApplication}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface JobCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  application,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
            🔥 High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
            ⚡ Med
          </span>
        );
      case "LOW":
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            🌱 Low
          </span>
        );
    }
  };

  const tagsList = application.tags
    ? application.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const companyInitial = application.companyName.charAt(0).toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200/80 transition-all duration-150 hover:shadow-md group relative ${
        isDragging ? "opacity-60 ring-2 ring-indigo-500 shadow-xl cursor-grabbing" : ""
      }`}
    >
      {/* Top Header: Company initial + Title + Actions */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 flex-1 min-w-0" {...listeners} {...attributes}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-gray-900 to-gray-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing">
            {companyInitial}
          </div>
          <div className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
            <h3 className="font-bold text-xs text-gray-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
              {application.jobTitle}
            </h3>
            <p className="text-xs font-medium text-gray-500 truncate">
              {application.companyName}
            </p>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-1">
          {getPriorityBadge(application.priority || "MEDIUM")}
        </div>
      </div>

      {/* Meta Pills (Location, Salary) */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
        {application.location && (
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-[120px]">{application.location}</span>
          </div>
        )}
        {application.salary && (
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 font-medium text-gray-700">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <span>{application.salary}</span>
          </div>
        )}
      </div>

      {/* Tags Chips */}
      {tagsList.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {tagsList.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] bg-indigo-50/70 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100/60 font-medium"
            >
              {tag}
            </span>
          ))}
          {tagsList.length > 3 && (
            <span className="text-[10px] text-gray-400 font-medium self-center">
              +{tagsList.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Automation Indicator for APPROVED jobs */}
      {application.status === "APPROVED" && (
        <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span>BullMQ 24h follow-up reminder active!</span>
        </div>
      )}

      {/* Footer Details & Actions */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(application.appliedAt)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Stage Switcher */}
          <select
            value={application.status}
            onChange={(e) => onUpdateStatus(application.id, e.target.value as Status)}
            className="text-[10px] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600 focus:outline-none cursor-pointer"
            title="Quick move to another stage"
          >
            <option value="WAITING">Move: Waiting</option>
            <option value="INTERVIEWING">Move: Interviewing</option>
            <option value="APPROVED">Move: Approved</option>
            <option value="REJECTED">Move: Rejected</option>
          </select>

          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-100 transition"
              title="Open job link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={() => onEdit(application)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition"
            title="Edit details"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete application for ${application.companyName}?`)) {
                onDelete(application.id);
              }
            }}
            className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-100 transition"
            title="Delete application"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
