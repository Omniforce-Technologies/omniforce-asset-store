import {Injectable} from "@nestjs/common";
import {ManagementClient} from "auth0";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ManagementClientService {
    public managementClient: ManagementClient;

    constructor(private readonly configService: ConfigService) {
        this.managementClient = new ManagementClient({
            domain: configService.get<string>('DOMAIN'),
            clientId: configService.get<string>('CLIENT_ID'),
            clientSecret: configService.get<string>('CLIENT_SECRET'),
            scope: "read:users create:users read:roles read:role_members",
            audience: configService.get<string>('AUDIENCE'),
            tokenProvider: {
                enableCache: true,
                cacheTTLInSeconds: 10
            }
        });
    }
}