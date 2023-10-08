import {CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException} from "@nestjs/common";
import {catchError, Observable, throwError} from "rxjs";
import {EntityNotFoundError} from "typeorm";

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // next.handle() is an Observable of the controller's result value
        return next.handle()
            .pipe(catchError(error => {
                if (error instanceof EntityNotFoundError) {
                    return throwError(() => new NotFoundException(error.message));
                } else {
                    return throwError(() => error);
                }
            }));
    }
}
