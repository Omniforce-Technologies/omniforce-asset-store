import {BadRequestException, Injectable} from '@nestjs/common';
import {CreateUserDto} from '../dto/user/create-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {Repository} from "typeorm";
import {ManagementClientService} from "../managementClient/management-client.service";
import {UploadService} from "../upload/upload.service";
import {UpdateUserDto} from "../dto/user/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private readonly managementClientService: ManagementClientService,
        private readonly uploadService: UploadService
    ) {
    }

    async setAvatar(uuid: string, filename: string, avatar: Buffer) {
        const file = await this.uploadService.uploadUser(filename, avatar);

        const res = await this.usersRepository.update(
            {uuid},
            {avatar: file}
        );

        if (res.affected === 0) throw new BadRequestException(`Can't find user with id "${uuid}"`);
        return res.affected;
    }


    async create(newUser: CreateUserDto, auth0_sub: string) {
        return await this.usersRepository.save({...newUser, auth0_sub});
    }

    async updateUser(uuid: string, changes: UpdateUserDto) {
        const userToUpdate = await this.getUserByUuid(uuid);
        return await this.usersRepository.save(Object.assign(userToUpdate, changes));
    }

    async getUserByUuid(uuid: string) {
        return await this.usersRepository.findOneOrFail({ where: { uuid } });
    }

    async getUserBySub(sub: string) {
        return await this.usersRepository.findOneOrFail({ where: { auth0_sub: sub } });
    }

    async deleteUser(uuid: string) {
        const res = await this.usersRepository.delete({uuid});

        if (res.affected === 0) throw new BadRequestException(`Can't find user with id "${uuid}"`);
        return res.affected;
    }

    async blockUser(uuid: string) {
        const sub = (await this.getUserByUuid(uuid)).auth0_sub;
        return await this.managementClientService.managementClient.updateUser({id: sub}, {blocked: true});
    }

    async getUserRoles(sub: string) {
        return await this.managementClientService.managementClient.getUserRoles({ id: sub });
    }
}



