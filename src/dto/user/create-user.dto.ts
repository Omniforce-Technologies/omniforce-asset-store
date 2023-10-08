import {PickType} from "@nestjs/swagger";
import {UserDto} from "./user.dto";

export class CreateUserDto extends PickType(UserDto, ['desc', 'nickname'] as const) {}
