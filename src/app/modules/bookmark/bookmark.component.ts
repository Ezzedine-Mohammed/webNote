import { Component, OnDestroy, OnInit } from '@angular/core';
import { FetchDataService } from '../../services/fetch-data.service';
import { DocumentData } from 'firebase/firestore';
import { Subject, takeUntil } from 'rxjs';
import { noteService } from '../../services/noteSetting/note.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrl: './bookmark.component.scss'
})
export class BookmarkComponent implements OnInit, OnDestroy {

  Notes: DocumentData[] = [];
  popup: boolean = false;
  popupmassage: string = '';
  fullScreen: boolean = false;
  selectedNote: DocumentData | null = null;
  searchValue: string = '';
  private destroy$ = new Subject<void>();

  constructor(private data: FetchDataService, private noteS: noteService, private search: SearchService) { }

  ngOnInit(): void {
    this.fetchNotes();

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

  fetchNotes() {
    this.data.bookmarkedNotes().subscribe(value => {
      this.Notes = value;
    });
  }

  unBookmark(note: any) {
    this.popupmassage = 'unBookmarked note'
    this.notification();
    this.noteS.unBookmark(note);
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

  notification() {
    this.popup = true;
    setTimeout(() => {
      this.popup = false;
    }, 2500);
  }




  fullscreen(note: any) {
    this.fullScreen = true;
    this.selectedNote = note;
  }

  cancel() {
    this.selectedNote = null;
    this.fullScreen = false;
  }

}
