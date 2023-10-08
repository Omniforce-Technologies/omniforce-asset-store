import type {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('Asset Store')
        .setContact(
            'Dima Ivanov',
            'https://github.com/Xepobopa',
            'ismartsdn4477@gmail.com',
        ).addBearerAuth(
            {
                description: 'Please enter access token',
                name: 'Authorization',
                bearerFormat: 'JWT',
                scheme: 'Bearer',
                type: 'http',
                in: 'Header'
            },
            'access-token',
        )
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('documentation', app, document);
}