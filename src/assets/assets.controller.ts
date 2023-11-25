import {
    Body,
    Controller,
    Delete,
    Get, HttpStatus, NestInterceptor,
    Param, ParseFilePipeBuilder,
    Post,
    Query,
    Req, UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AssetsService} from './assets.service';
import {CreateAssetDto} from "../dto/asset/create-asset.dto";
import {FileFieldsInterceptor, FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import {JwtUserGuard} from "../authorization/auth.guard";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {AssetDto} from "../dto/asset/asset.dto";
import {AssetQueryDto} from "../dto/asset/asset-query.dto";
import {AssetResponseDto} from "../dto/response/asset.dto";
import {JwtService} from "@nestjs/jwt";
import {Request} from "express";
import {PageOptionsDto} from "../dto/page-option.dto";
import {AssetEntity} from "../entity/asset.entity";
import {PageDto} from "../dto/page.dto";

@ApiTags('Asset')
@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService, private readonly jwtService: JwtService) {
    }

    @ApiOperation({summary: "Create a new asset"})
    @ApiCreatedResponse({
        description: "Asset has been created. Return new asset",
        type: AssetResponseDto
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'pictures', maxCount: 10},
        {name: 'file'},
    ]))
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                pictures: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary",
                    },
                },
                title: {type: 'string'},
                desc: {type: 'string'},
                price: {type: 'number'},
                rating: {type: 'number'},
                likes: {type: 'number'},
            },
        },
    })
    @ApiBearerAuth("access-token")
    @ApiUnauthorizedResponse({
        description: "Your access token is not valid or expired."
    })
    @UseGuards(JwtUserGuard)
    @ApiBadRequestResponse({description: "Provided data is not valid. Data must be like an CreateAssetDto. Check if user with provided if exist"})
    @Post('/create/:userUUID')
    async createAsset(
        @Param('userUUID') userUUID: string,
        @Body() newAsset: CreateAssetDto,
        @UploadedFiles()
            files: { pictures: Express.Multer.File[]; file: Express.Multer.File },
    ) {
        const asset = await this.assetsService.createAsset(newAsset, userUUID);
        await this.assetsService.setFile(asset.uuid, files.file[0]);
        await this.assetsService.setPictures(asset.uuid, files.pictures);
        return await this.getAsset(asset.uuid);
    }

    @Get('get')
    async getAssetsByQuery(@Query() query: AssetQueryDto, @Query() pageOptionsDto: PageOptionsDto) {
        return await this.assetsService.getAssetByQuery(query, pageOptionsDto) as PageDto<AssetEntity>;
    }

    @ApiOperation({summary: "Return an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid'.", type: AssetDto})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Get(':uuid')
    async getAsset(@Param('uuid') uuid: string) {
        const asset = await this.assetsService.getAsset(uuid);
        console.log(asset)
        return asset;
    }

    @ApiBearerAuth("access-token")
    @ApiUnauthorizedResponse({
        description: "Your access token is not valid or expired."
    })
    @UseGuards(JwtUserGuard)
    @ApiOperation({summary: "Delete an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid' has been deleted", type: Number})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Delete(':uuid')
    async deleteAsset(@Param('uuid') uuid: string, @Req() req: Request) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        return await this.assetsService.deleteUser(uuid, sub);
    }

    @ApiOperation({summary: "Delete a photo from asset with provided asset 'uuid'"})
    @ApiOkResponse({description: "Asset's photo has been deleted with provided asset 'uuid'", type: AssetDto})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @ApiBearerAuth("access-token")
    @ApiUnauthorizedResponse({
        description: "Your access token is not valid or expired."
    })
    @UseGuards(JwtUserGuard)
    @Delete('photo/:assetUuid/:photoUuid')
    async deletePhoto(
        @Param('assetUuid') assetUuid: string,
        @Param('photoUuid') photoUuid: string,
        @Req() req: Request)
    {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        return await this.assetsService.deletePhoto(assetUuid, photoUuid, sub);
    }

    @ApiOperation({summary: "Add photos from asset with provided asset 'uuid'"})
    @ApiOkResponse({description: "Asset's photo has been deleted with provided asset 'uuid'", type: AssetDto})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @ApiBearerAuth("access-token")
    @ApiUnauthorizedResponse({
        description: "Your access token is not valid or expired."
    })
    @UseGuards(JwtUserGuard)
    @UseInterceptors(FilesInterceptor('newPhotos') as unknown as NestInterceptor)
    @Post('addPhotos/:assetUuid')
    async addPhoto(
        @Param('assetUuid') assetUuid: string,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: '.(png|jpeg|jpg)',
                })
                .addMaxSizeValidator({
                    maxSize: 2 * 1000 * 1000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) newPhotos: Array<Express.Multer.File>,
        @Req() req: Request)
    {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        return await this.assetsService.addPhotos(assetUuid, sub, newPhotos);
    }
}
