import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {passportJwtSecret} from 'jwks-rsa';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${configService.get<string>('ISSUERBASEURL')}.well-known/jwks.json`,
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: configService.get<string>('AUDIENCE'),
            issuer: configService.get<string>('ISSUERBASEURL'),
            ignoreExpiration: false,
            algorithms: [configService.get<string>('TOKENSIGNINGALG')]
        });
    }

    validate(payload: unknown): unknown {
        return payload;
    }
}