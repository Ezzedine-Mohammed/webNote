import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserData } from '../../interfaces/uerData ';
import { resolve } from 'path';
import { __values } from 'tslib';
@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {

  constructor(private auth: AuthService, private firestore: AngularFirestore) {
    this.getUserinfo();
  }
  
  usernameSubject = new BehaviorSubject<string>('');
  userphotoUrlSubject = new BehaviorSubject<string>('');
  backgroundUrlSubject = new BehaviorSubject<string>('');
  private useremailSubject = new BehaviorSubject<string>('');
  private useruidSubject = new BehaviorSubject<string>('');
  private useremailVerifiedSubject = new BehaviorSubject<boolean>(false);

  username$ = this.usernameSubject.asObservable();
  userphotoUrl$ = this.userphotoUrlSubject.asObservable();
  backgroundUrl$ = this.backgroundUrlSubject.asObservable();
  useremail$ = this.useremailSubject.asObservable();
  useruid$ = this.useruidSubject.asObservable();
  useremailVerified$ = this.useremailVerifiedSubject.asObservable();

  test: boolean = true;

  


  getUserinfo() {
    this.auth.authState.subscribe(
      async user => {
        if (!user) { this.resetUser(); return }
        const db = this.firestore.collection('users').doc(user.email ?? '').get();
        const data = await firstValueFrom(db);
        if (data.exists) {
          const userData = data.data() as UserData; // Cast to the UserData interface
          this.usernameSubject.next(user.displayName || '');
          this.useremailSubject.next(user.email || '');
          this.useruidSubject.next(user.uid || '');
          this.userphotoUrlSubject.next(user.photoURL || '');
          this.backgroundUrlSubject.next(userData.backgroundImageURL || '');
          this.useremailVerifiedSubject.next(user.emailVerified ? user.emailVerified : userData.emailVerified || false);
        }
      }
    )
  }

  private resetUser() {
    this.usernameSubject.next('');
    this.userphotoUrlSubject.next('');
    this.backgroundUrlSubject.next('');
    this.useremailSubject.next('');
    this.useruidSubject.next('');
    this.useremailVerifiedSubject.next(false);
  }
}





  // getUserinfo() {
  //   const user = this.auth.getuser();

  //   // if (!user) { return }
  //   this.auth.authState.pipe(
  //     switchMap(user => {
  //       if (!user) {
  //         this.resetUser();
  //         return of(null);
  //       }

  //       return this.firestore.collection('users').doc(user.email ?? '').get().pipe(
  //         take(1) // لتجنب الاشتراكات المتعددة
  //       );
  //     })
  //   ).subscribe(doc => {
  //     if (!doc?.exists) {
  //       this.resetUser();
  //       return;
  //     }

  //     const data = doc.data() as UserData;
  //     console.log(data, 'data');
  //     this.usernameSubject.next(data.userinfo[0]?.displayName || '');
  //     this.useremailSubject.next(data.userinfo[0]?.email || '');
  //     this.useruidSubject.next(data.userinfo[0]?.uid || '');
  //     this.userphotoUrlSubject.next(data.userinfo[0]?.photoURL || '');
  //     this.backgroundUrlSubject.next(data.backgroundImageURL || '');
  //     this.userphoneNumberSubject.next(data.userinfo[0]?.phoneNumber || '');
  //     this.useremailVerifiedSubject.next(user?.emailVerified ? user.emailVerified : data.emailVerified || false);
  //   });

  // }

  

//   constructor(private auth: AuthService, private firestore: AngularFirestore) {
//     this.getuser();
//   }
//   currentUser: Observable<firebase.User | null> =
//     this.auth.authState.asObservable();

//   username: string = '';
//   userphotoUrl: string = '';
//   useremail: string = '';
//   useruid: string = '';
//   userphoneNumber: string = '';
//   useremailVerified: boolean = false;

//    getuser() {
//     try {
//       this.auth.authState.subscribe((user) => {
//         if (user) {
//           const userRef = this.firestore
//             .collection('users')
//             .doc(user.email ?? '');
//           userRef.get().subscribe((doc) => {
//               const data = doc.data() as any;
//               this.username = data.userinfo[0].displayName;
//               this.useremail = data.userinfo[0].email;
//               this.useruid = data.userinfo[0].uid;
//               this.userphotoUrl = data.userinfo[0].photoURL;
//               this.userphoneNumber = data.userinfo[0].phoneNumber;
//               this.useremailVerified = data.emailVerified;
//           });
//         }else {
//           this.username = '';
//           this.userphotoUrl = '';
//           this.useremail = '';
//           this.useruid = '';
//           this.userphoneNumber = '';
//           this.useremailVerified = false;
//         }
//       });
//     } catch (error) {
//       console.log('failed to get user');
//       console.log(error);
//     }
//   }
// }

// username = this.usernameSubject.asObservable();

// private userphotoUrlSubject = new BehaviorSubject<string>('');
// userphotoUrl = this.userphotoUrlSubject.asObservable();

// private useremailSubject = new BehaviorSubject<string>('');
// useremail = this.userphotoUrlSubject.asObservable();

// private useruidSubject = new BehaviorSubject<string>('');
// useruid = this.useruidSubject.asObservable();

// private userphoneNumerSubject = new BehaviorSubject<string>('');
// userphoneNumber = this.userphoneNumerSubject.asObservable();

// private useremailVerifiedSubject = new BehaviorSubject<boolean>(false);
// useremailVerified = this.useremailVerifiedSubject.asObservable();

// this.currentUser.subscribe(user => {
//   if (user) {
//     this.usernameSubject.next(user?.displayName ?? '');
//     this.userphotoUrlSubject.next(user?.photoURL ?? '');
//     this.useremailSubject.next(user?.email ?? '');
//     this.useruidSubject.next(user?.uid ?? '');
//     this.userphoneNumerSubject.next(user?.phoneNumber ?? '');
//     this.useremailVerifiedSubject.next(user?.emailVerified ?? false);

// this.userphotoUrlSubject.next('');
// this.useremailSubject.next('');
// this.useruidSubject.next('');
// this.userphoneNumerSubject.next('');
// this.useremailVerifiedSubject.next(false);
//   } else {
//     this.usernameSubject.next('');
//     this.userphotoUrlSubject.next('');
//     this.useremailSubject.next('');
//     this.useruidSubject.next('');
//     this.userphoneNumerSubject.next('');
//     this.useremailVerifiedSubject.next(false);

//   }
// });
