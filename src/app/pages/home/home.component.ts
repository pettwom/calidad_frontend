import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { ServicesService } from 'src/app/Services/services.sevice';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  datosEst: any;
  obs: any;
  aprob: any;
  pend: any;

  constructor(
    private router: Router,
    private serviceService: ServicesService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {}

  // Ejecute la función solo en el navegador
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngOnInit(): void {
    this.serviceService.get(`/home/getEstadisticas`).subscribe((res:any)=>{
      this.datosEst = res.text[0];
      console.log(this.datosEst.observado ,'<==0 estado');

      setInterval(() => {
       this.obs = this.datosEst.observado
      }, 10); // Cada 10ms
      setInterval(() => {
       this.aprob = this.datosEst.aprobado
      }, 10); // Cada 10ms
      setInterval(() => {
       this.pend = this.datosEst.pendiente
      }, 10); // Cada 10ms
    })




  }

  ngAfterViewInit() {
  }
}
