import { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { MetricsBar } from "./components/MetricsBar";
import { FiltersBar } from "./components/FiltersBar";
import { KanbanBoard } from "./components/KanbanBoard";
import { ApplicationModal } from "./components/ApplicationModal";
import { AnalyticsModal } from "./components/AnalyticsModal";
import { Toast, ToastMessage } from "./components/Toast";
import { Application, Priority, Status } from "./types";
import { apiService } from "./services/api";

export function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"date" | "company" | "priority">("date");

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [quickAddStatus, setQuickAddStatus] = useState<Status>("WAITING");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize and check backend
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const health = await apiService.checkBackendHealth();
      setIsBackendOnline(health.online);

      const data = await apiService.getApplications(health.online);
      setApplications(data);
      setIsLoading(false);

      if (health.online) {
        addToast("success", "Connected to Backend API", "PostgreSQL & BullMQ background queue active");
      } else {
        addToast(
          "info",
          "Running in Demo Mode",
          "Offline-first local engine with realistic sample jobs"
        );
      }
    }
    init();
  }, []);

  // Update Status (Drag and Drop or Selector)
  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    const target = applications.find((a) => a.id === id);
    if (!target || target.status === newStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await apiService.updateStatus(id, newStatus, isBackendOnline);

      if (res.reminderScheduled) {
        addToast(
          "success",
          "🎉 Application Moved to Offer Stage!",
          "BullMQ background job scheduled: 24h follow-up reminder to submit CV & paperwork."
        );
      } else {
        addToast("info", `Moved to ${newStatus}`, `${target.companyName} application updated`);
      }
    } catch {
      addToast("error", "Failed to update status", "Reverting state");
      // Revert if error
      const fresh = await apiService.getApplications(isBackendOnline);
      setApplications(fresh);
    }
  };

  // Save Application (Create or Edit)
  const handleSaveApplication = async (
    data: Omit<Application, "id" | "appliedAt" | "updatedAt">
  ) => {
    if (editingApplication) {
      try {
        const updated = await apiService.updateApplication(
          editingApplication.id,
          data,
          isBackendOnline
        );
        setApplications((prev) =>
          prev.map((app) => (app.id === updated.id ? updated : app))
        );
        addToast("success", "Application Updated", `${updated.companyName} details saved`);
      } catch {
        addToast("error", "Update Failed", "Could not save application changes");
      }
    } else {
      try {
        const created = await apiService.createApplication(data, isBackendOnline);
        setApplications((prev) => [created, ...prev]);
        addToast(
          "success",
          "Application Added",
          `${created.companyName} added to your pipeline`
        );
      } catch {
        addToast("error", "Creation Failed", "Could not add application");
      }
    }
  };

  // Delete Application
  const handleDeleteApplication = async (id: string) => {
    const target = applications.find((a) => a.id === id);
    try {
      await apiService.deleteApplication(id, isBackendOnline);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      addToast("info", "Application Deleted", `${target?.companyName || "Job"} removed`);
    } catch {
      addToast("error", "Delete Failed", "Could not delete application");
    }
  };

  // Quick Add
  const handleQuickAdd = (status: Status) => {
    setEditingApplication(null);
    setQuickAddStatus(status);
    setIsAppModalOpen(true);
  };

  // Edit Trigger
  const handleEditApplication = (app: Application) => {
    setEditingApplication(app);
    setIsAppModalOpen(true);
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (window.confirm("Reset applications to default sample jobs?")) {
      const reset = apiService.resetLocalData();
      setApplications(reset);
      addToast("info", "Reset Completed", "Default demo applications restored");
    }
  };

  // Export Data
  const handleExportData = (format: "csv" | "json") => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(applications, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `job-applications-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("success", "Exported JSON", `${applications.length} applications exported`);
    } else {
      const headers = [
        "Company",
        "Title",
        "Status",
        "Priority",
        "Location",
        "Salary",
        "Tags",
        "URL",
        "AppliedAt",
      ];
      const rows = applications.map((a) => [
        `"${a.companyName.replace(/"/g, '""')}"`,
        `"${a.jobTitle.replace(/"/g, '""')}"`,
        a.status,
        a.priority,
        `"${(a.location || "").replace(/"/g, '""')}"`,
        `"${(a.salary || "").replace(/"/g, '""')}"`,
        `"${(a.tags || "").replace(/"/g, '""')}"`,
        `"${(a.url || "").replace(/"/g, '""')}"`,
        a.appliedAt || "",
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("success", "Exported CSV", `${applications.length} applications exported`);
    }
  };

  // Compute stats
  const stats = useMemo(() => apiService.calculateStats(applications), [applications]);

  // Filter & Sort
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status Filter
        if (statusFilter !== "ALL" && app.status !== statusFilter) return false;

        // Priority Filter
        if (priorityFilter !== "ALL" && app.priority !== priorityFilter) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCompany = app.companyName.toLowerCase().includes(q);
          const matchTitle = app.jobTitle.toLowerCase().includes(q);
          const matchLoc = (app.location || "").toLowerCase().includes(q);
          const matchTags = (app.tags || "").toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchLoc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "company") return a.companyName.localeCompare(b.companyName);
        if (sortBy === "priority") {
          const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (rank[b.priority || "MEDIUM"] || 2) - (rank[a.priority || "MEDIUM"] || 2);
        }
        // Default: newest date applied
        const dateA = new Date(a.appliedAt || 0).getTime();
        const dateB = new Date(b.appliedAt || 0).getTime();
        return dateB - dateA;
      });
  }, [applications, statusFilter, priorityFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <Header
        isBackendOnline={isBackendOnline}
        onOpenNewModal={() => {
          setEditingApplication(null);
          setQuickAddStatus("WAITING");
          setIsAppModalOpen(true);
        }}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex-1 w-full">
        {/* KPI Metrics */}
        <MetricsBar stats={stats} />

        {/* Search, Filter & Controls Bar */}
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          totalFiltered={filteredApplications.length}
          totalAll={applications.length}
          onClearFilters={() => {
            setSearchQuery("");
            setStatusFilter("ALL");
            setPriorityFilter("ALL");
            setSortBy("date");
          }}
        />

        {/* Kanban Board */}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading applications...</span>
          </div>
        ) : (
          <KanbanBoard
            applications={filteredApplications}
            onUpdateStatus={handleUpdateStatus}
            onEditApplication={handleEditApplication}
            onDeleteApplication={handleDeleteApplication}
            onQuickAdd={handleQuickAdd}
          />
        )}
      </main>

      {/* Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSubmit={handleSaveApplication}
        initialData={editingApplication}
        defaultStatus={quickAddStatus}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={stats}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
