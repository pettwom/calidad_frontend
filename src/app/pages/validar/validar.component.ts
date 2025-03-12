import { Component, OnInit } from '@angular/core';
import { ButtonDomButtonEl } from 'datatables.net';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validar',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css'],
})
export class ValidarComponent implements OnInit {
  [x: string]: any;
  //variables
  departamento: any;
  muicipio: any;
  tipoCues: any;
  codCues: any;
  listaSearch: any = [];
  dtOptions = {};
  dtOptionsAlert = {};
  visibleValidar: boolean = false;
  visibleObservar: boolean = false;
  modal_cargando: boolean = false;
  textValidar: any;
  rep_id: any;
  textObservar: any;
  alertasModal: boolean;
  preguntas: any;
  respuestas: any;
  // construnctor
  constructor(private serviceService: ServicesService) {}
  // funcion inicial
  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      processing: true,
      language: LanguageApp.spanish_datatables,
      searching: true,
    };
    this.respuesta = [];
    this.dtOptionsAlert = {
      paging: true,
      processing: true,
      language: LanguageApp.spanish_datatables,
      searching: true,
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
            columns: [0, 1, 2, 3, 4, 5, 6, 7], // Solo exportar las columnas "Nombre" (índice 0) y "Edad" (índice 1)
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
              autoFilter.setAttribute('ref', 'A2:H2'); // Definir el rango de columnas para el filtro

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
    this.depto = document.getElementById('deptoSel');
    this.listaSearch = [];
    this.searchValidador();
  }

  // funciones

  searchValidador() {
    this.listaSearch = [''];
    this.serviceService
      .get(`/validar/getListadoCuest/`)
      .subscribe((res: any) => {
        this.listaSearch = res.data;
      });
  }

  verCuest(fila) {
    this.alertasModal = true;
    // console.log(fila.rep_id, '<=== rep_id');
    this.rep_id = fila.rep_id;
    this.departamento = fila.depto;
    this.municipio = fila.mpio;
    this.tipoCues = fila.cue_titulo;
    this.codCues = fila.cuestionario;
    this.textValidar = '';
    // console.log('getAlertas');
    this.serviceService
      .get(`/validar/getAlertas/${fila.rep_id}`)
      .subscribe((res: any) => {
        console.log(res.data,'getAlertas resData');

        if (res.data) this.respuesta = res.data ? res.data : [];
        else this.alertasModal = false;
        if (!res.data){
          Swal.fire({
            title: res.title,
            icon: res.icon,
            text: res.text,
            timer: 2500,
            showConfirmButton: false
          });
        }
      });
  }

  validarCuest(id) {
    // console.log(id, '<=== rep_id');
    this.rep_id = id;
    this.alertasModal = true;
    this.textValidar = '';
    this.serviceService
      .get(`/validar/getValidar/${id}`)
      .subscribe((res: any) => {
        this.textValidar = res.data[0].observacion;
      });
  }

  observarCuest(id, tipo) {
    this.tipo_submit = tipo;
    this.visibleObservar = true;
    this.textObservar = '';
    this.rep_id = id;
    if (tipo == 'observar') {
      this.titulo = 'Observar Cuestionario';
      this.tipo_submit= 4;
      this.textArea =
        'Importante: Al observar el cuestionario, este quedará habilitado para la revisión del empadronador.';
      this.subTextArea =
        'Detalle claramente las observaciones de manera que el empadronador entienda las acciones que debe realizar.';
      // this.almacenarValidacion(id, 'observar');
      // this.serviceService
      //   .get(`/validar/getValidar/${id}`)
      //   .subscribe((res: any) => {
      //     this.textValidar = res.data[0].observacion;
      //   });
    } else {
      this.titulo = 'Enviar a Jefatura';
      this.tipo_submit= 13;
      this.textArea =
        'Importante: El cuestionario sera enviado a la Jefatura de Temática, para su revisión';
      this.subTextArea =
        'Detalle claramente las observaciones de manera que el empadronador entienda las acciones que debe realizar.';
      // this.serviceService.post('/validar/postSaveJefatura')
    }
  }
  // aprobarCuest(rep_id){
  //   this.serviceService.post('/validar/aprobarCuest',{'rep_id':rep_id})
  //   .subscribe(res => {
  //     Swal.fire({
  //       title: 'Éxito!',
  //       text: 'El cuestionario ha sido aprobado.',
  //       icon:'success',
  //       timer: 2500,
  //     });
  //     this.searchValidador();
  //   })
  // }

  modalCuest(ids:number, tipo, num_preg = null){
    this.rep_id = ids?ids:this.rep_id;
    this.visibleValidar = false;
    this.visibleObservar = false;
    this.alertasModal = false;
    switch (tipo) {
      case 'validar':
        this.textValidar = '';
        this.visibleObservar = false;
        this.visibleValidar = true;
        this.alertModal = false;
        this.titulo = 'Validar Cuestionario';
        this.textArea = 'Importante: Al validar el cuestionario, este ya no podra verse en su bandeja de entrada.';
        this.subTextArea ='Detalle claramente las observaciones de manera que el empadronador entienda las acciones que debe realizar.';
        this.texto = 'Esta Seguro de Validar este cuestionario, ya que tiene observaciones en las preguntas ?';
        this.tipoRep = '1' // 1 = cuestionario, 2=pregunta
        this.tipo_submit = 7;
        break;
      case 'observar':
        this.textObservar = '';
        this.visibleObservar = true;
        this.visibleValidar = false;
        this.alertModal = false;
        this.titulo = 'Observar Cuestionario';
        this.textArea ='Importante: Al observar el cuestionario, este quedará habilitado para la revisión del empadronador.';
        this.subTextArea ='Detalle claramente las observaciones de manera que el empadronador entienda las acciones que debe realizar.';
        this.texto ='Una vez que observe este cuestionario será habilitado para la revisión del empadronador';
        this.tipoRep = '1' // 1 = cuestionario, 2=pregunta
        this.tipo_submit = 4;
        this.tituloBoton = 'Observar';
        this.clases = 'btn btn-danger';
        break;
      case 'jefatura':
          this.textObservar = '';
          this.visibleObservar = true;
          this.visibleValidar = false;
          this.titulo = 'Transferencia a Jefatura de Temática';
          this.textArea ='Importante: El cuestionario sera enviado a la Jefatura de Temática, para su revisión';
          this.subTextArea ='Detalle claramente las observaciones de manera que el personal de temática entienda las acciones que debe revisar.';
          this.texto ='Detalle claramente las observaciones de manera que el personal de temática entienda las acciones que debe revisar.';
          this.tituloBoton = 'Transferir';
          this.tipoRep = '1' // 1 = cuestionario, 2=pregunta
          this.clases = 'btn btn-info';
          this.tipo_submit = 13;
        break;
      case 'validarPreg':
          this.textObservar = '';
          this.visibleObservar = true;
          this.visibleValidar = false;
          this.titulo = 'Validar Pregunta';
          this.textArea ='Importante: La pregunta sera validada y desaparecera de su bandeja';
          this.subTextArea ='Detalle claramente la justificación, de manera que el personal de temática entienda la razon de la aprobación.';
          this.texto ='Detalle claramente la justificación de manera que el personal de temática entienda la razón de la aprobación.';
          this.tituloBoton = 'Transferir';
          this.tipoRep = '2' // 1 = cuestionario, 2=pregunta
          this.clases = 'btn btn-success';
          this.tipo_submit = 7;
          this.preg = num_preg;
        break;
      case 'observarPreg':
          this.textObservar = '';
          this.visibleObservar = true;
          this.visibleValidar = false;
          this.titulo = 'Observación de la pregunta';
          this.textArea ='Importante: Al observar el cuestionario, este quedará habilitado para la revisión del empadronador.';
          this.subTextArea ='Detalle claramente las observaciones de manera que el empadronador entienda las acciones que debe realizar.';
          this.texto ='Una vez que observe este cuestionario será habilitado para la revisión del empadronador';
          this.tituloBoton = 'Transferir';
          this.tipoRep = '2' // 1 = cuestionario, 2=pregunta
          this.clases = 'btn btn-danger';
          this.tipo_submit = 4;
          this.preg = num_preg;
        break;
    }
  }
  almacenarValidacion() {
    this.visibleValidar = false;
    this.visibleObservar = false;
    this.alertasModal = false;

    Swal.fire({
      title: '¿Está seguro?',
      icon: 'info',
      text: `${this.texto}`,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log({tipo: this.tipo_submit,
          ids: this.rep_id,
          dato: this.textObservar?this.textObservar:this.textValidar});
        this.serviceService
          .post(`/validar/save-validar`, {
            tipo: this.tipo_submit,
            ids: this.rep_id,
            dato: this.textObservar?this.textObservar:this.textValidar,
            tipoRep: this.tipoRep,
            preg: this.preg?this.preg:''
          })
          .subscribe((res: any) => {
            this.searchValidador();
            Swal.fire({
              title: res.title,
              icon: res.icon,
              html: res.text,
              timer: 2500,
              showConfirmButton: false,
            });
          });
      } else {
        // if (tipo == 'validar') {
        //   this.visibleValidar = true;
        // } else {
        //   this.visibleObservar = true;
        // }
      }
    });
  }

  migrarDatos() {
    this.modal_cargando = true;
    this.serviceService.get(`/validar/migrarDatos`).subscribe((res: any) => {
      this.modal_cargando = false;
      const lista = res.data[0].fn_migrar_cuestionarios
        .map((a) => `<li>${a}</li>`)
        .join('');
      Swal.fire({
        title: res.title,
        icon: res.icon,
        html: `<div class="alert alert-info" style="text-align: justify; padding: 5px 30px"> ${lista} </div>`,
        showConfirmButton: true,
      });
    });
  }

  getRowClass(a: any) {
    switch (a.estado) {
      case 'OBSERVADO':
        return 'fila-observado';
      // case 'PENDIENTE':
      //   return 'fila-pendiente';
      // case 'CORREGIDO-APK':
      //   return 'fila-pendiente';
      // case 'JUSTIFICADO-APK':
      //   return 'fila-pendiente';
      // case 'CORREGIDO-PODA':
      //   return 'fila-aprobado';
      // case 'JUSTIFICADO-PODA':
      //   return 'fila-aprobado';
      // case 'APROBADO':
      //   return 'fila-aprobado';
      // case 'TRANSFERIDO':
      //   return 'fila-transferido';
      default:
        return ''; // Clase vacía si no hay coincidencia
    }
  }
}
