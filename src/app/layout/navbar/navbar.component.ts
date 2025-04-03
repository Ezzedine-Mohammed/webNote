import { Component } from '@angular/core';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private search: SearchService) { }
  searchInput: string = '';

  sentInputValue() {
    this.search.getValue(this.searchInput);
  }
}
