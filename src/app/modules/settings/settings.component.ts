import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { SettingsService } from '../../services/settings/settings.service';
import { CurrentUserService } from '../../services/current user/current-user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],

})
export class SettingsComponent implements OnInit, OnDestroy {

  constructor(private auth: AuthService, private sservice: SettingsService, private user: CurrentUserService, private cd: ChangeDetectorRef) {
  }


  popup: boolean = false;
  popupmassage: string = '';
  imageTitle: string = '';
  upload: boolean = false;
  background: boolean = false;
  userinfo: {
    profilePic: string,
    backgroundPic: string,
    userName: string,
    emailVerified: boolean,
  } = {
      profilePic: '',
      backgroundPic: '',
      userName: '',
      emailVerified: false,
    };

  changeName: boolean = false;
  name: string = '';
  private destroy$ = new Subject<void>();

  ///get userInfo
  ngOnInit(): void {
    this.user.backgroundUrl$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(url => {
      this.userinfo.backgroundPic = url;
    });

    this.user.username$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(username => {
      this.userinfo.userName = username;
    });

    this.user.userphotoUrl$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(photoUrl => {
      this.userinfo.profilePic = photoUrl;
    });
    this.user.useremailVerified$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(emailVerified => {
      this.userinfo.emailVerified = emailVerified;
    });

    this.verifiedBtn();
  }

  /// unsubscribe
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /// wait for the data t chack  if the email is verified or not, to send email or not
  verifiedBtn() {
    const verifiedBtn = document.getElementById('verified-btn') as HTMLButtonElement;
    verifiedBtn.disabled = true;
    setTimeout(() => {
      verifiedBtn.disabled = false;
    }, 200);
  }

  // sent notification
  notification() {
    this.popup = true;
    /// بعض الاوقات angular بتسقط منه شوية شياء ثناء ما بعمل procss فاا ممكن تستخد 
    // detectChanges() هاي بتعمل check على كامل النظام وبتستهلك موارد كثير 
    // + لو حاطط interrceptor وبالاخص لو كان الinterceptor بيظهر loader رح يزيد الوقت لحد ما يخلص detectChanges()
    // ممكن تستخدم markForCheck() بيعمل check على الشي الي انت بدك ياه بدل ما يعمل على النظام ككل ومش هتواجه مشاكل مع ال interceptor
    this.cd.markForCheck();
    setTimeout(() => {
      this.popup = false;
    }, 2500);
  }

  //show upload-row (upload profile picture)
  uploadF() {
    this.upload = true;
  }

  //hide upload-row
  cancelF() {
    this.upload = false;
    this.background = false;
    this.imageTitle = '';
  }

  // show upload-row (upload background picture)
  uploadBackground() {
    this.upload = true;
    this.background = true;
  }

  uploadImg() {
    const input = document.getElementById('fileInput');
    (input as HTMLInputElement).click();
  }

  /// show the file title in span
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.imageTitle = input.files[0].name;
    }
  }

  /// upload the file (image) to cloudinary
  save() {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (!input?.files?.[0]) {
      this.popupmassage = 'please choose a picture first';
      this.notification();
      return;
    }

    this.sservice.uploadImage(input.files[0], this.background).subscribe({
      next: (url) => {
        if (this.background) {
          this.user.backgroundUrlSubject.next(url);
        }
      },
      error: (error) => {
        console.error(error);
        this.popupmassage = 'some kind of error happened please try again';
        this.notification();
      },
      complete: () => {
        this.popupmassage = 'image uploaded successfully';
        this.notification();
        this.cancelF();
      }
    });
  }

  // show && hide name-row 
  ChangeName() {
    this.changeName = !this.changeName;
  }

  changeNameF() {
    if (this.name == '') {
      this.popupmassage = 'please enter name first';
      this.notification();
      return
    }
    this.sservice.updateUserName(this.name);
    this.popupmassage = 'name changed';
    this.notification();
    this.ChangeName();
  }

  async verfieEmail() {
    await this.auth.verfieEmail().then((msg) => {
      this.popupmassage = msg;
      this.notification();
    });
  }

  async resetPassword() {
    await this.auth.resetPassword().then((msg) => {
      this.popupmassage = msg;
      this.notification();
    });
  }

}



//   save() {
//   const input = document.getElementById('fileInput') as HTMLInputElement;
//   if (!input?.files?.[0]) {
//     this.popupmassage = 'please choose a picture first';
//     this.notification();
//     return;
//   }

//   this.sservice.uploadImage(input.files[0], this.background).subscribe({
//     next: (url) => {
//       if (this.background) {
//         this.user.backgroundUrlSubject.next(url);
//       }
//     },
//     error: (error) => {
//       console.error(error);
//       this.popupmassage = 'some kind of error happened please try again';
//       this.notification();
//     },
//     complete: () => {
//       this.popupmassage = 'image uploaded successfully';
//       this.notification();
//       this.cancelF();
//     }
//   });
// }