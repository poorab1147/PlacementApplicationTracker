import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const statusOptions = [
  "Applied",
  "Online Assessment",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const priorityOptions = ["Low", "Medium", "High"];

const emptyInterview = {
  round_name: "",
  interview_type: "Online",
  scheduled_at: "",
  interviewer: "",
  result: "Pending",
  notes: "",
};

export default function ApplicationDetails() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingApplication, setEditingApplication] = useState(false);
  const [savingApplication, setSavingApplication] = useState(false);

  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterview);
  const [savingInterview, setSavingInterview] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [applicationForm, setApplicationForm] = useState({
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
  });

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [
          applicationResponse,
          interviewsResponse,
          documentsResponse,
        ] = await Promise.all([
          api.get(`/api/applications/${applicationId}`),
          api.get(`/api/applications/${applicationId}/interviews`),
          api.get(`/api/applications/${applicationId}/documents`),
        ]);

        if (cancelled) {
          return;
        }

        const app = applicationResponse.data;

        setApplication(app);
        setInterviews(interviewsResponse.data);
        setDocuments(documentsResponse.data);

        setApplicationForm({
          company_name: app.company_name || "",
          job_title: app.job_title || "",
          job_type: app.job_type || "",
          location: app.location || "",
          application_url: app.application_url || "",
          status: app.status || "Applied",
          priority: app.priority || "Medium",
          applied_date: app.applied_date || "",
          deadline: app.deadline || "",
          salary_range: app.salary_range || "",
          notes: app.notes || "",
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Application details error:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load application details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const handleApplicationChange = (event) => {
    const { name, value } = event.target;

    setApplicationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplicationUpdate = async (event) => {
    event.preventDefault();

    try {
      setSavingApplication(true);
      setError("");

      const response = await api.put(
        `/api/applications/${applicationId}`,
        {
          ...applicationForm,
          application_url:
            applicationForm.application_url || null,
          job_type: applicationForm.job_type || null,
          location: applicationForm.location || null,
          applied_date: applicationForm.applied_date || null,
          deadline: applicationForm.deadline || null,
          salary_range: applicationForm.salary_range || null,
          notes: applicationForm.notes || null,
        }
      );

      setApplication(response.data);
      setEditingApplication(false);
    } catch (err) {
      console.error("Application update error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update application."
      );
    } finally {
      setSavingApplication(false);
    }
  };

  const handleInterviewChange = (event) => {
    const { name, value } = event.target;

    setInterviewForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddInterview = () => {
    setEditingInterviewId(null);
    setInterviewForm(emptyInterview);
    setShowInterviewForm(true);
  };

  const openEditInterview = (interview) => {
    setEditingInterviewId(interview.id);

    setInterviewForm({
      round_name: interview.round_name || "",
      interview_type: interview.interview_type || "",
      scheduled_at: interview.scheduled_at
        ? interview.scheduled_at.slice(0, 16)
        : "",
      interviewer: interview.interviewer || "",
      result: interview.result || "",
      notes: interview.notes || "",
    });

    setShowInterviewForm(true);
  };

  const cancelInterviewForm = () => {
    setShowInterviewForm(false);
    setEditingInterviewId(null);
    setInterviewForm(emptyInterview);
  };

  const handleInterviewSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingInterview(true);
      setError("");

      const payload = {
        ...interviewForm,
        interview_type:
          interviewForm.interview_type || null,
        scheduled_at: interviewForm.scheduled_at
          ? new Date(
              interviewForm.scheduled_at
            ).toISOString()
          : null,
        interviewer: interviewForm.interviewer || null,
        result: interviewForm.result || null,
        notes: interviewForm.notes || null,
      };

      if (editingInterviewId) {
        await api.put(
          `/api/applications/${applicationId}/interviews/${editingInterviewId}`,
          payload
        );
      } else {
        await api.post(
          `/api/applications/${applicationId}/interviews`,
          payload
        );
      }

      cancelInterviewForm();

      const response = await api.get(
        `/api/applications/${applicationId}/interviews`
      );

      setInterviews(response.data);
    } catch (err) {
      console.error("Interview save error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to save interview."
      );
    } finally {
      setSavingInterview(false);
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/applications/${applicationId}/interviews/${interviewId}`
      );

      setInterviews((previous) =>
        previous.filter(
          (interview) => interview.id !== interviewId
        )
      );
    } catch (err) {
      console.error("Interview delete error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete interview."
      );
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("document_type", "Resume");
      formData.append("file", file);

      await api.post(
        `/api/applications/${applicationId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const response = await api.get(
        `/api/applications/${applicationId}/documents`
      );

      setDocuments(response.data);
    } catch (err) {
      console.error("Document upload error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to upload document."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDownloadDocument = async (documentItem) => {
    try {
      setError("");

      const response = await api.get(
        `/api/applications/${applicationId}/documents/${documentItem.id}`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        response.data
      );

      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download = documentItem.original_filename;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Document download error:", err);

      setError("Failed to download document.");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/applications/${applicationId}/documents/${documentId}`
      );

      setDocuments((previous) =>
        previous.filter(
          (documentItem) => documentItem.id !== documentId
        )
      );
    } catch (err) {
      console.error("Document delete error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete document."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-8 py-6 shadow-sm">
          <p className="text-slate-600">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Application not found
          </h1>

          <Link
            to="/applications"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Placement Tracker
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Application Details
            </p>
          </div>

          <Link
            to="/applications"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ← Applications
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!editingApplication ? (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-4xl font-bold text-slate-900">
                  {application.company_name}
                </h2>

                <p className="mt-3 text-2xl text-slate-600">
                  {application.job_title}
                </p>

                {application.location && (
                  <p className="mt-3 text-slate-500">
                    📍 {application.location}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                  {application.status}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    application.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : application.priority === "Low"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {application.priority} Priority
                </span>

                <button
                  onClick={() =>
                    setEditingApplication(true)
                  }
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Job Type"
                value={application.job_type}
              />

              <InfoItem
                label="Applied Date"
                value={application.applied_date}
              />

              <InfoItem
                label="Deadline"
                value={application.deadline}
              />

              <InfoItem
                label="Salary Range"
                value={application.salary_range}
              />
            </div>

            {application.application_url && (
              <div className="mt-8">
                <a
                  href={application.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Open Job Posting →
                </a>
              </div>
            )}

            {application.notes && (
              <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="font-semibold text-slate-900">
                  Notes
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-slate-600">
                  {application.notes}
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Edit Application
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your application information.
              </p>
            </div>

            <form
              onSubmit={handleApplicationUpdate}
              className="grid gap-5 md:grid-cols-2"
            >
              <FormInput
                label="Company Name"
                name="company_name"
                value={applicationForm.company_name}
                onChange={handleApplicationChange}
                required
              />

              <FormInput
                label="Job Title"
                name="job_title"
                value={applicationForm.job_title}
                onChange={handleApplicationChange}
                required
              />

              <FormInput
                label="Job Type"
                name="job_type"
                value={applicationForm.job_type}
                onChange={handleApplicationChange}
              />

              <FormInput
                label="Location"
                name="location"
                value={applicationForm.location}
                onChange={handleApplicationChange}
              />

              <FormInput
                label="Job Posting URL"
                name="application_url"
                type="url"
                value={applicationForm.application_url}
                onChange={handleApplicationChange}
              />

              <FormInput
                label="Salary Range"
                name="salary_range"
                value={applicationForm.salary_range}
                onChange={handleApplicationChange}
              />

              <FormSelect
                label="Status"
                name="status"
                value={applicationForm.status}
                onChange={handleApplicationChange}
                options={statusOptions}
              />

              <FormSelect
                label="Priority"
                name="priority"
                value={applicationForm.priority}
                onChange={handleApplicationChange}
                options={priorityOptions}
              />

              <FormInput
                label="Applied Date"
                name="applied_date"
                type="date"
                value={applicationForm.applied_date}
                onChange={handleApplicationChange}
              />

              <FormInput
                label="Deadline"
                name="deadline"
                type="date"
                value={applicationForm.deadline}
                onChange={handleApplicationChange}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={applicationForm.notes}
                  onChange={handleApplicationChange}
                  rows="5"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={savingApplication}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingApplication
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingApplication(false)
                  }
                  className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Interviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track every interview round.
              </p>
            </div>

            {!showInterviewForm && (
              <button
                onClick={openAddInterview}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                + Add Interview
              </button>
            )}
          </div>

          {showInterviewForm && (
            <form
              onSubmit={handleInterviewSubmit}
              className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {editingInterviewId
                  ? "Edit Interview"
                  : "Add Interview"}
              </h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FormInput
                  label="Round Name"
                  name="round_name"
                  value={interviewForm.round_name}
                  onChange={handleInterviewChange}
                  placeholder="Technical Round 1"
                  required
                />

                <FormInput
                  label="Interview Type"
                  name="interview_type"
                  value={interviewForm.interview_type}
                  onChange={handleInterviewChange}
                  placeholder="Online / Offline / HR"
                />

                <FormInput
                  label="Scheduled At"
                  name="scheduled_at"
                  type="datetime-local"
                  value={interviewForm.scheduled_at}
                  onChange={handleInterviewChange}
                />

                <FormInput
                  label="Interviewer"
                  name="interviewer"
                  value={interviewForm.interviewer}
                  onChange={handleInterviewChange}
                  placeholder="Interviewer name"
                />

                <FormInput
                  label="Result"
                  name="result"
                  value={interviewForm.result}
                  onChange={handleInterviewChange}
                  placeholder="Pending / Passed / Rejected"
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={interviewForm.notes}
                    onChange={handleInterviewChange}
                    rows="4"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={savingInterview}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingInterview
                    ? "Saving..."
                    : editingInterviewId
                      ? "Update Interview"
                      : "Add Interview"}
                </button>

                <button
                  type="button"
                  onClick={cancelInterviewForm}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            {interviews.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">
                <p className="text-slate-500">
                  No interviews added yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {interview.round_name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {interview.interview_type && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                              {interview.interview_type}
                            </span>
                          )}

                          {interview.result && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {interview.result}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            openEditInterview(interview)
                          }
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteInterview(interview.id)
                          }
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        label="Scheduled"
                        value={
                          interview.scheduled_at
                            ? new Date(
                                interview.scheduled_at
                              ).toLocaleString()
                            : "-"
                        }
                      />

                      <InfoItem
                        label="Interviewer"
                        value={interview.interviewer}
                      />

                      <InfoItem
                        label="Result"
                        value={interview.result}
                      />
                    </div>

                    {interview.notes && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">
                          Notes
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {interview.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload PDF files related to this application.
              </p>
            </div>

            <label className="cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700">
              {uploading ? "Uploading..." : "+ Upload PDF"}

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleDocumentUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-6">
            {documents.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">
                <p className="text-slate-500">
                  No documents uploaded yet.
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  PDF files only, maximum 5 MB.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((documentItem) => (
                  <div
                    key={documentItem.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {documentItem.original_filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {documentItem.document_type} •{" "}
                        {(documentItem.file_size / 1024).toFixed(
                          1
                        )}{" "}
                        KB
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDownloadDocument(
                            documentItem
                          )
                        }
                        className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Download
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteDocument(
                            documentItem.id
                          )
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
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
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function FormSelect({
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
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}