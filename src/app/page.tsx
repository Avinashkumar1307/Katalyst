"use client";

import { useState, useEffect } from "react";
import { CalendarData } from "@/types";
import MeetingCard from "@/components/MeetingCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import LoginPage from "@/components/LoginPage";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMeetings();
    }
  }, [isAuthenticated]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/meetings");

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchMeetings} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Logged in as: {user?.email}
              </p>
              <button
                onClick={logout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Katalyst Calendar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered meeting insights from your Google Calendar
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upcoming Meetings */}
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-2">📅</span> Upcoming Meetings
              </h2>
              {calendarData?.upcoming && calendarData.upcoming.length > 0 ? (
                <div className="space-y-4">
                  {calendarData.upcoming.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} type="upcoming" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No upcoming meetings found
                </p>
              )}
            </div>
          </section>

          {/* Past Meetings */}
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-2">📋</span> Past Meetings
              </h2>
              {calendarData?.past && calendarData.past.length > 0 ? (
                <div className="space-y-4">
                  {calendarData.past.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} type="past" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No past meetings found
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
