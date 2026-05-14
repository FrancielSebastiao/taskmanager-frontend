import { TodayEventDto } from "./today-event-dto";
import { UpcomingDayDto } from "./upcoming-day-dto";

export interface CalendarTodayResponse {
    today: string;
    todayEvents: TodayEventDto[];
    upcomingDays: UpcomingDayDto[];
}
