import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsResponse,
          deadlinesResponse,
          interviewsResponse,
        ] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/upcoming-deadlines"),
          api.get("/api/dashboard/upcoming-interviews"),
        ]);

        setStats(statsResponse.data);
        setDeadlines(deadlinesResponse.data);
        setInterviews(interviewsResponse.data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="rounded-xl bg-white px-8 py-6 shadow-sm">
          <p className="text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

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
              Welcome, {user?.full_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/applications"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Applications
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-slate-500">
            Track your placement applications, interviews and offers.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={stats?.total_applications ?? 0}
          />

          <StatCard
            title="Interviews"
            value={stats?.interviews ?? 0}
          />

          <StatCard
            title="Offers"
            value={stats?.offers ?? 0}
          />

          <StatCard
            title="Rejections"
            value={stats?.rejections ?? 0}
          />
        </div>

        {/* Status + Deadlines */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Applications by status */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Applications by Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current application pipeline
                </p>
              </div>

              <Link
                to="/applications"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {Object.entries(
                stats?.applications_by_status || {}
              ).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                >
                  <span className="font-medium text-slate-700">
                    {status}
                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {count}
                  </span>
                </div>
              ))}

              {!Object.keys(
                stats?.applications_by_status || {}
              ).length && (
                <p className="text-sm text-slate-500">
                  No applications yet.
                </p>
              )}
            </div>
          </section>

          {/* Upcoming deadlines */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Upcoming Deadlines
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Deadlines within the next 7 days
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {deadlines.map((application) => (
                <div
                  key={application.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {application.company_name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {application.job_title}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-sm font-medium text-red-600">
                      {application.deadline}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {application.status}
                    </span>

                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs text-orange-700">
                      {application.priority}
                    </span>
                  </div>
                </div>
              ))}

              {!deadlines.length && (
                <p className="text-sm text-slate-500">
                  No upcoming deadlines.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Upcoming interviews */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Upcoming Interviews
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your scheduled interview rounds
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            {interviews.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 font-medium text-slate-500">
                      Company
                    </th>

                    <th className="pb-3 font-medium text-slate-500">
                      Role
                    </th>

                    <th className="pb-3 font-medium text-slate-500">
                      Round
                    </th>

                    <th className="pb-3 font-medium text-slate-500">
                      Type
                    </th>

                    <th className="pb-3 font-medium text-slate-500">
                      Scheduled
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {interviews.map((interview, index) => (
                    <tr
                      key={`${interview.company_name}-${index}`}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 font-medium text-slate-900">
                        {interview.company_name}
                      </td>

                      <td className="py-4 text-slate-600">
                        {interview.job_title}
                      </td>

                      <td className="py-4 text-slate-600">
                        {interview.round_name}
                      </td>

                      <td className="py-4 text-slate-600">
                        {interview.interview_type || "-"}
                      </td>

                      <td className="py-4 text-slate-600">
                        {interview.scheduled_at
                          ? new Date(
                              interview.scheduled_at
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-lg bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">
                  No upcoming interviews.
                </p>

                <Link
                  to="/applications"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Manage applications
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}