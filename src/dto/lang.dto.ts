import {IsOptional, IsString} from "class-validator";

export class LangDto {
    @IsString()
    @IsOptional()
    ru: string;

    @IsString()
    @IsOptional()
    ua: string;

    @IsString()
    @IsOptional()
    en: string;
}