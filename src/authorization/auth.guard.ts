import {AuthGuard} from "@nestjs/passport";
import {Injectable} from "@nestjs/common";

@Injectable()
export class JwtUserGuard extends AuthGuard('jwt') {
    handleRequest(...args: Parameters<InstanceType<ReturnType<typeof AuthGuard>>['handleRequest']>) {
        console.log(args);
        return super.handleRequest(...args);
    }
}