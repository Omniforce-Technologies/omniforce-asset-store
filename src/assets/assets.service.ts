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
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(AssetEntity) private assetRepository: Repository<AssetEntity>,
        @InjectRepository(AssetTranslateEntity) private assetTranslateEntity: Repository<AssetTranslateEntity>,
        private readonly userService: UsersService,
        private readonly uploadService: UploadService,
        private readonly configService: ConfigService,
    ) {
    }

    async createAsset(newAsset: CreateAssetDto, userUUID: string) {
        const user = await this.userService.getUserByUuid(userUUID);

        const userTrans: AssetTranslateEntity[] = newAsset.lang.map((value) => {
            let obj;
            if (value instanceof String)
                obj = JSON.parse(value as unknown as string);
            else
                obj = value;
            const newUserTrans = new AssetTranslateEntity();
            newUserTrans.language = obj.language;
            newUserTrans.title = obj.title;
            newUserTrans.desc = obj.desc;
            return newUserTrans;
        });
        const asset = new AssetEntity();
        asset.user = user;
        asset.translations = userTrans;
        asset.price = newAsset.price;
        asset.discount = newAsset?.discount;
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
        const pageFields = ['take', 'skip'];

        for (const param in query) {
            if (assetsFields.includes(param)) {
                queryBuilder.andWhere(`asset.${param} = :${param}`, {[param]: query[param]});
            } else if (param === 'userUuid') {
                queryBuilder.andWhere(`user.uuid = :uuid`, {uuid: query[param]});
            } else if (param === 'discount' && query[param] === true) {
                queryBuilder.andWhere(`asset.discount != :discount`, { discount: 0 })
            } else if (param === 'orderBy') {
                queryBuilder.orderBy(`asset.${query[param]}`, pageOptionsDto.order)
            } else if (translationsFields.includes(param)) {
                queryBuilder.andWhere(`translations.${param} = :${param}`, {[param]: query[param]});
            }
        }

        if (query['minPrice'] || query['maxPrice']) {
            if (!query['minPrice'])
                query['minPrice'] = 0;
            if (!query['maxPrice'])
                query['maxPrice'] = Number.MAX_VALUE;

            queryBuilder.andWhere(`asset.price <= :maxPriceParam`, { maxPriceParam: query['maxPrice'] });
            queryBuilder.andWhere(`asset.price >= :minPriceParam`, { minPriceParam: query['minPrice'] });
        }

        if(!pageFields.some(field => field in pageOptionsDto)) {
            return await queryBuilder.getMany();
        }

        queryBuilder
            .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
            .take(pageOptionsDto.take);
        const itemCount = await queryBuilder.getCount();
        const meta = new PageMetaDto({ itemCount, pageOptionsDto });
        const { entities } = await queryBuilder.getRawAndEntities();

        return new PageDto(entities, meta);
    }

    async deleteUser(uuid: string, sub: string) {
        const user = await this.userService.getUserBySub(sub);
        const assets = await this.getAssetByQuery({userUuid: user.uuid}) as AssetEntity[];

        const assetToDelete = assets.find(value => value.uuid === uuid);
        if (!assetToDelete) throw new BadRequestException("Given user doesn't own given asset!");

        const res = await this.assetRepository.delete({uuid});
        if (res.affected === 0) throw new BadRequestException(`Can't find user with id "${uuid}"`);

        return res.affected;
    }

    async deletePhoto(assetUuid: string, photoUuid: string, sub: string) {
        const photoUrl = `${this.configService.get<string>('AWS_ASSET_BUCKET')}.${this.configService.get<string>('AWS_HOST')}/${photoUuid}`
        const user = await this.userService.getUserBySub(sub);
        const asset = await this.getAsset(assetUuid);

        if (!(asset.user.uuid === user.uuid))
            throw new BadRequestException("Given user doesn't own given asset!");

        const photoDeleteIndex = asset.pictures.findIndex(pic => pic === photoUrl);
        asset.pictures = asset.pictures.splice(photoDeleteIndex, 1);
        return await this.assetRepository.save(asset)
    }

    async addPhotos(
        assetUuid: string,
        sub: string,
        pictures: Array<Express.Multer.File>) {
        const user = await this.userService.getUserBySub(sub);
        const asset = await this.getAsset(assetUuid);

        if (!(asset.user.uuid === user.uuid))
            throw new BadRequestException("Given user doesn't own given asset!");

        const urls: string[] = [];
        for (const pic of pictures) {
            urls.push(
                await this.uploadService.uploadAsset(
                    `${assetUuid}+${pic.originalname}`,
                    pic.buffer,
                ),
            );
        }

        asset.pictures = asset.pictures.concat(urls);
        return await this.assetRepository.save(asset);
    }
}
