import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsString} from "class-validator";
import {AbstractDto} from "../abstract.dto";

export class UserDto extends AbstractDto {
    @ApiProperty({
        description: "User id contains in auth0 database",
        title: "User auth0 ID",
        type: String,
        required: true,
        example: "google-oauth2|102336369590118977236"
    })
    auth0_sub: string;

    @ApiProperty({
        description: "The user avatar",
        title: "Avatar",
        type: String,
        example: 'https://asset-store-user-images.s3.eu-north-1.amazonaws.com/test.jpg'
    })
    @IsNumber()
    public avatar: string

    @ApiProperty({
        description: "The user nickname",
        title: "Nickname",
        type: String,
        required: true,
        example: "Xepobopa"
    })
    @IsString()
    nickname: string;

    @ApiProperty({
        description: "The user description",
        title: "Description",
        type: String,
        required: true,
        example: "Description"
    })
    @IsString()
    desc: string;
}
