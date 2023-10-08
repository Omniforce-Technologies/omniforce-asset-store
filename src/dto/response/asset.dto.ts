import { ApiProperty } from "@nestjs/swagger";

class User {
    @ApiProperty({ type: Number, example: 40 })
    id: number;

    @ApiProperty({ type: String, example: 'a745b28f-d514-4610-b669-566a699a8957' })
    uuid: string;

    @ApiProperty({ type: String, example: '2023-09-17T05:33:10.424Z' })
    createdAt: string;

    @ApiProperty({ type: String, example: '2023-09-17T05:33:11.211Z' })
    updatedAt: string;

    @ApiProperty({ type: String, example: 'Slava' })
    nickname: string;

    @ApiProperty({ type: String, example: 'https://omniforce-asset-store-user.cellar-c2.services.clever-cloud.com/Z' })
    avatar: string;

    @ApiProperty({ type: String, example: 'google-oauth2|102855339009854926851' })
    auth0_sub: string;

    @ApiProperty({ type: String, example: 'Description' })
    desc: string;
}

class Translation {
    @ApiProperty({ type: Number, example: 67 })
    id: number;

    @ApiProperty({ type: String, example: 'a8f14ddc-2c97-4b6a-bc45-0ee1344e4941' })
    uuid: string;

    @ApiProperty({ type: String, example: '2023-09-24T06:15:31.497Z' })
    createdAt: string;

    @ApiProperty({ type: String, example: '2023-09-24T06:15:31.497Z' })
    updatedAt: string;

    @ApiProperty({ type: String, example: 'ru' })
    language: string;

    @ApiProperty({ type: String, example: 'title' })
    title: string;

    @ApiProperty({ type: String, example: 'swadfsdf' })
    desc: string;
}

export class AssetResponseDto {
    @ApiProperty({ type: Number, example: 57 })
    id: number;

    @ApiProperty({ type: String, example: 'e30a5f83-6273-4fae-a1a4-71e6ab4b5b41' })
    uuid: string;

    @ApiProperty({ type: String, example: '2023-09-24T06:15:31.497Z' })
    createdAt: string;

    @ApiProperty({ type: String, example: '2023-09-24T06:15:32.219Z' })
    updatedAt: string;

    @ApiProperty({ type: Number, example: 1 })
    price: number;

    @ApiProperty({ type: Number, example: 0 })
    rating: number;

    @ApiProperty({ type: Number, example: 0 })
    likes: number;

    @ApiProperty({ type: Number, example: 0 })
    discount: number;

    @ApiProperty({ type: [String], example: ['https://omniforce-asset-store-asset.cellar-c2.services.clever-cloud.com/e30a5f83-6273-4fae-a1a4-71e6ab4b5b41%2Bbot.jpg'] })
    pictures: string[];

    @ApiProperty({ type: String, example: 'https://omniforce-asset-store-asset.cellar-c2.services.clever-cloud.com/file%3Ae30a5f83-6273-4fae-a1a4-71e6ab4b5b41_hw.rar' })
    file: string;

    @ApiProperty({ type: User })
    user: User;

    @ApiProperty({ type: [Translation] })
    translations: Translation[];
}