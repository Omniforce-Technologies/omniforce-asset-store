import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from "./authorization.guard";

@Module({
    imports: [PassportModule.register({defaultStrategy: 'jwt'})],
    providers: [JwtStrategy],
    exports: [PassportModule],
})
export class AuthorizationModule {
}