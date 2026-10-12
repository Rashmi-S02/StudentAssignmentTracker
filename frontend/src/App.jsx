
import { useEffect, useState } from "react";
import AssignmentForm from "./AssignmentForm";
import api from "./api";
import "./App.css";

function normalizeAssignment(item) {
  return {
    ...item,
    id: item._id || item.id,
    dueDate: String(item.dueDate).slice(0, 10),
  };
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [assignments, setAssignments] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAssignments() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/assignments");
      setAssignments(response.data.map(normalizeAssignment));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load assignments. Check whether the backend and MongoDB are running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  async function addAssignment(assignment) {
    setError("");

    try {
      const response = await api.post("/assignments", assignment);
      setAssignments((previous) => [
        ...previous,
        normalizeAssignment(response.data),
      ]);
      setActivePage("My Assignments");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save the assignment."
      );
    }
  }

  function editAssignment(assignment) {
    setEditingAssignment(assignment);
    setActivePage("Edit Assignment");
  }

  async function updateAssignment(updatedAssignment) {
    const id = updatedAssignment._id || updatedAssignment.id;
    setError("");

    try {
      const response = await api.put(`/assignments/${id}`, updatedAssignment);
      const savedAssignment = normalizeAssignment(response.data);

      setAssignments((previous) =>
        previous.map((item) => (item.id === id ? savedAssignment : item))
      );

      setEditingAssignment(null);
      setActivePage("My Assignments");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update the assignment."
      );
    }
  }

  async function deleteAssignment(id) {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    setError("");

    try {
      await api.delete(`/assignments/${id}`);
      setAssignments((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete the assignment."
      );
    }
  }

  async function updateStatus(id, status) {
    const item = assignments.find((assignment) => assignment.id === id);
    if (!item) return;

    setError("");

    try {
      const response = await api.put(`/assignments/${id}`, {
        ...item,
        status,
      });

      const savedAssignment = normalizeAssignment(response.data);

      setAssignments((previous) =>
        previous.map((assignment) =>
          assignment.id === id ? savedAssignment : assignment
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update the assignment status."
      );
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pending = assignments.filter(
    (item) => item.status === "Pending"
  ).length;

  const completed = assignments.filter(
    (item) => item.status === "Completed"
  ).length;

  const overdue = assignments.filter((item) => {
    const due = new Date(item.dueDate + "T00:00:00");
    return item.status !== "Completed" && due < today;
  }).length;

  const upcoming = assignments
    .filter((item) => {
      const due = new Date(item.dueDate + "T00:00:00");
      return item.status !== "Completed" && due >= today;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const filteredAssignments = assignments.filter((item) => {
    const searchMatch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "All" || item.status === statusFilter;

    const priorityMatch =
      priorityFilter === "All" || item.priority === priorityFilter;

    return searchMatch && statusMatch && priorityMatch;
  });

  const menuItems = [
    "Dashboard",
    "My Assignments",
    "Add Assignment",
    "Upcoming Deadlines",
  ];

  function openPage(page) {
    setEditingAssignment(null);
    setActivePage(page);
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📚</span>
          <div>
            <h2>TaskTrack</h2>
            <p>Student Workspace</p>
          </div>
        </div>

        <p className="menu-label">MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => openPage(item)}
            >
              <span>
                {item === "Dashboard"
                  ? "▦"
                  : item === "My Assignments"
                  ? "☷"
                  : item === "Add Assignment"
                  ? "+"
                  : "◷"}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Stay organized.</p>
          <p>Finish strong! ✨</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Student Workspace / {activePage}</p>
            <h1>{activePage}</h1>
          </div>
          <button
            className="primary-btn"
            onClick={() => openPage("Add Assignment")}
          >
            + Add Assignment
          </button>
        </header>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <section className="panel">
            <p>Loading assignments...</p>
          </section>
        ) : (
          <>
            {activePage === "Dashboard" && (
              <>
                <section className="welcome">
                  <div>
                    <p className="welcome-tag">YOUR PERSONAL WORKSPACE</p>
                    <h2>Welcome back! 👋</h2>
                    <p>
                      Keep track of your assignments and stay ahead of deadlines.
                    </p>
                  </div>
                  <div className="welcome-icon">🎓</div>
                </section>

                <section className="stats-grid">
                  <StatCard title="Total Assignments" value={assignments.length} icon="📚" />
                  <StatCard title="Pending" value={pending} icon="⏳" />
                  <StatCard title="Completed" value={completed} icon="✅" />
                  <StatCard title="Overdue" value={overdue} icon="⚠️" />
                </section>

                <section className="content-grid">
                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Recent Assignments</h2>
                        <p>Your latest tasks</p>
                      </div>
                      <button
                        className="text-btn"
                        onClick={() => openPage("My Assignments")}
                      >
                        View all →
                      </button>
                    </div>

                    {assignments.length === 0 ? (
                      <EmptyState message="No assignments yet. Add your first assignment!" />
                    ) : (
                      <div className="assignment-list">
                        {[...assignments].slice(-5).reverse().map((item) => (
                          <AssignmentRow
                            key={item.id}
                            item={item}
                            onEdit={editAssignment}
                            onDelete={deleteAssignment}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Upcoming Deadlines</h2>
                        <p>What needs your attention</p>
                      </div>
                    </div>

                    {upcoming.length === 0 ? (
                      <EmptyState message="No upcoming deadlines." />
                    ) : (
                      <div className="deadline-list">
                        {upcoming.slice(0, 5).map((item) => (
                          <div className="deadline-item" key={item.id}>
                            <div className="deadline-date">
                              {new Date(item.dueDate + "T00:00:00").toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" }
                              )}
                            </div>
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.subject}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activePage === "Add Assignment" && (
              <AssignmentForm
                onAdd={addAssignment}
                onCancel={() => setActivePage("Dashboard")}
              />
            )}

            {activePage === "Edit Assignment" && editingAssignment && (
              <AssignmentForm
                initialData={editingAssignment}
                onUpdate={updateAssignment}
                onAdd={addAssignment}
                onCancel={() => {
                  setEditingAssignment(null);
                  setActivePage("My Assignments");
                }}
              />
            )}

            {activePage === "My Assignments" && (
              <section className="panel assignments-panel">
                <div className="panel-heading">
                  <div>
                    <h2>My Assignments</h2>
                    <p>Manage, search and update your tasks.</p>
                  </div>
                  <span className="count-badge">
                    {filteredAssignments.length} assignments
                  </span>
                </div>

                <div className="assignment-filters">
                  <input
                    type="text"
                    placeholder="Search title or subject..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                    aria-label="Filter by priority"
                  >
                    <option value="All">All priorities</option>
                    <option value="Low">Low priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="High">High priority</option>
                  </select>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setPriorityFilter("All");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>

                {filteredAssignments.length === 0 ? (
                  <EmptyState message="No matching assignments found." />
                ) : (
                  <div className="assignment-list">
                    {filteredAssignments.map((item) => (
                      <div className="assignment-card" key={item.id}>
                        <div className="assignment-card-top">
                          <div>
                            <h3>{item.title}</h3>
                            <p className="assignment-subject">{item.subject}</p>
                          </div>
                          <span className={`priority-badge ${item.priority.toLowerCase()}`}>
                            {item.priority}
                          </span>
                        </div>

                        {item.description && (
                          <p className="assignment-description">{item.description}</p>
                        )}

                        <p className="due-date">
                          Due:{" "}
                          {new Date(item.dueDate + "T00:00:00").toLocaleDateString(
                            "en-IN"
                          )}
                        </p>

                        <div className="assignment-card-bottom">
                          <select
                            value={item.status}
                            onChange={(event) =>
                              updateStatus(item.id, event.target.value)
                            }
                            aria-label={`Status for ${item.title}`}
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>

                          <div className="assignment-actions">
                            <button
                              className="secondary-btn"
                              onClick={() => editAssignment(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteAssignment(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activePage === "Upcoming Deadlines" && (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Upcoming Deadlines</h2>
                    <p>Assignments that are not completed yet.</p>
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <EmptyState message="You have no upcoming deadlines." />
                ) : (
                  <div className="assignment-list">
                    {upcoming.map((item) => (
                      <AssignmentRow
                        key={item.id}
                        item={item}
                        onEdit={editAssignment}
                        onDelete={deleteAssignment}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <h2>{value}</h2>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <span>📋</span>
      <p>{message}</p>
    </div>
  );
}

function AssignmentRow({ item, onEdit, onDelete }) {
  return (
    <div className="assignment-row">
      <div className="assignment-row-icon">📝</div>
      <div className="assignment-row-info">
        <strong>{item.title}</strong>
        <p>
          {item.subject} · Due{" "}
          {new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-IN")}
        </p>
      </div>
      <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
        {item.status}
      </span>
      <div className="assignment-actions">
        <button className="secondary-btn" onClick={() => onEdit(item)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
