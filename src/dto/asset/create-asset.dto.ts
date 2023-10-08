import {IntersectionType, PickType} from "@nestjs/swagger";
import {AssetDto} from "./asset.dto";
import {AssetTranslateDto} from "./asset-translate.dto";

class Translate {
    lang: AssetTranslateDto[];
}

export class CreateAssetDto extends IntersectionType(
    PickType(AssetDto, ['price', 'discount', 'pictures'] as const),
    Translate) {}