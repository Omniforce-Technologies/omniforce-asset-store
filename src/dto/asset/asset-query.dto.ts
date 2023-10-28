import {ApiProperty, IntersectionType, PartialType, PickType} from '@nestjs/swagger'
import {AssetDto} from "./asset.dto";
import {AssetTranslateDto} from "./asset-translate.dto";
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID} from "class-validator";
import {Transform} from "class-transformer";
import {OrderBy} from "../../enum/orderBy.enum";

export class AssetTranslateQuery extends PartialType(AssetTranslateDto) {}

export class AssetBasicQuery extends PartialType(PickType(AssetDto, ['price', 'rating', 'userId'] as const)) {}

export class AssetQueryDto extends IntersectionType(AssetTranslateQuery, AssetBasicQuery) {
    @ApiProperty({
        description: "Search assets, that provided user created",
        title: "The uuId of a user",
        type: String,
        example: '83jd3-01c4f-04612-djg6n',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    userUuid: string;

    @ApiProperty({
        description: "Filter query if asset has any discount. Pass true is you want to search only assets with discount else pass false or don't provide discount",
        title: "Discount",
        type: Boolean,
        example: 'true',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => String(value).toLowerCase() === 'true')
    discount?: boolean = false;

    @ApiProperty({
        description: "Filter asset by price. Minimal price for asset",
        title: "Minimal Price",
        type: Number,
        example: '1000',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => Number(value))
    minPrice?: number = 1;

    @ApiProperty({
        description: "Filter asset by price. Maximal price for asset",
        title: "Maximal Price",
        type: Number,
        example: '1500',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Transform(({ value }) => Number(value))
    maxPrice?: number = Number.MAX_VALUE;

    @ApiProperty({
        description: "Pass field that you want to filter by 'order' field (ASC / DESC)",
        title: "Order by some field",
        type: String,
        enum: OrderBy,
        example: 'price',
        required: false,
    })
    @IsOptional()
    @IsEnum(OrderBy)
    orderBy?: OrderBy;
}