import { Component, OnDestroy, OnInit } from '@angular/core';
import { Note } from '../../interfaces/note';
import { FormControl, FormGroup } from '@angular/forms';
import { FetchDataService } from '../../services/fetch-data.service';
import firebase from 'firebase/compat/app';
import { noteService } from '../../services/noteSetting/note.service';
import { DocumentData } from 'firebase/firestore';
import { CurrentUserService } from '../../services/current user/current-user.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private noteS: noteService, private data: FetchDataService, private user: CurrentUserService, private search: SearchService) {
  }


  Notes: any[] = [];
  addNote: boolean = false;
  popup: boolean = false;
  popupmassage: string = '';
  noteuid: string | null = null;
  show: boolean = true;
  folderList: string[] = [];
  selectedFolder: string = '';
  hoverdFolder: string = '';
  newFolder: string = '';
  Saddfolder: boolean = false;
  selectedNote: firebase.firestore.DocumentData | null = null;
  updateNote: boolean = false;
  fullScreen: boolean = false;
  searchValue: string = '';
  private destroy$ = new Subject<void>();
  note = new FormGroup({
    title: new FormControl<string>(''),
    content: new FormControl<string>('')
  });

  ngOnInit() {
    this.fetchAllNotes();
    this.fetchFolders();
    this.user.getUserinfo();

    this.search.searchInput$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchValue = value;
    });

  }

  /// unsubscribe
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchAllNotes() {
    this.data.fetchAllNotes().subscribe(value => this.Notes = value.notes)
  }

  fetchFolders() {
    this.data.fetchFolders().subscribe(value => this.folderList = value);
  }

  addingNote() {
    this.addNote = true;
  }

  updatingNote(note: any) {
    this.updateNote = true;
    this.selectedNote = note;

    this.note.patchValue({
      title: note['title'],
      content: note['content']
    });

  }

  cancel() {
    this.addNote = false;
    this.updateNote = false;
    this.fullScreen = false;
    this.note.reset();
    this.selectedNote = null
  }

  clickOutSide() {
    setTimeout(() => {
      const element = document.getElementById('form-adding-note');

      const onClick = (event: MouseEvent) => {
        if (element && !element.contains(event.target as Node)) {
          document.removeEventListener('click', onClick);
          this.cancel();
        }
      };

      // إضافة مستمع الحدث لمرة واحدة
      document.addEventListener('click', onClick);
    }, 0);

  }

  onSubmit(form: FormGroup) {
    if ((this.note.value.content !== '' || this.note.value.title !== '') &&
      (this.note.value.content !== null || this.note.value.title !== null)) {
      const newNote: Note = {
        title: this.note.value.title || '',
        content: this.note.value.content || '',
        folder: this.updateNote ? (this.selectedNote ? this.selectedNote['folder'] : 'uncategorized') : 'uncategorized',

        createdAt: this.updateNote ? (this.selectedNote ? this.selectedNote['createdAt'] : new Date().toLocaleString('en-US', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })) : new Date().toLocaleString('en-US', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),

        updatedAt: this.updateNote ? new Date().toLocaleString('en-US', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : null,

        isBookmarked: this.updateNote ? (this.selectedNote ? this.selectedNote['isBookmarked'] : false) : false, /// cheack if it's updating the note, put the value as the selected note 

        docId: this.updateNote ? (this.selectedNote ? this.selectedNote['docId'] : null) : null,
      };

      this.noteS.addNote(newNote);
      if (this.updateNote && this.selectedNote && this.selectedNote['isBookmarked']) { this.noteS.Bookmark(newNote); }
      this.notification();
      this.popupmassage = 'note saved'
      form.reset();
    } else {
      this.popupmassage = 'cannot save empty note'
      this.notification();
      return;
    }
    this.selectedNote = null;
  }

  fullscreen(note: any) {
    this.fullScreen = true;
    this.selectedNote = note;
  }

  notification() {
    this.popup = true;
    setTimeout(() => {
      this.popup = false;
    }, 2500);
  }

  showDataSetting(i: number) {

    const dataSettings = document.getElementsByClassName('data-settings');
    const ulSettings = document.getElementsByClassName('ul-settings');
    const dataIcon = document.getElementsByClassName('data-icon');

    (dataSettings[i] as HTMLElement).style.opacity = (dataSettings[i] as HTMLElement).style.opacity === '1' ? '' : '1';
    (ulSettings[i] as HTMLElement).style.display = (ulSettings[i] as HTMLElement).style.display === 'block' ? 'none' : 'block';
    (dataIcon[i] as HTMLElement).style.background = (dataIcon[i] as HTMLElement).style.background === '#a9cf92e8' ? '' : '#a9cf92e8';

  }

  hideDataSettings(i: number) {
    const dataSettings = document.getElementsByClassName('data-settings');
    const ulSettings = document.getElementsByClassName('ul-settings');
    const dataIcon = document.getElementsByClassName('data-icon');
    (dataSettings[i] as HTMLElement).style.opacity = '';
    (ulSettings[i] as HTMLElement).style.display = 'none';
    (dataIcon[i] as HTMLElement).style.background = '';

  }

  async deleteNote(note: any) {
    await this.noteS.deleteNote(note);
    this.notification();
    this.popupmassage = 'note deleted'
  }

  bookmark(note: any) {
    this.notification();
    this.popupmassage = 'note bookmarked'
    this.noteS.Bookmark(note);
  }

  SaddFolder(note: firebase.firestore.DocumentData) {
    this.fetchFolders();
    this.selectedFolder = '';
    this.newFolder = '';
    this.Saddfolder = true;
    this.selectedNote = note;
  }
  HaddFolder() {
    this.Saddfolder = false;
  }


  showFolders() {

    const folders = document.getElementById('folders');
    const folderList = document.getElementsByClassName('folder-list');

    if (!folders) return;

    if (this.show) {

      folders.style.display = 'block';
      folders.animate([
        { height: '0' },
        { height: (100 * folderList.length) + '%' }
      ], {
        duration: 300,
        iterations: 1,
        fill: 'both'
      });
    } else {

      const animation = folders.animate([
        { height: (100 * folderList.length) + '%' },
        { height: '0' }
      ], {
        duration: 500,
        iterations: 1,
        fill: 'both'
      });

      animation.onfinish = () => {
        folders.style.display = 'none';
      };
    }

    this.show = !this.show;
  }

  hoverdFolderF(folder: string) {
    this.hoverdFolder = folder;
  }
  unhoverFolder() {
    this.hoverdFolder = '';
  }
  slecteFolder(folder: string) {
    this.selectedFolder = folder
    const folders = document.getElementById('folders');
    const folderList = document.getElementsByClassName('folder-list');
    const newFolder = document.getElementById('new-folder-name');
    if (!folders) { return }
    const animation = folders.animate([
      { height: (100 * folderList.length) + '%' },
      { height: '0' }
    ], {
      duration: 300,
      iterations: 1,
      fill: 'both'
    });

    animation.onfinish = () => {
      folders.style.display = 'none';
    };


    this.show = !this.show;
    if (newFolder) {
      newFolder.setAttribute('disabled', 'true');
      // (newFolder as HTMLInputElement).value = '';
      newFolder.setAttribute('placeholder', 'disabled');

    }

  }
  cancelFolder() {
    this.selectedFolder = '';
    const folders = document.getElementById('folders');
    const folderList = document.getElementsByClassName('folder-list');
    const newFolder = document.getElementById('new-folder-name');
    if (!folders) { return }
    folders.style.display = 'block';
    folders.animate([
      { height: '0' },
      { height: (100 * folderList.length) + '%' }
    ], {
      duration: 300,
      iterations: 1,
      fill: 'both'
    });

    this.show = !this.show;

    if (newFolder) {
      newFolder.removeAttribute('disabled');
      newFolder.removeAttribute('placeholder');
      // (newFolder as HTMLInputElement).value = '';
    }
  }
  saveFolder() {
    if (this.selectedFolder == '') {
      if (this.newFolder == '') {
        this.notification();
        this.popupmassage = 'please select folder or create new one first';
        throw new Error('please select folder or create new one first');
      } else {
        this.popupmassage = `saved note to ${this.newFolder}`
        this.notification();
        this.noteS.addtofolder(this.selectedNote, this.newFolder);
      }
    } else {
      this.popupmassage = `saved note to ${this.selectedFolder}`
      this.notification();
      this.noteS.addtofolder(this.selectedNote, this.selectedFolder);
    }
    this.selectedNote = null;
    this.HaddFolder()
  }


}