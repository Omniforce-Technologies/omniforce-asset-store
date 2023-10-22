import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AssetEntity} from "../entity/asset.entity";
import {CreateAssetDto} from "../dto/asset/create-asset.dto";
import {UsersService} from "../users/users.service";
import {AssetQueryDto} from "../dto/asset/asset-query.dto";
import {UploadService} from "../upload/upload.service";
import {AssetTranslateEntity} from "../entity/asset-translate.entity";
import {PageDto} from "../dto/page.dto";
import {PageMetaDto} from "../dto/page-meta.dto";
import {PageOptionsDto} from "../dto/page-option.dto";

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(AssetEntity) private assetRepository: Repository<AssetEntity>,
        @InjectRepository(AssetTranslateEntity) private assetTranslateEntity: Repository<AssetTranslateEntity>,
        private readonly userService: UsersService,
        private readonly uploadService: UploadService,
    ) {
    }

    async createAsset(newAsset: CreateAssetDto, userUUID: string) {
        const user = await this.userService.getUserByUuid(userUUID);

        const userTrans: AssetTranslateEntity[] = newAsset.lang.map((value) => {
            const newUserTrans = new AssetTranslateEntity();
            newUserTrans.language = value.language;
            newUserTrans.title = value.title;
            newUserTrans.desc = value.desc;
            return newUserTrans;
        });
        const asset = new AssetEntity();
        asset.user = user;
        asset.translations = userTrans;
        asset.price = newAsset.price;
        return await this.assetRepository.save(asset);
    }

    async setPictures(uuid: string, pictures: Array<Express.Multer.File>) {
        const urls: string[] = [];
        for (const pic of pictures) {
            urls.push(
                await this.uploadService.uploadAsset(
                    `${uuid}+${pic.originalname}`,
                    pic.buffer,
                ),
            );
        }

        await this.assetRepository
            .createQueryBuilder()
            .update()
            .set({
                pictures: urls,
            })
            .where('uuid = :uuid', { uuid })
            .execute();
    }

    async setFile(uuid: string, file: Express.Multer.File) {
        const buffer = file.buffer;

        const url = await this.uploadService.uploadAsset(
            `file:${uuid}_${file.originalname}`,
            buffer,
        );
        await this.assetRepository
            .createQueryBuilder()
            .update()
            .set({
                file: url,
            })
            .where('uuid = :uuid', { uuid })
            .execute();
    }

    async getAsset(uuid: string) {
        return await this.assetRepository.findOneOrFail({where: {uuid}, relations: ['user', 'translations']});
    }

    async getAssetByQuery(query: AssetQueryDto, pageOptionsDto?: PageOptionsDto) {
        const queryBuilder = this.assetRepository.createQueryBuilder('asset');
        queryBuilder.leftJoinAndSelect('asset.translations', 'translations');
        queryBuilder.leftJoinAndSelect('asset.user', 'user');

        const assetsFields = ['price', 'rating', 'uuid', 'id'];
        const translationsFields = ['title', 'desc', 'language'];

        for (const param in query) {
            if (assetsFields.includes(param)) {
                queryBuilder.andWhere(`asset.${param} = :${param}`, {[param]: query[param]});
            } else if (param === 'userUuid') {
                queryBuilder.andWhere(`user.uuid = :uuid`, {uuid: query[param]});
            } else if (translationsFields.includes(param)) {
                queryBuilder.andWhere(`translations.${param} = :${param}`, {[param]: query[param]});
                queryBuilder.andWhere(`translationsUser.${param} = :${param}`, {[param]: query[param]});
            }
        }
        if (!pageOptionsDto)
            return await queryBuilder.getMany();

        queryBuilder
            .orderBy("asset.createdAt", pageOptionsDto.order)
            .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
            .take(pageOptionsDto.take);
        const itemCount = await queryBuilder.getCount();
        const meta = new PageMetaDto({ itemCount, pageOptionsDto });
        const { entities } = await queryBuilder.getRawAndEntities();
        console.log(entities.length);
        return new PageDto(entities, meta);
    }

    async deleteUser(uuid: string, sub: string) {
        const user = await this.userService.getUserBySub(sub);
        const assets = await this.getAssetByQuery({userUuid: user.uuid}) as AssetEntity[];

        const assetToDelete = assets.find(value => value.uuid === uuid);
        if (!assetToDelete) throw new BadRequestException("Given user doesn't have the given asset!");

        const res = await this.assetRepository.delete({uuid});
        if (res.affected === 0) throw new BadRequestException(`Can't find user with id "${uuid}"`);

        return res.affected;
    }
}
