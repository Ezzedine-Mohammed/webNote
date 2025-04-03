import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  constructor(private loderService: LoadingService) { }

  show: boolean = false;

  ngOnInit() {
    this.loderService.isloading.subscribe((value) => {
      this.show = value;
    });
  }
}
