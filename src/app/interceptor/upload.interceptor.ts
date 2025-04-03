import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { LoadingService } from '../services/loading/loading.service';
import { Observable, finalize } from 'rxjs';
import { CurrentUserService } from '../services/current user/current-user.service';

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  constructor(private loader: LoadingService, private user: CurrentUserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();
    return next.handle(req).pipe(
      finalize(() => {
        this.loader.hide();
      })
    );
  }
}
