import {Global, Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {JwtModule} from "@nestjs/jwt";
import {AuthorizationModule} from "../authorization/authorization.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {ManagementClientModule} from "../managementClient/management-client.module";
import {UploadModule} from "../upload/upload.module";

@Global()
@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([UserEntity]),
        AuthorizationModule,
        ManagementClientModule,
        UploadModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {
}
