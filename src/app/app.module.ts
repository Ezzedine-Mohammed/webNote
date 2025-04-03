import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

///components
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './modules/home/home.component';
import { AsideComponent } from './layout/aside/aside.component';
import { BookmarkComponent } from './modules/bookmark/bookmark.component';
import { FoldersComponent } from './modules/folders/folders.component';
import { LoaderComponent } from './layout/loader/loader.component';

//environment
import { environment } from '../environments/environment';

// استيراد Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { SignComponent } from './modules/sign/sign/sign.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './modules/settings/settings.component';
import { UploadInterceptor } from './interceptor/upload.interceptor';
import { SearchPipe } from './pipes/search.pipe';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    AsideComponent,
    SignComponent,
    BookmarkComponent,
    FoldersComponent,
    LoaderComponent,
    SettingsComponent,
    SearchPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireStorageModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
