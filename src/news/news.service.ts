import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {NewsEntity} from "../entity/news.entity";
import {CreateNewsDto} from "../dto/news/create-news.dto";

@Injectable()
export class NewsService {
    constructor(@InjectRepository(NewsEntity) private newsRepository: Repository<NewsEntity>) {
    }

    async create(createNews: CreateNewsDto) {
        return await this.newsRepository.save(createNews as NewsEntity);
    }

    async findNewsLine(take: number) {
        return await this.newsRepository.find({take, order: {createdAt: "desc"}});
    }

    async findOne(uuid: string) {
        return await this.newsRepository.findOneOrFail({where: {uuid}});
    }

    async remove(uuid: string) {
        return await this.newsRepository.delete({uuid});
    }
}
