
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// GET all assignments
router.get("/", async (req, res) => {
  try {
    console.log("Fetching assignments from MongoDB...");

    const assignments = await Assignment.find().sort({ dueDate: 1 });

    console.log("Assignments fetched:", assignments.length);
    res.status(200).json(assignments);
  } catch (error) {
    console.error("GET assignments error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET one assignment
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ message: "Invalid assignment ID" });
  }
});

// CREATE an assignment
router.post("/", async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE an assignment
router.put("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an assignment
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid assignment ID" });
  }
});

module.exports = router;
