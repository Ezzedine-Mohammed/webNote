
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { error } from 'node:console';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.scss'
})
export class SignComponent implements OnInit {
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private auth: AuthService) { 
  }
  warnning: boolean = false;
  warnningMsg: string[] = [];
  
  ngOninit(){
    this.disableButton();
  }
  disableButton(){  
    document.querySelectorAll('button').forEach(button => {
      if (!button.classList.contains('form__button')) {
        button.disabled = true;
      }});
  }


  signin = new FormGroup ({
    signin_email : new FormControl<string>('', [Validators.required, Validators.email]),
    signin_password : new FormControl<string> ('', [Validators.required, Validators.minLength(8)])

  })

  signup = new FormGroup({
    signup_name : new FormControl<string> ('',[Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9 ]{2,29}$/)]),
    signup_email: new FormControl<string | null>('', [Validators.required, Validators.email]),
    signup_password : new FormControl<string> ('', [Validators.required, Validators.minLength(8)]),
     
  })

  // .then((err) => {
  //   console.log(err);
  // });
  async onSubmit(form: FormGroup) : Promise<void>{

    if(form.valid){
      if(form === this.signup){
        console.log('signup form submitted');
        try{
          await this.auth.signUp(form.value.signup_email, form.value.signup_password, form.value.signup_name);
        }catch(err: any){
          if(err.code === 'auth/email-already-in-use'){
            this.warnningMsg.push('there is an account with this email, try different email');
          }
          if(err.code === 'auth/network-request-failed'){
            this.warnningMsg.push('network error, try again');
          }
          this.disableSubmit();
          this.warnning = true;  
        }
      }else{
        console.log('signin form submitted');
        try{
         await this.auth.login(form.value.signin_email, form.value.signin_password)
          form.reset();
        }catch(err: any){
          if (err.code === 'auth/invalid-credential') {
            this.warnningMsg.push('email or password is wrong try again');
            
            console.log(err, 'err');
          }
          if(err.code === 'auth/network-request-failed'){
            this.warnningMsg.push('network error, try again');
            
          }if(err.code != 'auth/network-request-failed' || 'auth/invalid-credential'){
            this.warnningMsg.push('unexpected error occurred')
          }
          this.disableSubmit();
            this.warnning = true;
        }
      }
  }else{
    if(form.get('signup_name')?.errors?.['required']){
      this.warnningMsg.push('Name is required') ;
    }
     if(form.get('signup_name')?.errors?.['minlength']){
      this.warnningMsg.push('Name should minimum length 4 characters');
    }
     if(form.get('signup_name')?.errors?.['pattern']){
      this.warnningMsg.push('Name pattern only numbers and characters (aA-zZ, 0-9)');
    }
     if(form.get('signin_email')?.errors?.['required']){
      this.warnningMsg.push('Email is required') ;
    }
     if(form.get('signup_email')?.errors?.['required']){
      this.warnningMsg.push('Email is required') ;
    }
     if(form.get('signin_email')?.errors?.['email']){
      this.warnningMsg.push('Email is invalid') ;
    }
     if(form.get('signup_email')?.errors?.['email']){
      this.warnningMsg.push('Email is invalid') ;
    }
     if(form.get('signup_password')?.errors?.['required']){
      this.warnningMsg.push('Password is required') ;
    }
     if(form.get('signin_password')?.errors?.['required']){
      this.warnningMsg.push('Password is required') ;
    }
     if(form.get('signin_password')?.errors?.['minlength']){
      this.warnningMsg.push('Password should minimum length 8 characters') ;
    }
     if(form.get('signup_password')?.errors?.['minlength']){
      this.warnningMsg.push('Password should minimum length 8 characters') ;
    }
    this.warnning = true;
    this.disableSubmit();
      return
  }
  
  }

  disableSubmit(){
    document.querySelectorAll('button').forEach(button => {
      if (button.classList.contains('form__button')) {
        button.disabled = true;
      }});
  }

  hideWarnning(){
    document.querySelectorAll('button').forEach(button => {
      if (button.classList.contains('form__button')) {
        button.disabled = false;
      }});
    this.warnning = false;
    this.warnningMsg = [];
  }

  async signupWithGoogle(){
    try{
      await this.auth.signupWithGoogle();
    }catch(err:any){
      if(err.message  == 'User already exists'){
        this.warnningMsg.push('there is an account with this email')
      }else{
        this.warnningMsg.push('An unexpected error occurred. Please try again.')
        this.warnningMsg.push(err)

      }
      this.disableSubmit();
      this.warnning = true;
    }
  }
  async signinWithGoogle(){
    try{
      await this.auth.signinWithGoogle();
    }catch(err: any){
      if(err.message  == 'no signed up user with this email'){
        this.warnningMsg.push('sign up first before logging in')
      }else{
        this.warnningMsg.push('An unexpected error occurred. Please try again.')
      }
      this.disableSubmit();
      this.warnning = true;
    }
  }
  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScript();
    }
  }

  initializeScript(): void {
    const switchCtn = document.querySelector("#switch-cnt") as HTMLElement | null;
    const switchC1 = document.querySelector("#switch-c1") as HTMLElement | null;
    const switchC2 = document.querySelector("#switch-c2") as HTMLElement | null;
    const switchCircle = document.querySelectorAll(".switch__circle") as NodeListOf<HTMLElement>;
    const switchBtn = document.querySelectorAll(".switch-btn") as NodeListOf<HTMLElement>;
    const aContainer = document.querySelector("#a-container") as HTMLElement | null;
    const bContainer = document.querySelector("#b-container") as HTMLElement | null;
    // const allButtons = document.querySelectorAll(".submit") as NodeListOf<HTMLElement>;

    if (!switchCtn || !switchC1 || !switchC2 || !aContainer || !bContainer) {
      // console.warn("Some elements were not found in the DOM.");
      return;
    }

    // const getButtons = (e: Event) => e.preventDefault();

    const changeForm = (e: Event) => {
      
      

      switchCtn.classList.toggle("is-txr");
      switchCircle[0].classList.toggle("is-txr");
      switchCircle[1].classList.toggle("is-txr");

      switchC1.classList.toggle("is-hidden");
      switchC2.classList.toggle("is-hidden");
      aContainer.classList.toggle("is-txl");
      bContainer.classList.toggle("is-txl");
      aContainer.classList.toggle("is-z200");
    };

    const mainF = () => {
       // allButtons.forEach(button => button.addEventListener("click", getButtons));
      switchBtn.forEach(button => button.addEventListener("click", changeForm));
    };

    window.addEventListener("click", mainF);
  }

}


// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-sign',
//   templateUrl: './sign.component.html',
//   styleUrl: './sign.component.scss'
// })
// export class SignComponent implements OnInit {
  
//   constructor() { }

//   ngOnInit(): void {
//     this.initializeScript();
//   }

//   initializeScript(): void {
//     const switchCtn = document.querySelector("#switch-cnt") as HTMLElement;
//     const switchC1 = document.querySelector("#switch-c1") as HTMLElement;
//     const switchC2 = document.querySelector("#switch-c2") as HTMLElement;
//     const switchCircle = document.querySelectorAll(".switch__circle") as NodeListOf<HTMLElement>;
//     const switchBtn = document.querySelectorAll(".switch-btn") as NodeListOf<HTMLElement>;
//     const aContainer = document.querySelector("#a-container") as HTMLElement;
//     const bContainer = document.querySelector("#b-container") as HTMLElement;
//     const allButtons = document.querySelectorAll(".submit") as NodeListOf<HTMLElement>;

//     const getButtons = (e: Event) => e.preventDefault();

//     const changeForm = (e: Event) => {
//       switchCtn.classList.add("is-gx");
//       setTimeout(() => {
//         switchCtn.classList.remove("is-gx");
//       }, 1500);

//       switchCtn.classList.toggle("is-txr");
//       switchCircle[0].classList.toggle("is-txr");
//       switchCircle[1].classList.toggle("is-txr");

//       switchC1.classList.toggle("is-hidden");
//       switchC2.classList.toggle("is-hidden");
//       aContainer.classList.toggle("is-txl");
//       bContainer.classList.toggle("is-txl");
//       bContainer.classList.toggle("is-z200");
//     };

//     const mainF = () => {
//       for (let i = 0; i < allButtons.length; i++) {
//         allButtons[i].addEventListener("click", getButtons);
//       }
//       for (let i = 0; i < switchBtn.length; i++) {
//         switchBtn[i].addEventListener("click", changeForm);
//       }
//     };

//     window.addEventListener("load", mainF);
//   }

// }