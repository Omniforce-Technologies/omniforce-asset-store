import {AbstractDto} from "../abstract.dto";
import {IsOptional, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class NewsDto extends AbstractDto {
    @IsString()
    @ApiProperty({
        description: "Title of the news",
        title: "Title",
        type: String,
        required: true,
        example: "Add validation"
    })
    title: string;

    @IsString()
    @ApiProperty({
        description: "DeepVoice AI - Text To Voice",
        title: "Description",
        type: String,
        required: true,
        example: "DeepVoice is an ultra-realistic Text To Voice AI solution. This tool can create voices from text, trim, combine and equalize audio files. Choose from 95+ voices."
    })
    desc: string;

    @IsString()
    @ApiProperty({
        description: "Version of the news",
        title: "Version",
        type: String,
        required: true,
        example: "v1.4.2"
    })
    version: string;
}