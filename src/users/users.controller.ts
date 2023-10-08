import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NestInterceptor,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto} from '../dto/user/create-user.dto';
import {Request} from "express";
import {JwtService} from "@nestjs/jwt";
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
import {FileInterceptor} from "@nestjs/platform-express";
import {UserDto} from "../dto/user/user.dto";
import {Roles} from "../role/roles.decorator";
import {Role} from "../role/role.enum";
import {RolesGuard} from "../role/roles.guard";
import {UpdateUserDto} from "../dto/user/update-user.dto";
import {JwtUserGuard} from "../authorization/auth.guard";
import {NotFoundInterceptor} from "../interceptor/not-found.interceptor";
import {RoleResponseDto} from "../dto/response/role.dto";

@ApiTags('User')
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({
    description: "Your access token is not valid or expired."
})
@UseInterceptors(NotFoundInterceptor)
@Controller('users')
@UseGuards(JwtUserGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {
    }

    @ApiOperation({summary: "Create a new user"})
    @ApiCreatedResponse({
        description: "User has been created. Returned value is an uuid of an created object",
        type: Number
    })
    @ApiBadRequestResponse({description: "Provided data is not valid. Needed 'nickname' - String, 'desc' - String"})
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
                nickname: {
                    type: 'string',
                    format: 'string',
                    example: 'Xepobopa'
                },
                desc: {
                    type: 'string',
                    format: 'string',
                    example: 'description'
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('avatar') as unknown as NestInterceptor)
    @Post('create')
    async create(
        @Body() newUser: CreateUserDto,
        @Req() req: Request,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|gif)$/,
                })
                .addMaxSizeValidator({
                    maxSize: 2 * 1000 * 1000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) avatar: Express.Multer.File) {
        console.log(newUser)
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        const user = await this.usersService.create(newUser, sub);
        await this.usersService.setAvatar(user.uuid, avatar.originalname, avatar.buffer);
        return user;
    }

    @ApiOperation({summary: "Update a user with provided 'uuid'"})
    @ApiOkResponse({description: "Return new changed user .", type: UserDto})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @ApiBody({description: "Pass the options you want to change", type: UpdateUserDto})
    @Patch(':uuid')
    async updateUser(@Param("uuid") uuid: string, @Body() changes: UpdateUserDto) {
        return await this.usersService.updateUser(uuid, changes);
    }

    @ApiOperation({summary: "Update a user avatar by provided 'uuid'"})
    @ApiOkResponse({description: "Return new changed user .", type: Number})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('avatar') as unknown as NestInterceptor)
    @Patch(':uuid/setAvatar')
    async changeAvatar(
        @Param('uuid') uuid: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: "/(jpg|jpeg|png|gif)$/"
                })
                .addMaxSizeValidator({
                    maxSize: 2 * 1000 * 1000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) avatar: Express.Multer.File
    ) {
        console.log(avatar);
        return await this.usersService.setAvatar(uuid, avatar.originalname, avatar.buffer);
    }

    @ApiOperation({summary: "Return a user with provided 'uuid'"})
    @ApiOkResponse({description: "User with provided 'uuid'.", type: UserDto})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @Get('get/:uuid')
    async getUserById(@Param('uuid') uuid: string) {
        return await this.usersService.getUserByUuid(uuid);
    }

    @ApiOperation({summary: "Return a user by provided token"})
    @ApiOkResponse({description: "User", type: UserDto})
    @ApiBadRequestResponse({description: "Can't find user by provided token"})
    @Get('get')
    async getUserByToken(@Req() req: Request) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        return await this.usersService.getUserBySub(sub);
    }

    @ApiOperation({summary: "Delete user with provided 'uuid'"})
    @ApiOkResponse({description: "User with provided 'uuid' has been deleted", type: Number})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @Delete('delete/:uuid')
    async deleteUser(@Param('uuid') uuid: string) {
        return await this.usersService.deleteUser(uuid);
    }

    @ApiOperation({summary: "Block user with provided 'uuid'. User who blocks must be an Admin"})
    @ApiOkResponse({description: "User with provided 'uuid' has been blocked", type: UserDto})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @Get('block/:uuid')
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async blockUser(@Param('uuid') uuid: string) {
        return await this.usersService.blockUser(uuid);
    }

    @ApiOperation({summary: "Returns an array of user roles. Roles are got by token"})
    @ApiOkResponse({description: "Returns an array of user roles", type: [RoleResponseDto]})
    @ApiBadRequestResponse({description: "Can't find user with provided 'uuid'"})
    @Get('roles')
    async getUserRoles(@Req() req: Request) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;
        const roles = await this.usersService.getUserRoles(sub);
        console.log(roles);
        return roles;
    }
}
