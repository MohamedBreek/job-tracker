import React from "react";
import {
  Briefcase,
  Plus,
  BarChart3,
  RotateCcw,
  Download,
  Github,
} from "lucide-react";

interface HeaderProps {
  isBackendOnline: boolean;
  onOpenNewModal: () => void;
  onOpenAnalytics: () => void;
  onResetData: () => void;
  onExportData: (format: "csv" | "json") => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBackendOnline,
  onOpenNewModal,
  onOpenAnalytics,
  onResetData,
  onExportData,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  JobPulse
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Portfolio Edition
                </span>
                {/* Status indicator */}
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    isBackendOnline
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                  title={
                    isBackendOnline
                      ? "Connected to live Express + PostgreSQL + BullMQ API"
                      : "Backend offline. Running on reactive LocalStorage offline-first engine."
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isBackendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{isBackendOnline ? "Backend Live" : "Offline / Demo Mode"}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Full-Stack Application Tracker • Kanban Drag & Drop • BullMQ Queue Automation
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Analytics button */}
            <button
              onClick={onOpenAnalytics}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
              title="View Funnel & Status Analytics"
            >
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            {/* Export dropdown / button */}
            <div className="relative group">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
                title="Export applications data"
              >
                <Download className="h-3.5 w-3.5 text-gray-600" />
                <span className="hidden lg:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-30">
                <button
                  onClick={() => onExportData("csv")}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                >
                  CSV Format
                </button>
                <button
                  onClick={() => onExportData("json")}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                >
                  JSON Format
                </button>
              </div>
            </div>

            {/* Reset sample data */}
            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent transition-colors"
              title="Reset to default sample applications"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/MohamedBreek/job-tracker"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>

            {/* + Add New Application CTA */}
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Job</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
