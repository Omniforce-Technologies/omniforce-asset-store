import {Global, Module} from "@nestjs/common";
import {ManagementClientService} from "./management-client.service";

@Global()
@Module({
    imports: [],
    providers: [ManagementClientService],
    exports: [ManagementClientService]
})
export class ManagementClientModule {}