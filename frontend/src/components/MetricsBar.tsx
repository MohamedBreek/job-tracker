import React from "react";
import { ApplicationStats } from "../types";
import { Briefcase, MessageSquare, Award, TrendingUp, Sparkles } from "lucide-react";

interface MetricsBarProps {
  stats: ApplicationStats;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Applications */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Pipeline
          </span>
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          <span className="text-xs text-gray-500 font-medium">applications</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          {stats.breakdown.WAITING} currently in Waiting
        </div>
      </div>

      {/* 2. In Interview */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Interviewing
          </span>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-600">
            {stats.breakdown.INTERVIEWING}
          </span>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
            {stats.rates.interviewRate}% rate
          </span>
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          Active recruiter & tech screens
        </div>
      </div>

      {/* 3. Offers / Approved */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Offers / Approved
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600">
            {stats.breakdown.APPROVED}
          </span>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
            {stats.rates.offerRate}% conversion
          </span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>BullMQ auto-reminders active</span>
        </div>
      </div>

      {/* 4. Response Rate */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Response Rate
          </span>
          <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {stats.rates.responseRate}%
          </span>
          <span className="text-xs text-gray-500 font-medium">responded</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          {stats.breakdown.REJECTED} archived / rejected
        </div>
      </div>
    </div>
  );
};
