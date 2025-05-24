import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { Outlet } from "react-router";
import { useCallback } from "react";
import axios from "axios";
import { useMemo } from "react";
import { useEffect } from "react";
import { Circle, Clock, TrendingUp, Zap } from "lucide-react";

const Layout = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No Auth Token Found");
      const { data } = await axios.get(
        "https://task-manager-app-i6q1.onrender.com/api/v1/tasks/gp",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setTasks(arr);
    } catch (error) {
      console.log(error);
      setError(error.message || "could not load task");
      if (error.res?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length;

    const totalCount = tasks.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;
    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [tasks]);

  //statistics card

  const StatCard = ({ title, value, icon }) => (
    <div className="  p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 hover:border-purple-100 group">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-100">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            {value}
          </p>

          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  //Loading
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  //error
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md">
          <p className="font-medium mb-2">Error Loading Tasks</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again.
          </button>
        </div>
      </div>
    );

return (
  <div className="min-h-screen bg-gray-50">
    <Navbar user={user} onLogout={onLogout} />
    <Sidebar user={user} tasks={tasks} />

    <div className="ml-0 xl:ml-64 lg:ml-64 md:ml-64 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

        {/* Main Content Area */}
        <div className="flex-1 space-y-4">
          <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
        </div>

        {/* Task Statistics Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[360px] space-y-4 sm:space-y-6 flex-shrink-0">
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              Task Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <StatCard title="Total Tasks" value={stats.totalCount} icon={<Circle className="w-4 h-4 text-purple-500" />} />
              <StatCard title="Completed" value={stats.completedTasks} icon={<Circle className="w-4 h-4 text-green-500" />} />
              <StatCard title="Pending" value={stats.pendingCount} icon={<Circle className="w-4 h-4 text-fuchsia-500" />} />
              <StatCard title="Completion Rate" value={`${stats.completionPercentage}%`} icon={<Zap className="w-4 h-4 text-purple-500" />} />
            </div>

            <hr className="my-3 sm:my-4 border-purple-200" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-gray-700">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Circle className="w-3 h-3 text-purple-500 fill-purple-500" />
                  Task Progress
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {stats.completedTasks}/{stats.totalCount}
                </span>
              </div>
              <div className="relative">
                <div className="h-2 sm:h-3 bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500" style={{ width: `${stats.completionPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              Recent Activities
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task._id || task.id}
                  className="flex items-center justify-between p-3 hover:bg-purple-50/50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 break-words">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ml-2 ${task.completed ? "bg-green-100 text-green-700" : "bg-fuchsia-100 text-fuchsia-700"}`}>
                    {task.completed ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-6 px-2">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-md text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Tasks will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);


};

export default Layout;
