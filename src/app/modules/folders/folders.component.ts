import { Component, OnInit } from '@angular/core';
import { FetchDataService } from '../../services/fetch-data.service';
import { DocumentData } from 'firebase/firestore';
import { noteService } from '../../services/noteSetting/note.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Note } from '../../interfaces/note';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrl: './folders.component.scss'
})
export class FoldersComponent implements OnInit {
  constructor(private data: FetchDataService, private noteS: noteService, private search: SearchService) { }

  folders: string[] = []
  notes: DocumentData[] = [];
  selectedFolder: string = '';
  selectedFolder$: string = '';
  popup: boolean = false;
  popupmassage: string = '';
  warnning: boolean = false;
  rename: boolean = false;
  renameFolder: string = '';
  fullScreen: boolean = false;
  selectedNote: DocumentData | null = null;
  addNote: boolean = false;
  updateNote: boolean = false;
  newFolder: string = '';
  Saddfolder: boolean = false;
  show: boolean = true;
  hoverdFolder: string = '';
  searchValue: string = '';
  private destroy$ = new Subject<void>();

  note = new FormGroup({
    title: new FormControl<string>(''),
    content: new FormControl<string>('')
  });

  ngOnInit(): void {
    this.foldersName()

    this.search.searchInput$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchValue = value;
    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onSubmit(form: FormGroup) { // changed here
    if ((this.note.value.content !== '' || this.note.value.title !== '') &&
      (this.note.value.content !== null || this.note.value.title !== null)) {
      // if (this.updateNote == true) { this.noteS.deleteNote(this.selectedNote); }
      const newNote: Note = {
        title: this.note.value.title || ' ',
        content: this.note.value.content || '',
        folder: this.selectedFolder,

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

  showDataSetting(i: number) {
    const dataSettings = document.getElementsByClassName('data-Settings');
    const ulSettings = document.getElementsByClassName('ul-Settings');
    const dataIcon = document.getElementsByClassName('data-Icon');

    (dataSettings[i] as HTMLElement).style.opacity = (dataSettings[i] as HTMLElement).style.opacity === '1' ? '' : '1';
    (ulSettings[i] as HTMLElement).style.display = (ulSettings[i] as HTMLElement).style.display === 'block' ? 'none' : 'block';
    (dataIcon[i] as HTMLElement).style.background = (dataIcon[i] as HTMLElement).style.background === '#a9cf92e8' ? '' : '#a9cf92e8';

  }

  hideDataSettings(i: number) {
    const dataSettings = document.getElementsByClassName('data-Settings');
    const ulSettings = document.getElementsByClassName('ul-Settings');
    const dataIcon = document.getElementsByClassName('data-Icon');
    (dataSettings[i] as HTMLElement).style.opacity = '';
    (ulSettings[i] as HTMLElement).style.display = 'none';
    (dataIcon[i] as HTMLElement).style.background = '';

  }

  foldersName() {
    this.data.fetchFolders().subscribe(value => this.folders = value)
  }

  fetchNotes(folderName: string) {
    this.data.folderNote(folderName).subscribe(value => this.notes = value);
    this.selectedFolder = folderName;
  }

  deleteFolder(folderName: string) {
    this.selectedFolder = folderName;
    this.data.folderNote(folderName).subscribe(value => {
      if (value.length > 0) {
        this.warnningF();
        return;
      } else {
        this.noteS.deleteFolder(folderName);
        this.foldersName();
        this.cancelwarnning();
        this.selectedFolder = '';
        this.popupmassage = 'Folder Deleted';
        this.notification();
      }
    });
  }

  notification() {
    this.popup = true;
    setTimeout(() => {
      this.popup = false;
    }, 2500);
  }

  warnningF() {
    this.warnning = true;
  }
  cancelwarnning() {
    this.warnning = false;
  }
  deleteanyway() {
    this.noteS.deleteFolder(this.selectedFolder);
    this.foldersName();
    this.cancelwarnning();
    this.selectedFolder = '';
    this.notes = [];
    this.popupmassage = 'Folder Deleted';
    this.notification();
  }
  showFolderSetting(i: number) {

    const folderSettings = document.getElementsByClassName('folder-settings');
    const ulSettings = document.getElementsByClassName('ul-settings');
    // const settingsIcon = document.getElementsByClassName('settings-icon');

    (folderSettings[i] as HTMLElement).style.opacity = (folderSettings[i] as HTMLElement).style.opacity === '1' ? '' : '1';
    (ulSettings[i] as HTMLElement).style.display = (ulSettings[i] as HTMLElement).style.display === 'block' ? 'none' : 'block';
    // (settingsIcon[i] as HTMLElement).style.background = (settingsIcon[i] as HTMLElement).style.background === 'aquamarine' ? '' : 'aquamarine';

  }

  hideFolderSettings(i: number) {
    const dataSettings = document.getElementsByClassName('folder-settings');
    const ulSettings = document.getElementsByClassName('ul-settings');
    // const dataIcon = document.getElementsByClassName('settings-icon');
    (dataSettings[i] as HTMLElement).style.opacity = '';
    (ulSettings[i] as HTMLElement).style.display = 'none';
    // (dataIcon[i] as HTMLElement).style.background = '';

  }

  cancelRename() {
    this.rename = false;
    this.renameFolder = '';
  }
  renameFolderF(folder: string) {
    this.rename = true;
    this.selectedFolder = folder;
  }
  renameFolderS() {
    this.noteS.renameFolder(this.selectedFolder, this.renameFolder);
    this.foldersName();
    this.selectedFolder = this.renameFolder;
    this.rename = false;
    this.renameFolder = '';
    this.popupmassage = 'Folder Renamed';
    this.notification
  }

  fullscreen(note: any) {
    this.fullScreen = true;
    this.selectedNote = note;
  }

  cancelFullscreen() {
    this.selectedNote = null;
    this.fullScreen = false;
  }

  deleteNote(note: any) {
    this.noteS.deleteNote(note);
    this.selectedNote = null;
    this.popupmassage = 'Note Deleted';
    this.notification();
  }

  bookmark(note: any) {
    this.noteS.Bookmark(note);
    this.popupmassage = 'Note Bookmarked';
    this.notification();
  }

  moveNoteToFolder(note: any, folder: string) {
    this.noteS.addtofolder(note, folder);
    this.popupmassage = 'Note Moved';
    this.notification();
  }

  SaddFolder(note: any) {

    this.selectedFolder$ = ''; //// note['folder']
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
    this.selectedFolder$ = folder
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
    this.selectedFolder$ = '';
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
    if (this.selectedFolder$ == '') {
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
      this.popupmassage = `saved note to ${this.selectedFolder$}`
      this.notification();
      this.noteS.addtofolder(this.selectedNote, this.selectedFolder$);
      this.notes = this.notes.filter(note => note !== this.selectedNote);
      console.log(this.notes, 'this.notes');
    }
    this.selectedNote = null;
    this.selectedFolder$ = '';
    this.fetchNotes(this.selectedFolder);
    this.HaddFolder()
  }
}
