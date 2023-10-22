import {ArgumentMetadata, PipeTransform} from "@nestjs/common";
import {CreateAssetDto} from "../dto/asset/create-asset.dto";

export class FormDataStringPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (value instanceof String)
            return JSON.parse(value as string) as CreateAssetDto;

        return value;
    }
}