import { Component, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { ServicesService } from 'src/app/Services/services.sevice';
import * as $ from 'jquery';
import 'select2';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';

@Component({
  selector: 'app-asignacion',
  templateUrl: './asignacion.component.html',
  styleUrls: ['./asignacion.component.css'],
})
export class AsignacionComponent implements OnInit, AfterViewInit {
  dtTrigger: Subject<any> = new Subject<any>();
  listUser: any;
  userId: any;
  deptoOption: any;
  // deptoSelect: any;
  // mpioSelect: any;
  // agSelect: any;
  // aeSelect: any;
  empSelect: any;
  deptoModel: any;
  mpioModel: any;
  comModel: any;
  agModel: any;
  aeModel: any;
  empModel: any = '';
  visibleMpio: boolean = false;
  visibleCom: boolean = false;
  visibleAg: boolean = false;
  visibleAe: boolean = false;
  visibleEmp: boolean = false;
  depto: any = '';
  mpios: any = '';
  com: any = '';
  ag: any = '';
  ae: any = '';
  emp: any = '';
  mpioResult: any;
  comResult: any={};
  agResult: any;
  aeResult: any;
  empResult: any;
  listaSearch: any = {};
  dtOptions = {};
  visibleValidar: boolean = false;
  visibleObservar: boolean = false;
  modal_cargando: boolean = false;
  textValidar: any;
  rep_id: any;
  textObservar: any;
  listCuest: any = [''] ;
  // dtTrigger: any;
  btnDisabled: boolean = true;
  i: number;
  seleccionados: any = [''];
  eventSelect = $('.select_user');
  selectDisabled: boolean = true;
  formAsignar: any = {};
  mpio: any;


  constructor(
    private serviceService: ServicesService,
    private element: ElementRef
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      processing: true,
      language: LanguageApp.spanish_datatables,
      searching: true,
      columnDefs: [
        {
          targets: 0, // La primera columna (de checkboxes)
          orderable: false, // Desactivar el orden para los checkboxes
          searchable: false, // Desactivar la búsqueda en esta columna
        },
      ],
    };

    this.getDepto();
    this.depto = document.getElementById('deptoSel');



    this.deptoModel = '';
    this.mpioModel = '';
    this.comModel = '';
    this.agModel = '';
    this.aeModel = '';
    this.empSelect = [''];
    this.depto = document.getElementById('deptoSel');
    this.listCuest = [''];
    this.listUser = [''];
    this.listasUsuarios();
    if (this.dtTrigger) {
      this.dtTrigger.next(null);
    }
  }
  selectAll(event: any): void {
    const isChecked = event.target.checked;
    this.listCuest.forEach((item) => {
      item.selected = isChecked; // Marcar todas las filas según el estado del checkbox
      this.seleccionados.push(item.rep_id);
    });
  }
  onSelectRow(row: any, index: number): void {
    console.log(row);

    this.seleccionados.push(row.rep_id);
  }
  getSelectedRows(): any[] {
    return this.listCuest.filter((item) => item.selected); // Filtrar las filas seleccionadas
  }
  ngAfterViewInit(): void {
    if (typeof $.fn.select2 !== 'undefined') {
      ($('#select2') as any).select2({
        placeholder: 'Seleccione una opción',
        allowClear: true,
        theme: 'classic',
      });
      $('#select2').on('change', (event: any) => {
        const selectedValue = $(event.target).val();
        if (selectedValue.length > 0) {
          this.btnDisabled = false;
        } else {
          this.btnDisabled = true;
        }
        // Aquí puedes realizar otras acciones con el valor seleccionado
      });
    } else {
      console.error('Select2 no está disponible.');
    }
  }
  getDepto() {
    this.deptoModel = ''
    this.serviceService.get(`/validar/getDeptos`).subscribe((res: any) => {
      // console.log(res.data);
      this.deptoOption = res.data;

    });
  }
  getMpio() {
    this.mpioResult = [''];
    console.log(this.depto.value, 'depto');
    this.mpioModel = '';
    this.serviceService
      .get(`/validar/getMpio/${this.depto.value}`)
      .subscribe((res: any) => {
        this.mpioResult = res.data;
        this.consulta();
        // this.consulta(this.depto.value);
      });
  }
  getCom() {
    this.comResult = [''];
    this.comModel = '';
    this.serviceService
      .get(`/validar/getCom/${this.deptoModel}/${this.mpioModel}`)
      // .get(`/validar/getCom/${this.depto.value}/${this.mpios.value}`)
      .subscribe((res: any) => {
        this.comResult = res.data;
        // this.mpios = document.getElementById('mpioSel');
        this.consulta();
        // this.consulta(this.depto.value, this.mpios.value);


      });
  }
  getAg() {
    // console.log(this.depto.value, 'depto');
    // console.log(this.mpios.value, 'mpios');
    // console.log(this.com.value, 'com');
    this.agResult = [''];
    this.agModel = '';
    this.serviceService
      .get(
        `/validar/getAg/${this.deptoModel}/${this.mpioModel}/${this.comModel}`
        // `/validar/getAg/${this.depto.value}/${this.mpios.value}/${this.com.value}`
      )
      .subscribe((res: any) => {
        this.agResult = res.data;
        // this.com = document.getElementById('comSel');
        this.consulta();
        // this.consulta(this.depto.value,this.mpios.value,this.com.value);


      });
  }
  getAe() {
    this.aeResult = [''];
    this.aeModel = '';
    this.serviceService
      .get(
        `/validar/getAe/${this.deptoModel}/${this.mpioModel}/${this.comModel}/${this.agModel}`
      )
      .subscribe((res: any) => {
        this.aeResult = res.data;
        // this.ag = document.getElementById('agSel');
        // this.consulta(this.depto.value, this.mpios.value, this.ag.value);
        this.consulta();

      });
  }
  getEmp() {
    this.empModel= '';
    this.ae = document.getElementById('aeSel');
    this.consulta();
  }
  consulta() {
  // consulta(depto = null, mpio = null, com = null, ag = null, ae = null) {
    this.depto = this.deptoModel?this.deptoModel:null;
    this.mpio = this.mpioModel?this.mpioModel:null;
    this.com = this.comModel?this.comModel:null;
    this.ag = this.agModel?this.agModel:null;
    this.ae = this.aeModel?this.aeModel:null;
    this.listaSearch = [''];
    this.empResult = [''];
    // console.log(this.depto,this.mpio,this.com,this.ag,this.ae);
    this.serviceService
      .get(`/validar/getEmp/${this.depto}/${this.mpio}/${this.com}/${this.ag}/${this.ae}`)
      .subscribe((res: any) => {
        console.log(res.data,'<=== data');

        if (res.data.length == 0) {
          Swal.fire({
            icon: 'info',
            title: 'Información',
            text: res.text,
            showConfirmButton: false,
            timer: 2000,
          });
        }

        if (res.data == undefined) {
          this.empResult = [{
            id_empadronador: '',
            empadronador: 'No Existe datos',
          }];
        } else {
          this.empResult = res.data;
        }
      });
  }
  asignar() {
    // console.log(this.seleccionados, '<== asignar')
    let variable = $('#select2 option:selected').val();
    console.log(this.seleccionados, '<=== variable');

    variable = variable.toString().split("'")[1];
    // console.log(variable, 'variable');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción puede modificar la información del validador',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.formAsignar = {
          rep_id: this.seleccionados,
          user_id: variable,
          depto_id: this.deptoModel,
          mpio_id: this.mpioModel,
          fecha_asignacion: new Date(),
        };

        // console.log(this.formAsignar, '<==== Asignar');

        this.serviceService
          .post(`/validar/saveAsignar`, this.formAsignar)
          .subscribe((res: any) => {
            // this.searchValidador()
            Swal.fire({
              icon: res.icon,
              title: res.title,
              text: res.text,
              showConfirmButton: false,
              timer: 2000,
            });
          });
        this.seleccionados = [];
        this.searchValidador(2)
      }
    });
  }
  limiarDatos() {}
  radioValue(e) {
    document.getElementById('details').setAttribute('open', '');
    this.visibleEmp = true;
    switch (e.target.value) {
      case 'depto':
        this.visibleMpio = false;
        this.visibleCom = false;
        this.visibleAg = false;
        this.visibleAe = false;

        this.mpioModel = '';
        this.agModel = '';

        break;
      case 'mpio':
        this.visibleMpio = true;
        this.visibleCom = false;
        this.visibleAg = false;
        this.visibleAe = false;
        this.agModel = '';
        break;
      case 'com':
        this.visibleMpio = true;
        this.visibleCom = true;
        this.visibleAg = false;
        this.visibleAe = false;
        this.agModel = '';
        break;
      case 'ag':
        this.visibleMpio = true;
        this.visibleCom = true;
        this.visibleAg = true;
        this.visibleAe = false;
        break;
      case 'ae':
        this.visibleMpio = true;
        this.visibleCom = true;
        this.visibleAg = true;
        this.visibleAe = true;
        break;
    }
  }
  searchValidador(accion) {
    this.deptoModel = this.deptoModel ? this.deptoModel : null;
    this.mpioModel = this.mpioModel ? this.mpioModel : null;
    this.comModel = this.comModel ? this.comModel : null;
    this.agModel = this.agModel ? this.agModel : null;
    this.aeModel = this.aeModel ? this.aeModel : null;
    this.empModel = this.empModel ? this.empModel : null;
    this.listCuest = [''];
    this.serviceService
      .get(
        `/validar/getListado/${this.deptoModel}/${this.mpioModel}/${this.comModel}/${this.agModel}/${this.aeModel}/${this.empModel}/${accion}`
      )
      .subscribe((res: any) => {
        // console.log('Tipo de respuesta:', typeof res.data, res.data);
        this.selectDisabled = false;

        setTimeout(() => {
          document.getElementById('resAsignacion')?.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
        this.listCuest = res.data;
        console.log(this.listCuest, 'resdata');
      });
  }

  listasUsuarios() {
    this.serviceService.get(`/asignar/getUser`).subscribe((res: any) => {
      // console.log(res.data.length);
      this.listUser = res.data;

      // console.log(this.listUser);
    });
  }
}
