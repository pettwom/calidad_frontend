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
  deptoSelect: any;
  mpioSelect: any;
  agSelect: any;
  aeSelect: any;
  empSelect: any;
  deptoModel: any;
  mpioModel: any;
  agModel: any;
  aeModel: any;
  empModel: any='';
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
  listCuest: any;
  // dtTrigger: any;
  btnDisabled: boolean=true;
  i: number;
  seleccionados: any = [''];
  eventSelect = $(".select_user");
  selectDisabled: boolean=true;
  formAsignar: any = {};
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
    this.deptoModel = '';
    this.mpioModel = '';
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
      item.selected = isChecked;// Marcar todas las filas según el estado del checkbox
      this.seleccionados.push(item.rep_id);
    });
  }
  onSelectRow(row: any, index: number): void {
    this.seleccionados.push(row.rep_id)
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
        if(selectedValue.length > 0) {
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
  getDepto(){
    this.serviceService.get(`/validar/getDeptos`).subscribe((res:any)=>{
      // console.log(res.data);
      this.deptoOption = res.data
    })
  }
  getMpio() {
    this.mpioResult = '';
    // console.log(this.depto.value, 'depto');

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
  consulta(depto = null, mpio = null, ag = null, ae = null) {
    this.listaSearch = [];
    this.empResult = '';
    this.serviceService
      .get(`/validar/getEmp/${depto}/${mpio}/${ag}/${ae}`)
      .subscribe((res: any) => {
        // console.log('>>>>>>>>', res);
        if (res.data == false) {
          Swal.fire({
            icon: 'info',
            title: 'Información',
            text: res.text,
            showConfirmButton: false,
            timer: 2000,
          });
        }
        this.empResult = res.data;
      });
  }
  asignar(){
    // console.log(this.seleccionados, '<== asignar')
    let variable = $("#select2 option:selected").val()
    variable = variable.toString().split("'")[1]
    // console.log(variable, 'variable');
Swal.fire({
  title: '¿Estás seguro?',
  text: "Esta acción puede modificar la información del validador",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
}).then((resultado) => {
  if(resultado.isConfirmed){
    this.formAsignar = {
      'rep_id': this.seleccionados,
      'user_id': variable,
      'depto_id': this.depto.value,
      'mpio_id': this.mpios.value,
      'fecha_asignacion': new Date(),
    }
    this.serviceService.post(`/validar/saveAsignar`, this.formAsignar)
    .subscribe((res:any) => {
        this.searchValidador()
        Swal.fire({
          icon:res.icon,
          title: res.title,
          text: res.text,
          showConfirmButton: false,
          timer: 2000,
        })
    })
    this.seleccionados = [];
  }
})

  }
  limiarDatos() {}
  radioValue(e) {
    document.getElementById('details').setAttribute('open', '');
    switch (e.target.value) {
      case 'depto':
        this.visibleMpio = false;
        this.visibleAg = false;
        this.visibleAe = false;
        this.mpioModel = '';
        this.agModel = '';

        break;
      case 'mpio':
        this.visibleMpio = true;
        this.visibleAg = false;
        this.visibleAe = false;
        this.agModel = '';
        break;
      case 'ag':
        this.visibleMpio = true;
        this.visibleAg = true;
        this.visibleAe = false;
        break;
      case 'ae':
        this.visibleMpio = true;
        this.visibleAg = true;
        this.visibleAe = true;
        break;
    }
  }
  searchValidador() {
    this.deptoModel = this.deptoModel ? this.deptoModel : null;
    this.mpioModel = this.mpioModel ? this.mpioModel : null;
    this.agModel = this.agModel ? this.agModel : null;
    this.aeModel = this.aeModel ? this.aeModel : null;
// console.log(this.deptoModel,this.mpioModel,this.agModel,this.aeModel);

    this.listCuest = [''];
    this.serviceService
      .get(`/validar/getListado/${this.deptoModel}/${this.mpioModel}/${this.agModel}/${this.aeModel}`)
      .subscribe((res: any) => {
        this.selectDisabled = false;
        this.listCuest = res.data;
        // console.log(this.listCuest);


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
