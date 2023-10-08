import {IntersectionType, PartialType, PickType} from '@nestjs/swagger'
import {AssetDto} from "./asset.dto";
import {AssetTranslateDto} from "./asset-translate.dto";
import {IsOptional, IsUUID} from "class-validator";

export class AssetTranslateQuery extends PartialType(AssetTranslateDto) {}

export class AssetBasicQuery extends PartialType(PickType(AssetDto, ['price', 'rating', 'userId'] as const)) {}

export class AssetQueryDto extends IntersectionType(AssetTranslateQuery, AssetBasicQuery) {
    @IsOptional()
    @IsUUID()
    userUuid: string;
}