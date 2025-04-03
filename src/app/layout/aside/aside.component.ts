import { Component, ElementRef, Inject, OnChanges, OnInit, PLATFORM_ID, Renderer2, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CurrentUserService } from '../../services/current user/current-user.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.scss'
})
export class AsideComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private el: ElementRef, private auth: AuthService, private user: CurrentUserService) {

  }



  userinfo: {
    profilePic: string,
    backgroundPic: string,
    userName: string,
  } = {
      profilePic: '',
      backgroundPic: '',
      userName: '',
    };
  open: boolean = false;
  ngOnInit() {
    this.user.backgroundUrl$.subscribe((url: string) => { this.userinfo.backgroundPic = url });
    this.user.username$.subscribe((name) => (this.userinfo.userName = name));
    this.user.userphotoUrl$.subscribe((photo) => (this.userinfo.profilePic = photo));
    // if (isPlatformBrowser(this.platformId)) {
    //   this.profileBackground();
    // }
  }

  // profileBackground() {
  //   const background = document.getElementById('background') as HTMLElement;
  //   if (this.open == true) {
  //     background.style.backgroundImage = this.userinfo.backgroundPic ? `url(${this.userinfo.backgroundPic})` : `url('../../../assets/background-picture.jpg')`
  //   } else {
  //     background.style.removeProperty('background-image');
  //   }
  // }

  // Toggle sidebar open/close state
  toggleSidebar() {
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
    const navList = this.el.nativeElement.querySelector('.nav-list');
    const closeBtn = this.el.nativeElement.querySelector('#btn');

    sidebar.classList.toggle('open');
    navList.classList.toggle('scroll');
    this.menuBtnChange(closeBtn, sidebar);
  }

  // Function to change the menu button icon
  menuBtnChange(closeBtn: HTMLElement, sidebar: HTMLElement) {
    if (sidebar.classList.contains('open')) {
      closeBtn.classList.replace('bx-menu', 'bx-menu-alt-right');
      this.open = true;
    } else {
      closeBtn.classList.replace('bx-menu-alt-right', 'bx-menu');
      this.open = false;
    }
  }
  logout(): void {
    this.auth.logout();
  }
}
