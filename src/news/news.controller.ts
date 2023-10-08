import {Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UseInterceptors} from '@nestjs/common';
import {NewsService} from './news.service';
import {CreateNewsDto} from "../dto/news/create-news.dto";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {Request} from "express";
import {NewsDto} from "../dto/news/news.dto";
import {NotFoundInterceptor} from "../interceptor/not-found.interceptor";
import {JwtUserGuard} from "../authorization/auth.guard";
import {JwtService} from "@nestjs/jwt";
import {Roles} from "../role/roles.decorator";
import {Role} from "../role/role.enum";
import {RolesGuard} from "../role/roles.guard";

@ApiTags('News')
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({
    description: "Your access token is not valid or expired."
})
@UseInterceptors(NotFoundInterceptor)
@Controller('news')
@UseGuards(JwtUserGuard)
export class NewsController {
    constructor(
        private readonly newsService: NewsService,
        private readonly jwtService: JwtService
    ) {
    }

    @ApiOperation({summary: "Create news by body"})
    @ApiOkResponse({description: "Return new news", type: NewsDto})
    @ApiBadRequestResponse({description: "Wrong body data"})
    @ApiBody({description: "Pass the options you want to create news with", type: CreateNewsDto})
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Post('create')
    async create(@Req() req: Request, @Body() createNews: CreateNewsDto) {
        return await this.newsService.create(createNews);
    }

    @ApiOperation({summary: "Return amount of news in desc order that has been passed to the [:count] property."})
    @ApiOkResponse({description: "Return news list", type: [NewsDto]})
    @Get('newsline/:count')
    findAll(@Param("count") count: number) {
        return this.newsService.findNewsLine(count);
    }

    @ApiOperation({summary: "Return the news by provided 'uuid'"})
    @ApiOkResponse({description: "Return news", type: NewsDto})
    @ApiBadRequestResponse({description: "Can't find news by provided 'uuid'"})
    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return await this.newsService.findOne(uuid);
    }

    @ApiOperation({summary: "Delete news by 'uuid'"})
    @ApiOkResponse({description: "News deleted successful", type: "{'raw': Array, 'affected': String}"})
    @ApiBadRequestResponse({description: "Can't find news by provided 'uuid'"})
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Delete(':uuid')
    async remove(@Param('uuid') uuid: string) {
        return await this.newsService.remove(uuid);
    }
}
