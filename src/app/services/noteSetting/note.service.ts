import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';

import firebase from 'firebase/compat/app';
import { AuthService } from '../auth/auth.service';
import { Note } from '../../interfaces/note';
import { firstValueFrom, merge } from 'rxjs';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class noteService {

  constructor(private firestore: AngularFirestore, private auth: AuthService, private loader: LoadingService) { }

  async addNote(note: Note): Promise<void> {
    this.loader.show();
    const user: firebase.User | null = this.auth.getuser();
    if (!user) { return };

    const userRef = this.firestore.collection('users').doc(user.email ?? '');
    const folder = note.folder;

    if (!note.docId) {
      if (folder === 'uncategorized') {
        /// ملاحظة جديدة بدون مجلد أو docId
        const docRef = await userRef.collection(folder).add({ ...note, docId: '' });
        await docRef.update({ docId: docRef.id });
      } else {
        /// ملاحظة جديدة داخل مجلد معين
        const docRef = await userRef.collection('categorized').doc(folder).collection('notes').add({ ...note, docId: '' });
        await docRef.update({ 'docId': docRef.id });
      }
    } else {

      if (note.isBookmarked) {
        /// تحديث ملاحظة مرجعية
        this.Bookmark(note);
      }

      if (folder === 'uncategorized') {
        /// تحديث ملاحظة غير مصنفة
        await userRef.collection(folder).doc(note.docId).update({
          'content': note.content,
          'folder': note.folder,
          'title': note.title,
          'updatedAt': note.updatedAt
        });
      } else {
        /// تحديث ملاحظة داخل مجلد معين
        await userRef.collection('categorized').doc(folder).collection('notes').doc(note.docId).update({
          'content': note.content,
          'folder': note.folder,
          'title': note.title,
          'updatedAt': note.updatedAt
        });
      }

    }

    this.loader.hide();
    return;

  }

  async deleteNote(note: any): Promise<void> {
    this.loader.show();
    const user: firebase.User | null = this.auth.getuser();
    if (user) {
      if (note['folder'] === 'uncategorized') {

        /// if this note is bookmarked delete it from bookmark collection
        if (note.isBookmarked == true) { await this.unBookmark(note) }

        await this.firestore
          .collection('users')
          .doc(user.email ?? '')
          .collection('uncategorized')
          .doc(note['docId'])
          .delete();


      } else {

        /// if this note is bookmarked delete it from bookmark collection
        if (note.isBookmarked == true) { await this.unBookmark(note) }

        await this.firestore
          .collection('users')
          .doc(user.email ?? '')
          .collection('categorized')
          .doc(note.folder)
          .collection('notes')
          .doc(note.docId)
          .delete();


      }
      this.loader.hide();
    }
  }

  async Bookmark(note: any): Promise<void> {
    const user: firebase.User | null = this.auth.getuser();
    if (user) {

      if (note['folder'] === 'uncategorized') {
        const docRef = this.firestore.collection('users').doc(user.email ?? '').collection('uncategorized').doc(note['docId']);
        docRef.update({ isBookmarked: true });
        const snapshot = await firstValueFrom(docRef.get());
        const data = snapshot?.data();
        if (data) {
          await this.firestore
            .collection('users')
            .doc(user.email ?? '')
            .collection('Bookmark')
            .doc(note['docId'])
            .set(data);
        }
      } else {
        const docRef = this.firestore.collection('users').doc(user.email ?? '').collection('categorized').doc(note['folder']).collection('notes').doc(note['docId']);
        docRef.update({ isBookmarked: true });
        const snapshot = await firstValueFrom(docRef.get());
        const data = snapshot.data();
        if (data) {
          await this.firestore
            .collection('users')
            .doc(user.email ?? '')
            .collection('Bookmark')
            .doc(note['docId'])
            .set(data);
        }
      }
    }
  }

  async unBookmark(note: any): Promise<void> {
    const user: firebase.User | null = this.auth.getuser();
    if (user) {
      await this.firestore
        .collection('users')
        .doc(user.email ?? '')
        .collection('Bookmark')
        .doc(note['docId'])
        .delete();

      if (note['folder'] === 'uncategorized') {
        const docRef = this.firestore.collection('users').doc(user.email ?? '').collection('uncategorized').doc(note['docId']);
        docRef.update({ isBookmarked: false });

      } else {
        const docRef = this.firestore.collection('users').doc(user.email ?? '').collection('categorized').doc(note['folder']).collection('notes').doc(note['docId']);
        docRef.update({ isBookmarked: false });

      }
    }
  }

  async addtofolder(note: any, folder: string): Promise<void> {
    this.loader.show();
    const user = this.auth.getuser();
    if (!user) { return; }

    // Save bookmark status before deletion
    const wasBookmarked = note.isBookmarked;

    // remove the old one (but don't unbookmark yet)
    if (note['folder'] === 'uncategorized') {
      await this.firestore.collection('users')
        .doc(user.email ?? '')
        .collection('uncategorized')
        .doc(note['docId'])
        .delete();
    } else {
      await this.firestore.collection('users')
        .doc(user.email ?? '')
        .collection('categorized')
        .doc(note['folder'])
        .collection('notes')
        .doc(note['docId'])
        .delete();
    }

    // update note's folder
    note.folder = folder;

    // add to new folder
    const docRef = this.firestore.collection('users')
      .doc(user.email ?? '')
      .collection('categorized')
      .doc(folder);

    await docRef.set({ folderName: folder });
    await docRef.collection('notes').doc(note['docId']).set(note);

    // restore bookmark if it was bookmarked
    if (wasBookmarked) {
      await this.firestore.collection('users')
        .doc(user.email ?? '')
        .collection('Bookmark')
        .doc(note['docId'])
        .update({ folder: folder });
    }

    this.loader.hide();
  }

  async deleteFolder(folder: string): Promise<void> {
    const user: firebase.User | null = this.auth.getuser();
    if (!user) { return }
    const folderRef = this.firestore.collection('users')
      .doc(user.email ?? '')
      .collection('categorized')
      .doc(folder);

    const subcollections = folderRef.collection('notes');
    const subDocsSnapshot = await firstValueFrom(subcollections.get());

    subDocsSnapshot.forEach(async (doc) => {
      await subcollections.doc(doc.id).delete();
    });

    await folderRef.delete();

  }

  async renameFolder(oldFolder: string, newFolderName: string): Promise<void> {
    const user: firebase.User | null = this.auth.getuser();
    if (!user) { return }

    const folderRef = this.firestore.collection('users')
      .doc(user.email ?? '')
      .collection('categorized');


    const folderdata = await firstValueFrom(folderRef.doc(oldFolder).collection('notes').get());
    let notes: firebase.firestore.DocumentData[] = folderdata.docs.map((doc) => doc.data());
    const newfolder = folderRef.doc(newFolderName);
    await newfolder.set({ folderName: newFolderName });
    notes.forEach(async (note) => {
      await newfolder.collection('notes').doc(note['docId']).set(note);
      await newfolder.collection('notes').doc(note['docId']).update({ folder: newFolderName });
      if (note['isBookmarked'] === true) {
        await this.firestore
          .collection('users')
          .doc(user.email ?? '')
          .collection('Bookmark')
          .doc(note['docId'])
          .update({ folder: newFolderName });
      }
    });
    this.deleteFolder(oldFolder);
  }
}



// async addNote(note: Note): Promise<void> {
//   this.loader.show();
//   const user: firebase.User | null = this.auth.getuser();
//   if (user) {
//     if (note.folder === 'uncategorized') {
//       if (note.docId === null) {
//         const docref = await this.firestore
//           .collection('users')
//           .doc(user.email ?? '')
//           .collection('uncategorized')
//           .add(note);
//         docref.update({ docId: docref.id }).finally(() => this.loader.hide());

//       } else {

//         if (note.isBookmarked == true) {
//           await this.firestore
//             .collection('users')
//             .doc(user.email ?? '')
//             .collection('Bookmark')
//             .doc(note.docId ?? '')
//             .set(note).finally(() => this.loader.hide());

//           await this.firestore
//             .collection('users')
//             .doc(user.email ?? '')
//             .collection('uncategorized')
//             .doc(note.docId)
//             .set(note);


//         } else {
//           await this.firestore
//             .collection('users')
//             .doc(user.email ?? '')
//             .collection('uncategorized')
//             .doc(note.docId)
//             .set(note).finally(() => this.loader.hide());

//         }

//       }


//     } else {
//       if (note.docId === null) {
//         const docref = await this.firestore
//           .collection('users')
//           .doc(user.email ?? '')
//           .collection('categorized')
//           .doc(note.folder)
//           .collection('notes')
//           .add(note);
//         docref.update({ docId: docref.id }).finally(() => this.loader.hide());
//       }
//       if (note.isBookmarked == true) {
//         await this.firestore
//           .collection('users')
//           .doc(user.email ?? '')
//           .collection('Bookmark')
//           .doc(note.docId ?? '')
//           .set(note).finally(() => this.loader.hide());
//         await this.firestore
//           .collection('users')
//           .doc(user.email ?? '')
//           .collection('categorized')
//           .doc(note.folder)
//           .collection('notes')
//           .doc(note.docId ?? '')
//           .set(note);

//       } else {
//         await this.firestore
//           .collection('users')
//           .doc(user.email ?? '')
//           .collection('categorized')
//           .doc(note.folder)
//           .collection('notes')
//           .doc(note.docId ?? '')
//           .set(note).finally(() => this.loader.hide());

//       }

//     }
//   }

// }