import React from "react";
import {
  ADD_BUTTON,
  EMPTY_STATE,
  FILTER_LABELS,
  FILTER_OPTIONS,
  FILTER_WRAPPER,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  SELECT_CLASSES,
  STAT_CARD,
  STATS,
  STATS_GRID,
  TAB_ACTIVE,
  TAB_BASE,
  TAB_INACTIVE,
  TABS_WRAPPER,
  VALUE_CLASS,
  WRAPPER,
} from "../assets/dummy";
import { CalendarIcon, Filter, HomeIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import TaskItem from "../components/TaskItem";
import TaskModal from "../components/TaskModal";
import axios from "axios";
import { useCallback } from "react";

const API_BASE = "https://task-manager-app-i6q1.onrender.com/api/v1/tasks";

const DashBoard = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [showModel, setShowModel] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(
    () => ({
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low")
        .length,
      mediumPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "medium"
      ).length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high")
        .length,
      completed: tasks.filter(
        (t) =>
          t.completed === true ||
          t.completed === 1 ||
          (typeof t.completed === "string" &&
            t.completed.toLowerCase() === "yes")
      ).length,
    }),
    [tasks]
  );

  //filter task
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        switch (filter) {
          case "today":
            return dueDate.toDateString() === today.toDateString();
          case "week":
            return dueDate >= today && dueDate <= nextWeek;
          case "high":
          case "medium":
          case "low":
            return task.priority?.toLowerCase() === filter;
          default:
            return true;
        }
      }),
    [tasks, filter]
  );

  //saving tasks
  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        if (taskData.id)
          await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData);
        refreshTasks();
        setShowModel(false);
        setSelectedTask(null);
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    },
    [refreshTasks]
  );

  return (
    <div className={WRAPPER}>
      {/* header */}
      <div className={HEADER}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Over View</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">
            Manage Your Tasks Effeciently
          </p>
        </div>
        <button onClick={() => setShowModel(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add new Task
        </button>
      </div>

      {/* stats */}

      <div className={STATS_GRID}>
        {STATS.map(
          ({
            key,
            label,
            icon: Icon,
            iconColor,
            borderColor = "border-purple-100",
            valueKey,
            textColor,
            gradient,
          }) => (
            <div key={key} className={`${STAT_CARD} ${borderColor}`}>
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${iconColor}`}>
                  <Icon className="w- h-4 md:w-5 md:h-5" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`${VALUE_CLASS} ${
                      gradient
                        ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
                        : textColor
                    }`}
                  >
                    {stats[valueKey]}
                  </p>
                  <p className={LABEL_CLASS}>{label}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* contents */}
      <div className="space-y-6">
        {/* filter */}
        <div className={FILTER_WRAPPER}>
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              {FILTER_LABELS[filter]}
            </h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={SELECT_CLASSES}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`${TAB_BASE} ${
                  filter === opt ? TAB_ACTIVE : TAB_INACTIVE
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* task list */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}>
                <CalendarIcon className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === "all"
                  ? "Create your first task to get started"
                  : "No tasks match this filter"}
              </p>
              <button
                onClick={() => setShowModel(true)}
                className={EMPTY_STATE.btn}
              >
                Add new Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {
                  selectedTask(task);
                  setShowModel(true);
                }}
              />
            ))
          )}
        </div>

        {/* add task desktop */}
        <div
          onClick={() => setShowModel(true)}
          className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400  bg-purple-50/50 cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5 text-purple-500 mr-2" />
          <span className="text-gray-600 font-medium">Add New Task</span>
        </div>
      </div>

      {/* modal */}
      <TaskModal
        isOpen={showModel}
        onClose={() => {
          setShowModel(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default DashBoard;
