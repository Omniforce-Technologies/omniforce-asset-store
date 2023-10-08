import {IsArray, IsNumber, IsOptional, IsString, IsUrl, Max, Min} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {AbstractDto} from "../abstract.dto";
import {Transform, Type} from "class-transformer";

export class AssetDto extends AbstractDto {
    @ApiProperty({
        description: "The price of an asset (dollars) (0 - if free)",
        title: "Price",
        type: Number,
        required: true,
        example: 79,
    })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @ApiProperty({
        description: "The Id of a user, that created an asset",
        title: "Developer ID",
        type: Number,
        required: true,
        example: 428
    })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: "The Id of a user, that created an asset",
        title: "Developer ID",
        type: Number,
        required: true,
        example: 428
    })
    @IsNumber()
    translateId: number;

    @ApiProperty({
        description: "The rating of an asset (from 0 to 5.0)",
        title: "Rating",
        type: Number,
        required: false,
        example: 4.8,
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    rating: number;

    @ApiProperty({
        description: "Likes of an asset",
        title: "Likes",
        type: Number,
        required: false,
        example: 1488,
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    likes: number;

    @ApiProperty({
        description: "The pictures (quick view) of an asset",
        title: "Pictures",
        type: [String],
        example: [
            'https://asset-store-asset-images.s3.eu-north-1.amazonaws.com/xepobopa-test1.jpg',
            'https://asset-store-asset-images.s3.eu-north-1.amazonaws.com/xepobopa-test2.jpg',
            'https://asset-store-asset-images.s3.eu-north-1.amazonaws.com/xepobopa-test3.jpg',
        ],
        required: false,
    })
    @IsOptional()
    @IsArray()
    pictures: string[]

    @ApiProperty({
        description: "Url of the *.rar file with asset data",
        title: "Url of the *.rar file",
        type: String,
        example: [
            'https://asset-store-asset-images.s3.eu-north-1.amazonaws.com/xepobopa-test1.jpg',
        ],
        required: false,
    })
    @IsOptional()
    @IsUrl()
    file: string

    @ApiProperty({
        description: 'asset discount (0 - 100)',
        title: "Discount",
        type: Number,
        example: 50,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    discount: number;
}