import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AssetsService} from './assets.service';
import {CreateAssetDto} from "../dto/asset/create-asset.dto";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
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
import {FormDataStringPipe} from "../pipe/formData-string.pipe";

@ApiTags('Asset')
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({
    description: "Your access token is not valid or expired."
})
@Controller('assets')
@UseGuards(JwtUserGuard)
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
    @ApiBadRequestResponse({description: "Provided data is not valid. Data must be like an CreateAssetDto. Check if user with provided if exist"})
    @Post('/create/:userUUID')
    async createAsset(
        @Param('userUUID') userUUID: string,
        @Body(FormDataStringPipe) newAsset: CreateAssetDto,
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

    @ApiOperation({summary: "Delete an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid' has been deleted", type: Number})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Delete(':uuid')
    async deleteAsset(@Param('uuid') uuid: string, @Req() req: Request) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        return await this.assetsService.deleteUser(uuid, sub);
    }
}
