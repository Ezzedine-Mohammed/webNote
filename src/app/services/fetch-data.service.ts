import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import firebase from 'firebase/compat/app';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { catchError, combineLatest, filter, firstValueFrom, map, Observable, of, startWith, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FetchDataService {

  constructor(private auth: AuthService, private firestore: AngularFirestore) {
  }

  fetchAllNotes(): Observable<{ notes: any[] }> {
    return this.auth.authState.pipe(
      filter((currentUser): currentUser is firebase.User => !!currentUser && !!currentUser.email),
      switchMap(currentUser => {
        const uncategorizedNotes$ = this.firestore
          .collection('users')
          .doc(currentUser.email ?? '')
          .collection('uncategorized', ref => ref.orderBy('createdAt', 'desc'))
          .valueChanges();

        const categorizedFolders$ = this.firestore
          .collection('users')
          .doc(currentUser.email ?? '')
          .collection('categorized', ref => ref.orderBy('folderName', 'asc'))
          .snapshotChanges()
          .pipe(map(actions => actions.map(a => a.payload.doc.id)));

        return combineLatest([uncategorizedNotes$, categorizedFolders$]).pipe(
          switchMap(([uncategorizedNotes, folders]) => {
            if (folders.length === 0) {
              return of({ notes: uncategorizedNotes });
            }

            const categorizedNotes$ = combineLatest(
              folders.map(folder =>
                this.firestore
                  .collection('users')
                  .doc(currentUser.email ?? '')
                  .collection('categorized')
                  .doc(folder)
                  .collection('notes', ref => ref.orderBy('createdAt', 'desc'))
                  .valueChanges()
              )
            ).pipe(map(notesArray => notesArray.flat()));

            return combineLatest([of(uncategorizedNotes), categorizedNotes$]).pipe(
              map(([uncategorized, categorized]) => ({ notes: [...uncategorized, ...categorized] }))
            );
          })
        );
      }),
      startWith({ notes: [] }),
      catchError(error => {
        // console.error('Error fetching notes:', error);
        return of({ notes: [] });
      })
    );
  }



  fetchFolders(): Observable<string[]> {
    const currentUser: firebase.User | null = this.auth.getuser();
    if (!currentUser || !currentUser.email) {
      // console.log('No user logged in. Cannot fetch notes.');
      return of([]);
    }

    return this.firestore
      .collection('users')
      .doc(currentUser.email)
      .collection('categorized')
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => a.payload.doc.id))
      );


  }

  bookmarkedNotes(): Observable<DocumentData[]> {
    const currentUser: firebase.User | null = this.auth.getuser();
    if (!currentUser || !currentUser.email) {
      // console.log('No user logged in. Cannot fetch notes.');
      return of([]); // Return an empty observable instead of an array
    }
    return this.firestore
      .collection('users')
      .doc(currentUser.email ?? '')
      .collection('Bookmark', ref => ref.orderBy('createdAt', 'desc')).valueChanges();
  }
  // return this.firestore
  //   .collection('users')
  //   .doc(currentUser.email ?? '')
  //   .collection('Bookmark', ref => ref.orderBy('createdAt', 'desc')).valueChanges();

  folderNote(folderName: string): Observable<DocumentData[]> {
    const currentUser: firebase.User | null = this.auth.getuser();
    if (!currentUser) { return of([]); }
    return this.firestore
      .collection('users')
      .doc(currentUser.email ?? '')
      .collection('categorized')
      .doc(folderName)
      .collection('notes', ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges();
  }
}
