import {ApiProperty} from "@nestjs/swagger";

export class RoleResponseDto {
    @ApiProperty({
        description: "Id that auth0 returns",
        title: "Request auth0 ID",
        type: String,
        required: true,
        example: "rol_6ZXTRCfkuCTTlCFa"
    })
    id: String;

    @ApiProperty({
        description: "Roles name from auth0",
        title: "Roles name",
        type: String,
        required: true,
        example: "Admin"
    })
    name: String;

    @ApiProperty({
        description: "Roles name description from auth0",
        title: "Roles name description",
        type: String,
        required: true,
        example: "Has an ultimate access and control"
    })
    description: String;
}