import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurrentUserService } from '../current user/current-user.service';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private cloudName = 'dn2cxt6ei';
  private uploadBackground = 'background';
  private uploadProfile = 'profile';

  constructor(private http: HttpClient, private firestore: AngularFirestore, private auth: AuthService, private user: CurrentUserService, private loader: LoadingService) {
  }

  uploadImage(file: File, background: boolean): Observable<string> {
    const user = this.auth.getuser();
    if (!user) { return of('') }

    return new Observable<string>((observer) => {
      const img = new Image();
      img.src = URL.createObjectURL(file); // تحويل الملف إلى صورة يمكن تحميلها  
      img.onload = () => {
        const canvas = document.createElement('canvas'); /// انشء مساحة للرسم
        const ctx = canvas.getContext('2d');

        // تحديد أبعاد الصورة  
        const maxWidth = 1000;
        const maxHeight = 1000;
        let width = img.width;
        let height = img.height;

        // تغيير الحجم للحفاظ على نسبة العرض إلى الارتفاع  
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // إعداد canvas  
        canvas.width = width;
        canvas.height = height;

        // رسم الصورة المعدلة على الـ canvas  
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل الصورة إلى DataURL  
        canvas.toBlob((blob) => {
          const formData = new FormData();
          background ? formData.append('upload_preset', this.uploadBackground) : formData.append('upload_preset', this.uploadProfile);
          formData.append('file', blob!, user.email + '-' + file.name); // إضافة الصورة المعدلة إلى FormData  

          const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload/`;

          // رفع الصورة إلى Cloudinary  
          this.http.post<{ secure_url: string }>(url, formData).pipe(
            map(response => {
              if (background) {
                this.firestore.collection('users').doc(user.email ?? '').update({
                  'backgroundImageURL': response.secure_url
                });
              } else {
                user.updateProfile({
                  photoURL: response.secure_url,
                });
                this.firestore.collection('users').doc(user.email ?? '').update({
                  'userinfo.0.photoURL': response.secure_url
                });
                this.user.userphotoUrlSubject.next(response.secure_url);
              }
              observer.next(response.secure_url);
              observer.complete();
            }),
            catchError(error => {
              console.error('Cloudinary upload error:', error);
              observer.error(new Error('Upload failed. Check console for details.'));
              return throwError(() => new Error('Upload failed. Check console for details.'));
            })
          ).subscribe();
        }, 'image/jpeg');
      };

      img.onerror = () => {
        observer.error(new Error('Image loading failed.'));
      };
    });
  }

  async updateUserName(name: string) {
    this.loader.show();
    const user = this.auth.getuser();
    if (!user) { return }

    await user.updateProfile({
      displayName: name,
    });

    await this.firestore.collection('users').doc(user.email ?? '').update({
      'userinfo.0.displayName': name
    });

    this.user.usernameSubject.next(name);
    this.loader.hide();
  }


}


// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { merge, Observable, of, throwError } from 'rxjs';
// import { catchError, map, switchMap } from 'rxjs/operators';
// import { AuthService } from '../auth/auth.service';
// import { AngularFirestore } from '@angular/fire/compat/firestore';

// @Injectable({
//   providedIn: 'root'
// })
// export class SettingsService {

//   private cloudName = 'dn2cxt6ei';
//   private uploadBackground = 'background';
//   private uploadProfile = 'profile';

//   constructor(private http: HttpClient, private firestore: AngularFirestore, private auth: AuthService) { }

//   uploadImage(file: File, background: boolean): Observable<string> {
//     const user = this.auth.getuser();
//     if (!user) { return of('') }
//     const formData = new FormData();
//     formData.append('file', file);
//     background ? formData.append('upload_preset', this.uploadBackground) : formData.append('upload_preset', this.uploadProfile);
//     // formData.append('quality', 'auto');
//     // formData.append('fetch_format', 'auto');
//     // formData.append('public_id', user.displayName ? user.displayName : '');
//     const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

//     return this.http.post<{ secure_url: string }>(url, formData).pipe(
//       switchMap(response => {
//         if (background) {
//           this.firestore.collection('users').doc(user.email ?? '').set({
//             backgroundImageURL: response.secure_url,
//           }, { merge: true });
//           return of(response.secure_url); // Ensure an Observable is returned
//         } else {
//           this.firestore.collection('users').doc(user.email ?? '').set({
//             'userinfo.photoURL': response.secure_url
//           });
//           return of(response.secure_url); // Wrap the string in an Observable
//         }
//       }), catchError(error => {
//         console.error('Cloudinary upload error:', error);
//         return throwError(() => new Error('Upload failed. Check console for details.'));
//       })
//     );
//   }
// }
