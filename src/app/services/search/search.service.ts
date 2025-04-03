import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }
  private searchInputSource = new BehaviorSubject<string>('');
  searchInput$ = this.searchInputSource.asObservable();

  getValue(value: string) {
    const input = document.getElementById('search') as HTMLInputElement;
    if (input) {
      // input.value
      this.searchInputSource.next(input.value);
      if (input.classList.contains('d-none')) {
        input.classList.remove('d-none')
      } else {
        input.classList.add('d-none');
      }
    }
  }
}


// input.animate([
//   { width: '30px' }
// ], {
//   duration: 300,
//   iterations: 1,
// });