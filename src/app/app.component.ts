// import { Component,ChangeDetectorRef, OnInit } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css'],
// })
// export class AppComponent implements OnInit {
//   loading$ = new BehaviorSubject<boolean>(false);

//   constructor(private cdr: ChangeDetectorRef) {}

//   ngOnInit(): void {
//     this.startLoading();
//   }

//   startLoading() {
//     this.loading$.next(true);  // Activar la pantalla de carga

//     this.loading$.next(true);
//     setTimeout(() => this.loading$.next(false), 0);
//   }
// }
import { Component } from '@angular/core';
import { LoadingService } from './Services/loading.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Conteo-frontend';
  loading$: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }
}
