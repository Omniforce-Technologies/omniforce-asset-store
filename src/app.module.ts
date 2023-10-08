import {Global, Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {UsersModule} from './users/users.module';
import * as Joi from "joi";
import {TypeOrmModule} from "@nestjs/typeorm";
import {typeOrmAsyncConfig} from "./config/typeorm.config";
import {AssetsModule} from './assets/assets.module';
import {HttpModule} from "@nestjs/axios";
import {JwtModule} from "@nestjs/jwt";
import { NewsModule } from './news/news.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                PORT: Joi.string().required().default('5000'),
                AUDIENCE: Joi.string().required(),
                NODE_ENV: Joi.string().valid("DEVELOPMENT", "RELEASE"),
                DOMAIN: Joi.string().required(),
                DB_HOST: Joi.string().required().default('localhost'),
                DB_PORT: Joi.number().required().default(5432),
                DB_PASSWORD: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_DATABASE_NAME: Joi.string().required(),
                AWS_ACCESS_KEY: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
                AWS_HOST: Joi.string().required(),
                AWS_USER_BUCKET: Joi.string().required(),
                AWS_ASSET_BUCKET: Joi.string().required(),
            }),
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        UsersModule,
        AssetsModule,
        HttpModule,
        JwtModule,
        NewsModule
    ],
    exports: [HttpModule, JwtModule]
})
export class AppModule {

}