import {PickType} from "@nestjs/swagger";
import {NewsDto} from "./news.dto";

export class CreateNewsDto extends PickType(NewsDto, ['desc', 'title', 'version'] as const) {
}