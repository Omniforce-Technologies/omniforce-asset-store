import {IsEnum, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {AbstractDto} from "../abstract.dto";
import {LangEnum} from "../../enum/lang.enum";

export class AssetTranslateDto extends AbstractDto {
    @ApiProperty({
        description: "The original language title of an asset",
        title: "Title",
        type: String,
        required: true,
        example: "Mesh Baker"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "The original language description of an asset",
        title: "Description",
        type: String,
        required: true,
        example: "Improve performance! Combine meshes and materials to reduce batches!\n" +
            "Mesh Baker is a powerful toolkit of flexible non-destructive workflows for optimizing props and scenes."
    })
    @IsString()
    desc: string;

    @ApiProperty({
        description: "Language name of the specific asset",
        title: "ru-RU, ua-UA, en-EN",
        type: String,
        required: true,
        example: "ru-RU"
    })
    @IsString()
    @IsEnum(LangEnum)
    language: LangEnum
}