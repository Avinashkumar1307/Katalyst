export interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: number;
  attendees: string[];
  description?: string;
  aiSummary?: string;
}

export interface CalendarData {
  upcoming: Meeting[];
  past: Meeting[];
}
