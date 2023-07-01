import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Post, Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AssetsService} from './assets.service';
import {CreateAssetDto} from "../dto/create-asset.dto";
import {FilesInterceptor} from "@nestjs/platform-express";
import {JwtUserGuard} from "../authorization/auth.guard";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {AssetDto} from "../dto/asset.dto";
import {AssetQueryDto} from "../dto/asset-query.dto";

@ApiTags('Asset')
@ApiUnauthorizedResponse({
    description: "Your access token is not valid or expired."
})
@Controller('assets')
@UseGuards(JwtUserGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {
    }

    @ApiOperation({summary: "Create a new asset"})
    @ApiCreatedResponse({
        description: "Asset has been created. Returned value is an uuid of an created object",
        type: Number
    })
    @ApiBadRequestResponse({description: "Provided data is not valid. Data must be like an CreateAssetDto. Check if user with provided if exist"})
    @Post('/create/:userUUID')
    async createAsset(@Param('userUUID') userUUID: string, @Body() newAsset: CreateAssetDto) {
        return await this.assetsService.createAsset(newAsset, userUUID);
    }

    @ApiOperation({summary: "Add an pictures (for preview) to asset (jpeg only)"})
    @ApiCreatedResponse({
        description: "Pictures set to the user with 'uuid'. If pictires set successful, return '1'",
        type: Number
    })
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('pictures'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                picture: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Post('/:uuid/setPictures')
    async setPictures(
        @Param('uuid') uuid: string,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: "image/jpeg"
                })
                .addMaxSizeValidator({
                    maxSize: 2 * 1000 * 1000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) pictures: Array<Express.Multer.File>) {
        return await this.assetsService.setPictures(uuid, pictures.map(picture => picture.buffer));
    }

    @Get('get')
    async getAssetsByQuery(@Query() query: AssetQueryDto) {
        return await this.assetsService.getAssetByQuery(query);
    }

    @ApiOperation({summary: "Return an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid'.", type: AssetDto})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Get(':uuid')
    async getAsset(@Param('uuid') uuid: string) {
        return await this.assetsService.getAsset(uuid);
    }

    @ApiOperation({summary: "Delete an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid' has been deleted", type: Number})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Delete(':uuid')
    async deleteAsset(@Param('uuid') uuid: string) {
        return await this.assetsService.deleteUser(uuid);
    }
}
