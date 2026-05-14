import { CalendarEventDto } from "./calendar-event-dto";

export interface CalendarMonthResponse {
    year: number;
    month: number;
    eventsByDay: { [date: string]: CalendarEventDto[] };
}
