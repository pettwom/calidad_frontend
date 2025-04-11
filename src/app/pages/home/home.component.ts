import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { ServicesService } from 'src/app/Services/services.sevice';
import { Subscription } from 'rxjs';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  datosEst: any;
  obs: any;
  aprob: any;
  pend: any;
  dtOptions = {};
  aprobadosList: any;
  observadosList: any;
  transferidosList: any;
  alertasAprobdos: any;
  alertasObservado: any;
  alertasTransferido: any;
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
    this.dtOptions = {
      paging: true,
      processing: true,
      language: LanguageApp.spanish_datatables,
      searching: true,
  //    fixedHeader: true,
      dom: 'Bfrtip', // Para incluir los botones
      buttons: [
        {
          extend: 'print',
          text: '<i class="fa-solid fa-print"></i> Imprimir',
          className: 'btn btn-warning',
        },

        {
          extend: 'excel',
          text: '<i class="fa-solid fa-file-excel"></i> Descargar Excel',
          title: 'Reporte de Alertas',
          className: 'btn btn-info',
          exportOptions: {
            // Especificar las columnas que quieres exportar por índice
            columns: [0, 1, 2, 3, 4, 5, 6, 7,8,9,10], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
          },
          customize: function (xlsx) {
            let sheet = xlsx.xl.worksheets['sheet1.xml'];
            // Modificar el fondo de los encabezados
            const headers = sheet
              .getElementsByTagName('row')[0]
              .getElementsByTagName('c');
            for (let i = 0; i < headers.length; i++) {
              const header = headers[i];
              // Agregar fondo color gris claro a los encabezados
              header.setAttribute('s', '30'); // 's' hace referencia al estilo en Excel (fondo de celda)
            }

            // Cambiar el tamaño de las fuentes y poner en negrita los encabezados
            const rows = sheet.getElementsByTagName('row');
            for (let row of rows) {
              const cells = row.getElementsByTagName('c');
              for (let cell of cells) {
                const style = cell.getAttribute('s');
                if (style && style === '30') {
                  // Si el estilo es de los encabezados, hacemos que el texto sea negrita
                  cell.setAttribute('t', 'inlineStr');
                  const istring = document.createElement('is');
                  const t = document.createElement('t');
                  t.textContent = cell.textContent; // el valor del título de la celda
                  istring.appendChild(t);
                  cell.textContent = '';
                  cell.appendChild(istring);
                  // Aplicamos estilo de texto negrita a los encabezados
                  cell.setAttribute('s', '2'); // '2' es el estilo en Excel para texto en negrita
                }
              }
            }
            // Comprobar si ya existe el filtro y agregarlo si no está presente
            // Comprobar si ya existe el filtro y agregarlo si no está presente
            const autofilter = sheet.getElementsByTagName('autoFilter');
            if (autofilter.length === 0) {
              const autoFilter = document.createElement('autoFilter');
              autoFilter.setAttribute('ref', 'A2:K2'); // Definir el rango de columnas para el filtro

              // Asegúrate de insertarlo en la estructura correcta del XML (dentro de <worksheet>).
              let worksheetNode = sheet.getElementsByTagName('worksheet')[0];

              // Insertamos el filtro en el lugar correcto
              if (worksheetNode) {
                worksheetNode.appendChild(autoFilter);
              }
            }
          },
        },
      ],
    };
    this.serviceService.get(`/home/getEstadisticas`).subscribe((res: any) => {
      this.datosEst = res.text[0];
      console.log(this.datosEst.observado, '<==0 estado');

      setInterval(() => {
        this.obs = this.datosEst.observado;
      }, 10); // Cada 10ms
      setInterval(() => {
        this.aprob = this.datosEst.aprobado;
      }, 10); // Cada 10ms
      setInterval(() => {
        this.pend = this.datosEst.pendiente;
      }, 10); // Cada 10ms
    });
    this.alertasAprobdos = false;
    this.alertasObservado = false;
    this.alertasTransferido = false;
this.aprobadosList = '';
this.observadosList = '';
this.transferidosList = '';
this.getAprobados();
this.getObservados();
this.getTransferidos();
  }

  getAprobados() {
    this.serviceService.get(`/home/getAprobados`).subscribe((res: any) => {
      this.aprobadosList = res.data;
      console.log(this.aprobadosList);

    });
  }
  getObservados() {
    this.serviceService.get(`/home/getObservados`).subscribe((res: any) => {
      this.observadosList = res.data;
    });
  }
  getTransferidos() {
    this.serviceService.get(`/home/getTransferidos`).subscribe((res: any) => {
      this.transferidosList = res.data;
    });
  }
  divModal(tipo) {
    console.log(tipo);

    switch (tipo) {
      case 'aprobado':
        this.alertasAprobdos = true;
        break;
      case 'observado':
        this.alertasObservado = true;
        break;
      case 'transferido':
        this.alertasTransferido = true;
        break;
    }
  }

  ngAfterViewInit() {}
}
