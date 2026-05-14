import { StringifyOptions } from "querystring";

export interface ProjectFileDto {
    id: string;
    name: string;
    size: string;
    icon: string;
    iconBgClass: string;
    iconColorClass: string;
    url: string; // URL presignada do S3
}
