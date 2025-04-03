import { Pipe, PipeTransform } from '@angular/core';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { DocumentData } from 'firebase/firestore';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(notes: DocumentData[], searchInput: string): DocumentData[] {
    if (searchInput.trim() == '') {
      return notes;
    } else {
      return notes.filter(note => (note["title"] && note["title"].toLowerCase().includes(searchInput.toLowerCase())) ||
        (note["content"] && note["content"].toLowerCase().includes(searchInput.toLowerCase())))
    }
  }

}
