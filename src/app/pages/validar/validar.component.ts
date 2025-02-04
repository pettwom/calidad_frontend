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
  //variables
  deptoSelect: any;
  mpioSelect: any;
  agSelect: any;
  aeSelect: any;
  empSelect: any;
  deptoModel: any;
  mpioModel: any;
  agModel: any;
  aeModel: any;
  empModel: any;
  visibleMpio: boolean = false;
  visibleAg: boolean = false;
  visibleAe: boolean = false;
  depto: any;
  mpios: any;
  ag: any;
  ae: any;
  emp: any;
  mpioResult: any;
  agResult: any;
  aeResult: any;
  empResult: any;
  listaSearch: any=[];
  dtOptions = {};
  visibleValidar: boolean = false;
  visibleObservar: boolean = false;
  modal_cargando: boolean = false;
  textValidar: any;
  rep_id: any;
  textObservar: any;
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
    this.deptoSelect = [''];
    this.mpioSelect = [''];
    this.agSelect = [''];
    this.aeSelect = [''];
    this.depto = document.getElementById('deptoSel');
    this.listaSearch = [];
  }

  // funciones
  getMpio() {
    this.mpioResult = '';
    this.serviceService
      .get(`/validar/getMpio/${this.depto.value}`)
      .subscribe((res: any) => {
        this.mpioResult = res.data;
        this.mpios = document.getElementById('mpioSel');
        this.consulta(this.depto.value, null, null, null);
      });
  }
  getAg() {
    this.agResult = '';
    this.serviceService
      .get(`/validar/getAg/${this.depto.value}/${this.mpios.value}`)
      .subscribe((res: any) => {
        this.agResult = res.data;
        this.ag = document.getElementById('agSel');
        this.consulta(this.depto.value, this.mpios.value, null, null);
      });
  }
  getAe() {
    this.aeResult = '';
    this.serviceService
      .get(
        `/validar/getAe/${this.depto.value}/${this.mpios.value}/${this.ag.value}`
      )
      .subscribe((res: any) => {
        this.aeResult = res.data;
        this.ae = document.getElementById('aeSel');
        this.consulta(this.depto.value, this.mpios.value, this.ag.value, null);
      });
  }
  getEmp() {
    this.consulta(
      this.depto.value,
      this.mpios.value,
      this.ag.value,
      this.ae.value
    );
  }
limiarDatos() {}
  consulta(depto = null, mpio = null, ag = null, ae = null) {
    this.listaSearch = [];
    this.empResult = '';
    this.serviceService
      .get(`/validar/getEmp/${depto}/${mpio}/${ag}/${ae}`)
      .subscribe((res: any) => {
        console.log('>>>>>>>>', res);
        if(res.data == false) {
          Swal.fire({
            icon: 'info',
            title: 'Información',
            text:res.text,
            showConfirmButton:false,
            timer:2000
          })
        }
        this.empResult = res.data;
      });
  }

  radioValue(e) {
    document.getElementById('details').setAttribute('open', '');
    switch (e.target.value) {
      case 'depto':
        this.visibleMpio = false;
        this.visibleAg = false;
        this.visibleAe = false;
        this.mpioModel = '';
        this.agModel = '';
        this.aeModel = '';
        break;
      case 'mpio':
        this.visibleMpio = true;
        this.visibleAg = false;
        this.visibleAe = false;
        this.agModel = '';
        this.aeModel = '';
        break;
      case 'ag':
        this.visibleMpio = true;
        this.visibleAg = true;
        this.visibleAe = false;
        this.aeModel = '';
        break;
      case 'ae':
        this.visibleMpio = true;
        this.visibleAg = true;
        this.visibleAe = true;
        break;
    }
  }
  searchValidador() {

      this.deptoModel = this.deptoModel?this.deptoModel:null;
      this.mpioModel = this.mpioModel?this.mpioModel:null;
      this.agModel= this.agModel?this.agModel:null;
      this.aeModel=this.aeModel?this.aeModel:null;
    this.listaSearch = [];
    this.serviceService
      .get(
        `/validar/getListado/${this.deptoModel}/${this.mpioModel}/${this.agModel}/${this.aeModel}`
      )
      .subscribe((res: any) => {
        this.listaSearch = res.data;
        console.log(this.listaSearch,'<=== datos');

      });
  }
  verCuest(id) {
    console.log(id, '<=== rep_id');
    this.rep_id = id;
    this.visibleValidar = true;
    this.textValidar = '';
    this.serviceService
      .get(`/validar/getValidar/${id}`)
      .subscribe((res: any) => {
        console.log(res.data);
        this.textValidar = res.data[0].observacion;
      });
  }
  validarCuest(id) {
    console.log(id, '<=== rep_id');
    this.rep_id = id;
    this.visibleValidar = true;
    this.textValidar = '';
    this.serviceService
      .get(`/validar/getValidar/${id}`)
      .subscribe((res: any) => {
        console.log(res.data);
        this.textValidar = res.data[0].observacion;
      });
  }
  observarCuest(id) {
    console.log(id, '<=== rep_id');
    this.visibleObservar = true;
    this.textObservar = '';
    this.serviceService
      .get(`/validar/getValidar/${id}`)
      .subscribe((res: any) => {
        console.log(res.data);
        this.textValidar = res.data[0].observacion;
      });
  }
  almacenarValidacion(tipo) {
    console.log(this.rep_id);
    if(tipo == 'val'){
      this.visibleValidar = false;
    }else{
      this.visibleObservar = false;
    }
    Swal.fire({
      title: '¿Estás seguro?',
      icon: 'info',
      text: 'Desea validar este cuestionario ???',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(this.rep_id);

        this.serviceService
          .post(`/validar/saveValidar`, {
            tipo: tipo,
            ids: this.rep_id,
            dato: this.textValidar,
            categoria: 1
          })
          .subscribe((res: any) => {
            Swal.fire({
              title: res.title,
              icon: res.icon,
              html: res.text,
              timer: 2500,
              showConfirmButton: false,
            });
          });
      }else{
        if(tipo == 'val'){
          this.visibleValidar = false;
        }else{
          this.visibleObservar = false;
        }
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
}
