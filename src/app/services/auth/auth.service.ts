import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';


import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState: BehaviorSubject<firebase.User | null> = new BehaviorSubject<firebase.User | null>(null);
  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore, private router: Router) {
    this.afAuth.authState.subscribe(user => {
      this.authState.next(user);
    });

  }

  async signUp(email: string, password: string, name: string) : Promise<void>{
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({ displayName: name });
        await this.firestore.collection('users').doc(user.email ?? '').set({
          userinfo: user.providerData,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          role: 'user',
          password: password,
          backgroundImageURL: null,
        });
      }
    } catch (err) {
      throw err;
    }
  }
 
  async login(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password)
    
    } catch (err: any) {
      throw err;
    }
  }

  async logout() {
    this.afAuth.signOut();
  }

  async signupWithGoogle() : Promise<void>{
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(await this.afAuth.app);
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      const user = result.user;
      const userEmail = user.email ?? '';
      const docRef = this.firestore.collection('users').doc(userEmail);
      const docSnap = await firstValueFrom(docRef.get());

      if (docSnap.exists) {
        this.logout();
        throw new Error('User already exists');
      } else {
        await this.firestore.collection('users').doc(userEmail).set({
          userinfo: user.providerData,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          role: 'user',
        });
      }
    } catch (err) {
      throw err
    }
  }

  async signinWithGoogle(): Promise<void> { 
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(await this.afAuth.app);
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      const user = result.user;

      const docRef = this.firestore.collection('users').doc(user.email ?? '')
      const docSnap = await firstValueFrom(docRef.get());
      if (docSnap.exists) {
        return;
      } else {
        this.logout();
        await user.delete();
        throw new Error('no signed up user with this email')
        // await this.firestore.collection('users').doc(user.email ?? '').set({
        //   userinfo: user.providerData,
        //   emailVerified: user.emailVerified,
        //   createdAt: new Date(),
        //   role: 'user',
        // });
      }
    } catch (err) {
      throw err;
    }
  }

  getuser(): firebase.User | null {
    let currentUser: firebase.User | null = null;
    this.authState.subscribe(user => {
      currentUser = user;
    });
    return currentUser;
  }

  async verfieEmail(): Promise <string> {
    const user = this.getuser()
    if (!user) { return 'you should login first' }
    if (!user.emailVerified) {
      await user.sendEmailVerification();
      return 'verfie email sent';
    } 
      return 'email already verified';
  }

  async resetPassword(): Promise <string> {
    const user = this.getuser()
    if (!user) { return 'you should login first' }
    if(user.emailVerified){
      await this.afAuth.sendPasswordResetEmail(user.email ?? '');
      return 'rest password email sent'
    }
    return 'you need to verfie your email first ';
  }



  // private getFirebaseErrorMessage(errorCode: string): string {
  //   const errorMessages: { [key: string]: string } = {
  //     'auth/user-not-found': 'المستخدم غير موجود، يرجى التسجيل أولاً.',
  //     'auth/wrong-password': 'كلمة المرور غير صحيحة.',
  //     'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل بالفعل.',
  //     'auth/weak-password': 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى.',
  //     'auth/invalid-email': 'البريد الإلكتروني غير صالح.',
  //     'auth/network-request-failed': 'خطأ في الاتصال، تحقق من الإنترنت.',
  //     'auth/popup-closed-by-user': 'تم إغلاق النافذة من قبل المستخدم',
  //     'auth/cancelled-popup-request': 'تم إلغاء طلب النافذة المنبثقة',
  //   };
  //   return errorMessages[errorCode] || 'حدث خطأ أثناء العملية.';
  // }
}




 // isLoggedIn(): Observable<any> {
  //   return this.authState.asObservable();
  // }


  
  
  //if you want to delete user account,, the user should login again and within 5min you can delete the user account
  // if the user is signed up useing email/password you can these from firestore in this case
  // if the user is signed up useing popup you can let him signup again no other way to get has credential which is needed to login and then delete the account

  // async deleteAccount() {
  //   const user = this.getuser();

  //   if (!user) { return }
  //   console.log(this.credential);
  //   if (this.credential) {
  //     try {
  //       user.reauthenticateWithCredential(this.credential);
  //       await user.delete();
  //     }
  //     catch (error) {
  //       console.log(error, 'error');
  //     }
  //   }
  //   user.subscribe(
  //     {
  //       next: async (user) => {
  //         console.log(this.credential, 'credential');
  //         if (this.credential) {
  //           await user?.reauthenticateWithCredential(this.credential);
  //         } else {
  //           throw new Error('Credential is null. Cannot reauthenticate.');
  //         }
  //         await user?.delete(); console.log('user deleted');
  //       },
  //       error: (error) => { console.error(error, 'error'); }
  //     })
  // }
  // }