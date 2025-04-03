import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    authService.authState.subscribe(user => {
      if (user != null) {
        // إذا كانت القيمة null، هذا يعني أنه لا يوجد مستخدم مسجل دخول
        const idToken = user.getIdToken();
        idToken.then(idToken => {
          if(idToken){
            setTimeout(() => {
              observer.next(true);
              observer.complete();
            }, 500);
          }else{
            router.navigate(['sign']);
            observer.next(false);
            observer.complete();
          }
        })
      } else {
          router.navigate(['sign']);
        observer.next(false);
        observer.complete();
      }
    });
  });
}






//   //   return new Observable<boolean>(observer => {
//   //   authService.authState.subscribe(value => {
//   //     if (value != null) {
//   //       // إذا كانت القيمة null، هذا يعني أنه لا يوجد مستخدم مسجل دخول
//   //       observer.next(true);
//   //       observer.complete();
//   //     } else {
//   //       // إذا كانت القيمة غير null، يعني أن هناك مستخدم مسجل دخول
//   //       setTimeout(() => {
//   //         router.navigate(['sign']);
//   //       }, 300);
  
//   //       observer.next(false);
//   //       observer.complete();
//   //     }
//   //   });
//   // });
 
// };

//   // return new Observable<boolean>(observer => {
//   //   authService.authState.subscribe(value => {
//   //     if (value != null) {
//   //       // إذا كانت القيمة null، هذا يعني أنه لا يوجد مستخدم مسجل دخول
//   //       observer.next(true);
//   //       observer.complete();
//   //     } else {
//   //       // إذا كانت القيمة غير null، يعني أن هناك مستخدم مسجل دخول
//   //       setTimeout(() => {
//   //         router.navigate(['sign']);
//   //       }, 300);
  
//   //       observer.next(false);
//   //       observer.complete();
//   //     }
//   //   });
//   // });






//   // const idToken = authService.getuser()?.getIdToken();

//   // if (idToken) {
//   //   // إذا كان هناك توكين، السماح بالانتقال
//   //   return true;
//   // } else {
//   //   // إذا لم يكن هناك توكين، التنقل إلى صفحة التسجيل
//   //   router.navigate(['sign']);
//   //   return false; // منع الوصول إلى الصفحة المحمية
//   // }


// const idToken = 
// !!authService.getuser()?.getIdToken();
// if(idToken){
//   setTimeout(() => {
//     router.navigate(['home']);
//   }, 300);
//   return of(true).pipe(first());
// }else{
//   setTimeout(() => {
//     router.navigate(['sign']);
//   }, 300);
//   return of(false);
// }



// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { AuthService } from '../services/auth/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {

//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     return this.authService.isLoggedIn().pipe(
//       map(isLoggedIn => {
        
//         if (isLoggedIn) {
//           return true;
//         } else {
//           this.router.navigate(['/sign']); // Redirect to login page if not authenticated
//           return false;
//         }
//       })
//     );
//   }
// }