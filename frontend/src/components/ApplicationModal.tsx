import React, { useState, useEffect } from "react";
import { X, Building2, Briefcase, MapPin, DollarSign, Link, Tag, FileText, Check } from "lucide-react";
import { Application, Priority, Status } from "../types";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Application, "id" | "appliedAt" | "updatedAt">) => void;
  initialData?: Application | null;
  defaultStatus?: Status;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultStatus = "WAITING",
}) => {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName || "");
      setJobTitle(initialData.jobTitle || "");
      setStatus(initialData.status || "WAITING");
      setPriority(initialData.priority || "MEDIUM");
      setLocation(initialData.location || "");
      setSalary(initialData.salary || "");
      setUrl(initialData.url || "");
      setTags(initialData.tags || "");
      setNotes(initialData.notes || "");
    } else {
      setCompanyName("");
      setJobTitle("");
      setStatus(defaultStatus);
      setPriority("MEDIUM");
      setLocation("");
      setSalary("");
      setUrl("");
      setTags("");
      setNotes("");
    }
    setError("");
  }, [initialData, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Company Name is required");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Job Title is required");
      return;
    }

    onSubmit({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      status,
      priority,
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      url: url.trim() || undefined,
      tags: tags.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {initialData ? "Edit Job Application" : "Track New Job Application"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {initialData
                ? "Update your application details and interview status"
                : "Add a company and role to your Kanban pipeline"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Company & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
                <span>Company Name *</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Google, Linear"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                <span>Job Title *</span>
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Full-Stack Developer"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="WAITING">Applied / Waiting</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="APPROVED">Offer / Approved</option>
                <option value="REJECTED">Rejected / Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="HIGH">🔥 High Priority</option>
                <option value="MEDIUM">⚡ Medium Priority</option>
                <option value="LOW">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Tel Aviv, Hybrid"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                <span>Salary / Comp</span>
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $140k - $160k"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Job URL & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Link className="h-3.5 w-3.5 text-gray-500" />
                <span>Job Posting Link</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-500" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, TypeScript, Go"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-gray-500" />
              <span>Interview Notes & Details</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contacts, interview round dates, questions asked, prep notes..."
              className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition"
            >
              <Check className="h-4 w-4" />
              <span>{initialData ? "Save Changes" : "Create Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
