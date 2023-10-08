import {Module} from '@nestjs/common';
import {AssetsService} from './assets.service';
import {AssetsController} from './assets.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthorizationModule} from "../authorization/authorization.module";
import {AssetEntity} from "../entity/asset.entity";
import {UsersModule} from "../users/users.module";
import {UploadModule} from "../upload/upload.module";
import {AssetTranslateEntity} from "../entity/asset-translate.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([AssetEntity, AssetTranslateEntity]),
        AuthorizationModule,
        UsersModule,
        UploadModule,
    ],
    controllers: [AssetsController],
    providers: [AssetsService]
})
export class AssetsModule {
}
