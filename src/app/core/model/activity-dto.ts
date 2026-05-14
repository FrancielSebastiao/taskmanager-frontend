export interface ActivityDto {
    id: string;
    text: string;
    userName: string;
    timeRelative: string; // "Há 2 horas", "Ontem"
    markerClass: string; // "marker--green", "marker--blue"
}
