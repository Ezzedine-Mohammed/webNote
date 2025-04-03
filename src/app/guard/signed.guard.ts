import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs';

export const signedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    authService.authState.subscribe(user => {
      if (user === null) {
        // إذا كانت القيمة null، هذا يعني أنه لا يوجد مستخدم مسجل دخول
        observer.next(true);
        observer.complete();
      } else {
        // إذا كانت القيمة غير null، يعني أن هناك مستخدم مسجل دخول
        const idToken = user.getIdToken();
        idToken.then(idToken => {
          if (!idToken) {
            observer.next(true);
            observer.complete();
          } else {
            router.navigate(['home']);
            observer.next(false);
            observer.complete();
          }
        })
        router.navigate(['home']);
        observer.next(false);
        observer.complete();
      }
    });
  });
};


// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth/auth.service';
// import { map, take } from 'rxjs/operators';

// export const signedGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   return authService.authState.pipe(
//     take(1),
//     map(user => {
//       if (!user) {
//         return true; // Allow access to sign-in
//       }
//       // Redirect to home if already authenticated
//       return router.createUrlTree(['/home']);
//     })
//   );
// };









// const idToken = authService.getuser()?.getIdToken();

// if (!idToken) {
//   // إذا كان هناك توكين، السماح بالانتقال
//   return true;
// } else {
//   // إذا لم يكن هناك توكين، التنقل إلى صفحة التسجيل
//   router.navigate(['home']);
//   return false; // منع الوصول إلى الصفحة المحمية
// }


