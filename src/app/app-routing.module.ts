import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { SignComponent } from './modules/sign/sign/sign.component';
import { signedGuard } from './guard/signed.guard';
import { BookmarkComponent } from './modules/bookmark/bookmark.component';
import { FoldersComponent } from './modules/folders/folders.component';
import { authGuard } from './guard/auth.guard';
import { SettingsComponent } from './modules/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'Home', canActivate: [authGuard] },
  { path: 'sign', component: SignComponent, title: 'Sign', canActivate: [signedGuard] },
  { path: 'bookmark', component: BookmarkComponent, title: 'Bookmark', canActivate: [authGuard] },
  { path: 'folders', component: FoldersComponent, title: 'Folders', canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, title: 'Settings', canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' } // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
