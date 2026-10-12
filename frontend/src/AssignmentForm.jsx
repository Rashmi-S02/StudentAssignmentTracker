
import { useState, useEffect } from "react";

export default function AssignmentForm({
  onAdd,
  onCancel,
  initialData,
  onUpdate,
}) {
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        subject: initialData.subject || "",
        description: initialData.description || "",
        dueDate: initialData.dueDate || "",
        priority: initialData.priority || "Medium",
        status: initialData.status || "Pending",
      });
    }
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.dueDate
    ) {
      setError("Please fill in the title, subject and due date.");
      return;
    }

    setError("");

    if (isEditing) {
      onUpdate({
        ...form,
        id: initialData.id,
      });
    } else {
      onAdd({
        ...form,
        id: crypto.randomUUID(),
      });
    }
  }

  return (
    <div className="form-panel">
      <h2>{isEditing ? "Edit Assignment" : "Add New Assignment"}</h2>

      <p className="form-description">
        {isEditing
          ? "Update your assignment details below."
          : "Enter your assignment details below."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Assignment Title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Java Programming Assignment"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            id="subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Java"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your assignment..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button type="submit" className="primary-btn">
            {isEditing ? "Update Assignment" : "Save Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
