import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {setupSwagger} from "./config/swagger.config";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get<ConfigService>(ConfigService);

    app.enableCors({ credentials: true, origin: true });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());

    if (config.get<string>('NODE_ENV') === "DEVELOPMENT") {
        setupSwagger(app);
        console.log(`Swagger - http://localhost:${config.get<number>('PORT')}/documentation`)
    }

    const server = await app.listen(config.get<number>('PORT'), () => console.log(`Host on http://localhost:${config.get<number>('PORT')}`));

    const router = server._events.request._router;
    const availableRoutes: [] = router.stack
        .map(layer => {
            if (layer.route) {
                return {
                    route: {
                        path: layer.route?.path,
                        method: layer.route?.stack[0].method
                    }
                };
            }
        })
        .filter(item => item !== undefined);
    console.log(availableRoutes);
}

bootstrap();
