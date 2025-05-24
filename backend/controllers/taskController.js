import Task from "../models/taskModel.js"; // Add `.js` if using ES modules

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: completed === "Yes" || completed === true,
      owner: req.user.id,
    });

    const saved = await task.save();
    res.status(201).json({ success: true, task: saved });
  } catch (error) {
    console.error("Error in createTask:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
};

// Get all tasks for the logged-in user
export const getTask = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getTask:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
};

//get single task by id(must belong to that user)
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.json({ success: true, task });
  } catch (error) {
    console.error("Error in getTaskById:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error. Try again later." });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (data.completed !== undefined) {
      data.completed = data.completed === "Yes" || data.completed === true;
    }

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id }, // Filter
      data,                                       // Update
      { new: true, runValidators: true }          // Options
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you're not authorized",
      });
    }

    res.json({ success: true, task: updated });
  } catch (error) {
    console.error("Error in updateTask:", error.message);
    res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you're not authorized",
      });
    }

    res.json({ success: true, message: "Task deleted successfully." });

  } catch (error) {
    console.error("Error in deleteTask:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
