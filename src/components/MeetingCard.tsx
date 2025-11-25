import { Meeting } from "@/types";
import { format, parseISO } from "date-fns";

interface MeetingCardProps {
  meeting: Meeting;
  type: "upcoming" | "past";
}

export default function MeetingCard({ meeting, type }: MeetingCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className={`border-l-4 ${
        type === "upcoming"
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-400 bg-gray-50 dark:bg-gray-700/20"
      } rounded-r-lg p-4 hover:shadow-md transition-shadow`}
    >
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
        {meeting.title || "No Title"}
      </h3>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-start">
          <span className="font-medium mr-2">🕒</span>
          <div>
            <div>{formatDate(meeting.start)}</div>
            {meeting.duration > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Duration: {formatDuration(meeting.duration)}
              </div>
            )}
          </div>
        </div>

        {meeting.attendees && meeting.attendees.length > 0 && (
          <div className="flex items-start">
            <span className="font-medium mr-2">👥</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? "s" : ""}
              </div>
              <div className="flex flex-wrap gap-1">
                {meeting.attendees.slice(0, 3).map((attendee, index) => (
                  <span
                    key={index}
                    className="inline-block bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {attendee}
                  </span>
                ))}
                {meeting.attendees.length > 3 && (
                  <span className="inline-block bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    +{meeting.attendees.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {meeting.description && (
          <div className="flex items-start">
            <span className="font-medium mr-2">📝</span>
            <p className="flex-1 text-xs line-clamp-2">{meeting.description}</p>
          </div>
        )}

        {type === "past" && meeting.aiSummary && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-start">
              <span className="font-medium mr-2">🤖</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                  AI Summary
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {meeting.aiSummary}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
