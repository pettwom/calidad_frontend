import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
// amCharts imports
// import * as am5 from '@amcharts/amcharts5';
// import * as am5percent from '@amcharts/amcharts5/percent';
// import * as am5xy from '@amcharts/amcharts5/xy';
// import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { Chart } from 'angular-highcharts';
import { ServicesService } from 'src/app/Services/services.sevice';
import { Subscription } from 'rxjs';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  chart: Chart;
  datosEst: any;
  obs: any = 0;
  aprob: any = 0;
  pend: any = 0;
  dtOptions = {};
  aprobadosList: any;
  observadosList: any;
  transferidosList: any;
  alertasAprobdos: any;
  alertasObservado: any;
  alertasTransferido: any;
  dataGraf: any;

  constructor(
    private router: Router,
    private serviceService: ServicesService
  ) {}

  // // Ejecute la función solo en el navegador
  // browserOnly(f: () => void) {
  //   if (isPlatformBrowser(this.platformId)) {
  //     this.zone.runOutsideAngular(() => {
  //       f();
  //     });
  //   }
  // }

  ngOnInit(): void {
    this.dataGrafico();
    this.dtOptions = {
      paging: true,
      processing: true,
      language: LanguageApp.spanish_datatables,
      searching: true,
      //      fixedHeader: true,
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
            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
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
  dataGrafico() {
    this.serviceService.get(`/home/getDataGrafico`).subscribe((res: any) => {
      console.log(res, 'dataGrafico');
      // Verifica si res y res.data existen y son un array
      if (res && res.data && Array.isArray(res.data)) {
        this.graficos(res.data);
      } else {
        console.error('Error: Los datos del gráfico no son válidos.', res);
        // Puedes mostrar un mensaje de error al usuario o usar un valor por defecto
        this.graficos([{ titulo: 'Sin Datos', cantidad: 100 }]); // Valor por defecto para evitar error del gráfico
      }
    });
  }
  graficos(data) {
    const self = this; // Para usarlo en el render
let customLabel: any = null;
    this.chart = new Chart({
      chart: {
        type: 'pie',
        events: {
          render() {
            const chart = this,
              series = chart.series[0];

            if (!customLabel) {
              customLabel = chart.renderer
                .label('Cuestionarios', 0, 0, '', 0, 0, true)
                .css({
                  color: '#000',
                  textAlign: 'center',
                  marginLeft: '-18%',
                  marginTop: '-2%'
                })
                .add();
            }

            const x = series.center[0] + chart.plotLeft;
            const y = series.center[1] + chart.plotTop - (customLabel.getBBox().height / 2);

            customLabel.attr({ x, y });
            customLabel.css({ fontSize: `${series.center[2] / 12}px` });
          }
        }
      },
      title: {
        useHTML: true,
        text: '<span class="badge bg-danger">ESTADO DE CUESTIONARIOS</span>',
        align: 'center',
      },
      subtitle: {
        text: ''
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 8,
          innerSize: '75%', // ✅ aquí va innerSize
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.y}',
            style: {
              fontSize: '13px'
            }
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Cuestionarios',
        // colorByPoint: true,
        data: data
      }]
    });
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
