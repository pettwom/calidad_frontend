import { Component, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import { SocketService } from 'src/app/Services/socket.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-traspaso',
  templateUrl: './traspaso.component.html',
  styleUrls: ['./traspaso.component.css'],
})
export class TraspasoComponent implements OnInit {
  listaSearchTrans: any = [];
  dtOptions = {};
  rolesJefatura: any;
  disabledAsigname: any;
  usuariosCalidad: any;
  selUsuario: any;
  notificationSub: Subscription;
  notifications: any;

  constructor(
    private serviceService: ServicesService,
    private socketService: SocketService
  ) {}
  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      searching: true,
      language: LanguageApp.spanish_datatables,
      processing: false,
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
            columns: [0, 1, 2, 3, 4, 5, 6, 7,8,9], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
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
              autoFilter.setAttribute('ref', 'A2:J2'); // Definir el rango de columnas para el filtro

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
    this.listaSearchTrans = ['']
    this.selUsuario = '';
    setInterval(() => {
      if (localStorage.length != 0) {
        this.listaCuestionarios();
        this.listadoUsuario();
        this.notificationSub = this.socketService
          .onNotification()
          .subscribe((notification) => {
            this.notifications.push(notification);
          });
      }
    }, 3000);
  }


  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    this.socketService.disconnect();
  }

  rowColor(id_estado) {
    switch (id_estado) {
      case 4:
        return 'row-danger';
    }
  }

  listaCuestionarios() {
    this.rolesJefatura = localStorage.getItem('id_rol');
    this.listaSearchTrans = ['']
    this.serviceService
      .get(`/transferencia/listarCuestionarios`)
      .subscribe((res: any) => {
        this.listaSearchTrans = res.data;
        // if (res.data.length > 0) {
        //   this.listaSearch = res.data;
        // } else {
        //   Swal.fire('No hay cuestionarios disponibles', '', 'info');
        // }
        console.log(this.listaSearchTrans,'<==== pruebva');

      });
  }

  listadoUsuario(){
    this.serviceService.get(`/transferencia/asignarUsuario`)
    .subscribe((res: any) => {
      this.usuariosCalidad = res.data;
    })
  }
  asignarme(id) {
    Swal.fire({
      title: '¿Estás seguro de que deseas Asignarse este cuestionario?',
      text: 'Una vez Asignado este cuestionario, nadie mas lo podra ver hasta que lo apruebe',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, asignar',
      cancelButtonText: 'No, asignar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceService
          .post(`/transferencia/asigname`, { ids: id })
          .subscribe((res: any) => {
            this.disabledAsigname = '';
            Swal.fire({
              title: res.title,
              text: res.text,
              icon: res.icon,
              showConfirmButton: false,
              timer: 2500,
            });
          });
      }
    });
  }
}
