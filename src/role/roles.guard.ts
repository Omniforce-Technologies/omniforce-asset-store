import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {ROLES_KEY} from "./roles.decorator";
import {ManagementClientService} from "../managementClient/management-client.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly managementClientService: ManagementClientService,
    ) {
    }

    async canActivate(context: ExecutionContext) {
        const token = context.switchToHttp().getRequest().headers.authorization.replace('Bearer ', '');
        const sub = this.jwtService.decode(token).sub;

        const userRoles = await this.managementClientService.managementClient.getUserRoles({id: sub});
        const role: string = this.reflector.get<string>(ROLES_KEY, context.getHandler())[0];

        return userRoles.some(x => x.name === role);
    }
}
