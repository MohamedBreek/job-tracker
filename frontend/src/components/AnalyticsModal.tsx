import React from "react";
import { X, BarChart3, TrendingUp } from "lucide-react";
import { ApplicationStats } from "../types";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ApplicationStats;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const total = stats.total || 1;
  const waitingPct = Math.round((stats.breakdown.WAITING / total) * 100);
  const interviewPct = Math.round((stats.breakdown.INTERVIEWING / total) * 100);
  const approvedPct = Math.round((stats.breakdown.APPROVED / total) * 100);
  const rejectedPct = Math.round((stats.breakdown.REJECTED / total) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Pipeline Analytics & Conversion Funnel
              </h2>
              <p className="text-xs text-gray-500">
                Real-time job hunt efficiency metrics and stage conversion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Rates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-700">
                {stats.rates.interviewRate}%
              </div>
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mt-1">
                Interview Rate
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
              <div className="text-2xl font-bold text-emerald-700">
                {stats.rates.offerRate}%
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mt-1">
                Offer Conversion
              </div>
            </div>

            <div className="p-3.5 bg-violet-50/50 border border-violet-100 rounded-xl text-center">
              <div className="text-2xl font-bold text-violet-700">
                {stats.rates.responseRate}%
              </div>
              <div className="text-[11px] font-semibold text-violet-600 uppercase tracking-wide mt-1">
                Response Rate
              </div>
            </div>
          </div>

          {/* Funnel Progress Bars */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Application Distribution by Stage
            </h3>
            <div className="space-y-3">
              {/* Waiting */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Applied / Waiting</span>
                  <span>
                    {stats.breakdown.WAITING} ({waitingPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${waitingPct}%` }}
                  />
                </div>
              </div>

              {/* Interviewing */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Interviewing</span>
                  <span>
                    {stats.breakdown.INTERVIEWING} ({interviewPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${interviewPct}%` }}
                  />
                </div>
              </div>

              {/* Approved */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Offer / Approved</span>
                  <span>
                    {stats.breakdown.APPROVED} ({approvedPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${approvedPct}%` }}
                  />
                </div>
              </div>

              {/* Rejected */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Rejected / Archived</span>
                  <span>
                    {stats.breakdown.REJECTED} ({rejectedPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${rejectedPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automated System Insights */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span>Queue & Automation Insights</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              When an application is moved to the <strong>Offer / Approved</strong> stage, a delayed
              background job is dispatched into <strong>BullMQ</strong>. This triggers an automated 24-hour
              reminder requiring the candidate to submit their CV and required paperwork.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200/80 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
