import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Post,
    Query, UploadedFile,
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

@ApiTags('Asset')
@ApiBearerAuth("access-token")
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
        description: "Asset has been created. Return new asset",
        type: AssetResponseDto
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'pictures', maxCount: 1 },
        { name: 'file' },
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
        @Body() newAsset: CreateAssetDto,
        @UploadedFiles() files: { pictures: Express.Multer.File[], file: Express.Multer.File }
    ) {
        console.log("Create Asset")
        const asset = await this.assetsService.createAsset(newAsset, userUUID);
        console.log("Set File")
        await this.assetsService.setFile(asset.uuid, files.file[0]);
        console.log("Set Picture")
        await this.assetsService.setPictures(asset.uuid, files.pictures);
        console.log("Get Asset")
        return await this.getAsset(asset.uuid);
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
        const asset = await this.assetsService.getAsset(uuid);
        console.log(asset)
        return asset;
    }

    @ApiOperation({summary: "Delete an asset with provided 'uuid'"})
    @ApiOkResponse({description: "Asset with provided 'uuid' has been deleted", type: Number})
    @ApiBadRequestResponse({description: "Can't find asset with provided 'uuid'"})
    @Delete(':uuid')
    async deleteAsset(@Param('uuid') uuid: string) {
        return await this.assetsService.deleteUser(uuid);
    }
}
