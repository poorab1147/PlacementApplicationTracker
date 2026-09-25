import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  company_name: "",
  job_title: "",
  job_type: "",
  location: "",
  application_url: "",
  status: "Applied",
  priority: "Medium",
  applied_date: "",
  deadline: "",
  salary_range: "",
  notes: "",
};

const statusOptions = [
  "Applied",
  "Online Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

const priorityOptions = [
  "Low",
  "Medium",
  "High",
];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Initial loading + filter changes.
   *
   * The asynchronous function is defined inside the effect
   * so the React hooks ESLint rules are satisfied.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchApplications = async () => {
      try {
        const params = {};

        if (search.trim()) {
          params.company = search.trim();
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        if (priorityFilter) {
          params.priority = priorityFilter;
        }

        const response = await api.get(
          "/api/applications",
          { params }
        );

        if (!cancelled) {
          setApplications(response.data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);

          setError(
            err.response?.data?.detail ||
              "Failed to load applications."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchApplications();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, priorityFilter]);

  /*
   * Manually reload applications after creating,
   * updating or deleting an application.
   */
  const loadApplications = async () => {
    try {
      setError("");

      const params = {};

      if (search.trim()) {
        params.company = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      const response = await api.get(
        "/api/applications",
        { params }
      );

      setApplications(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load applications."
      );
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const preparePayload = () => {
    return {
      company_name: form.company_name,
      job_title: form.job_title,
      job_type: form.job_type || null,
      location: form.location || null,
      application_url: form.application_url || null,
      status: form.status,
      priority: form.priority,
      applied_date: form.applied_date || null,
      deadline: form.deadline || null,
      salary_range: form.salary_range || null,
      notes: form.notes || null,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = preparePayload();

      if (editingId) {
        await api.put(
          `/api/applications/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/api/applications",
          payload
        );
      }

      resetForm();
      await loadApplications();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to save application."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (application) => {
    setEditingId(application.id);

    setForm({
      company_name: application.company_name || "",
      job_title: application.job_title || "",
      job_type: application.job_type || "",
      location: application.location || "",
      application_url:
        application.application_url || "",
      status: application.status || "Applied",
      priority: application.priority || "Medium",
      applied_date:
        application.applied_date || "",
      deadline:
        application.deadline || "",
      salary_range:
        application.salary_range || "",
      notes: application.notes || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (applicationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/applications/${applicationId}`
      );

      await loadApplications();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete application."
      );
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      Applied: "bg-blue-100 text-blue-700",
      "Online Assessment":
        "bg-purple-100 text-purple-700",
      Interview:
        "bg-yellow-100 text-yellow-700",
      Offer:
        "bg-green-100 text-green-700",
      Rejected:
        "bg-red-100 text-red-700",
    };

    return (
      classes[status] ||
      "bg-slate-100 text-slate-700"
    );
  };

  const getPriorityClass = (priority) => {
    const classes = {
      Low:
        "bg-slate-100 text-slate-600",
      Medium:
        "bg-orange-100 text-orange-700",
      High:
        "bg-red-100 text-red-700",
    };

    return (
      classes[priority] ||
      "bg-slate-100 text-slate-600"
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Placement Tracker
            </h1>

            <p className="text-sm text-slate-500">
              Application Management
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Applications
            </h2>

            <p className="mt-1 text-slate-500">
              Manage and track all your job applications.
            </p>
          </div>

          <button
            onClick={() => {
              setForm(initialForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + Add Application
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Company search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search Company
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="e.g. Deloitte"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={loadApplications}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  All statuses
                </option>

                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  All priorities
                </option>

                {priorityOptions.map((priority) => (
                  <option
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingId
                  ? "Edit Application"
                  : "Add Application"}
              </h3>

              <button
                onClick={resetForm}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              <Input
                label="Company Name"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                placeholder="Deloitte"
              />

              <Input
                label="Job Title"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                required
                placeholder="Software Engineer"
              />

              <Input
                label="Job Type"
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                placeholder="Full-time"
              />

              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Gurugram / Remote"
              />

              <Input
                label="Application URL"
                name="application_url"
                value={form.application_url}
                onChange={handleChange}
                placeholder="https://..."
                type="url"
              />

              <SelectInput
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={statusOptions}
              />

              <SelectInput
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                options={priorityOptions}
              />

              <Input
                label="Applied Date"
                name="applied_date"
                value={form.applied_date}
                onChange={handleChange}
                type="date"
              />

              <Input
                label="Deadline"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                type="date"
              />

              <Input
                label="Salary Range"
                name="salary_range"
                value={form.salary_range}
                onChange={handleChange}
                placeholder="₹6-10 LPA"
              />

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Add notes about this application..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Application"
                      : "Save Application"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applications */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Your Applications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {applications.length} application
              {applications.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-500">
                No applications found.
              </p>

              <button
                onClick={() => {
                  setForm(initialForm);
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="mt-4 font-medium text-blue-600 hover:text-blue-700"
              >
                Add your first application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Company
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Role
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Priority
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-600">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/applications/${application.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {application.company_name}
                        </Link>

                        {application.location && (
                          <p className="mt-1 text-xs text-slate-500">
                            {application.location}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {application.job_title}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                            application.priority
                          )}`}
                        >
                          {application.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {application.applied_date ||
                          "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleEdit(application)
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                application.id
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}