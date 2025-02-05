import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import * as $ from 'jquery';
import 'select2';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reasignacion',
  templateUrl: './reasignacion.component.html',
  styleUrls: ['./reasignacion.component.css']
})
export class ReasignacionComponent implements OnInit, AfterViewInit {
  selectDisabled: boolean = false;
  userIdModel: any;
  reasigModel: any;
  listaSearch: any = [];
  dtOptions = {};
  dtTrigger: any;
  listUser: any;
  i: number;
  seleccionados: any = [''];
  usuarioReasignado: number;
  usuarioAsignado: number;
  btnDisabled: boolean = true;

  constructor(
    private serviceService: ServicesService,
    private element: ElementRef,
  ) { }


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
    this.listasUsuarios();
  }

  ngAfterViewInit(): void {
    // if (typeof $.fn.select2 !== 'undefined') {
    //   ($('#select2') as any).select2({
    //     placeholder: 'Seleccione una opción',
    //     allowClear: true,
    //     theme: 'classic',
    //   });
    //   $('#select').on('change', (event: any) => {
    //     const selectedValue = $(event.target).val();
    //     if (selectedValue.length > 0) {
    //       this.btnDisabled = false;
    //     } else {
    //       this.btnDisabled = true;
    //     }
    //   });
    // } else {
    //   console.error('Select2 no está disponible.');
    // }
  }

  optionSelect() {
    // console.log("Usuarios seleccionados:", this.userIdModel);
    this.listaSearch = [];
    if (this.userIdModel) {
      this.usuarioAsignado = this.userIdModel;
      this.usuariosCuestionarios();
    }
  }

  optionSelect2() {
    if (this.reasigModel) {
      this.usuarioReasignado = this.reasigModel
      if (this.reasigModel > 0) {
        this.btnDisabled = false;
      } else {
        this.btnDisabled = true;
      }
    }
  }

  usuariosCuestionarios() {
    this.serviceService
      .get(`/asignar/usuario-cuest/${this.usuarioAsignado}`)
      .subscribe((res: any) => {
        if (res.data.length > 0)
          this.listaSearch = res.data;
        else {
        }
      });
  }

  selectAll(event: any): void {
    this.seleccionados = []
    const isChecked = event.target.checked;
    this.listaSearch.forEach((item) => {
      item.selected = isChecked;
      this.seleccionados.push(item.rep_id);
    });
  }

  onSelectRow(row: any, index: number): void {
    this.seleccionados.push(row.rep_id)
  }

  reasignacion() {
    if (this.seleccionados.length > 0) {
      const datos: any = {};
      datos.usu_id = +this.usuarioReasignado
      datos.repIds = this.seleccionados
      this.serviceService
        .post(`/asignar/reasignar`, datos)
        .subscribe((res: any) => {
          if (res.data > 0) {
            this.usuariosCuestionarios();
            Swal.fire({
              icon: res.icon,
              title: res.title,
              text: res.text,
              showConfirmButton: false,
              timer: 2000,
            })
          } else {
          }
        });
    } else {
      Swal.fire
    }

  }

  listasUsuarios() {
    this.serviceService.get(`/asignar/getUser`).subscribe((res: any) => {
      // console.log(res.data.length);
      this.listUser = res.data;
      // console.log(this.listUser);
    });
  }


}
