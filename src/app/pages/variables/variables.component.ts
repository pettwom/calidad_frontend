import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import DataTables from 'datatables.net';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageApp } from 'src/app/interfaces/datatablesLanguage';
import { ServicesService } from 'src/app/Services/services.sevice';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.css'],
})
export class VariablesComponent implements OnInit, OnDestroy {
  dtOptions = {};
  getList: any[] = []; // Initialize as an empty array
  dtTrigger: Subject<any> = new Subject<any>(); // Add Subject for triggering DataTables
  visibleEditarModal: boolean = false;

  idEditar: number;
  @ViewChild('datatableContainer') datatableContainer: ElementRef;

  private destroy$ = new Subject<void>();
  visibleModal: boolean;
  titulo: string;
  num_preg_dato: any;
  depto_dato: any;
  deptoModel: any;
  mpioModel:any;
  numPregModel: any;
  rubroModel:any;
  mpio_dato: any;
  rubro_dato: any;
  act_model: any;
  num_cabeza_model: any;
  prod_model: any;
  sup_model: any;
  rend_model: any;
  tipo: any;
  form: { num_preg: any; depto: any; mpio: any; rubro: any; actividad: any; num_cabezas: any; prod: any; sup: any; rend: any; tipo: any; ids:any;};
  datos: any;

  constructor(private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.configureDataTable();
    this.depto_function();
    this.num_preg_function();
    this.rubro_function();
    this.numPregModel = '';
    this.deptoModel = '';
    this.mpioModel = '';
    this.rubroModel= '';
  }

  ngOnDestroy(): void {
    // Destroy the subject and unsubscribe to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
    this.dtTrigger.unsubscribe();
  }

  configureDataTable(): void {
    const self = this;
    this.dtOptions = {
      language: LanguageApp.spanish_datatables,
      searching: true,
      // dom: 'Bfrtip',
      lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100],
      ],
      pagegSize: 20,
      serverSide: true,
      processing: true,
      paging: true,
      ajax: (dataTablesParameters: any, callback) => {
        const page =
          dataTablesParameters.start / dataTablesParameters.length + 1;
        const pageSize = dataTablesParameters.length;
        const search = dataTablesParameters.search?.value || '';
        console.log(dataTablesParameters.search?.value || '');

        this.serviceService
          .get(
            `/variables/getLista?page=${page}&pageSize=${pageSize}&search=${search}`
          )
          .pipe(takeUntil(this.destroy$)) // Unsubscribe when component is destroyed
          .subscribe({
            next: (res: any) => {
              if (res.data && Array.isArray(res.data)) {
                this.getList = res.data.map((item: any) => ({
                  // Explicitly type item as any
                  id: Number(item.id),
                  nro: Number(item.nro),
                  pre_numero_pregunta: Number(item.pre_numero_pregunta),
                  depto: item.depto,
                  mpio: item.mpio,
                  rubro: item.rubro,
                  actividad: item.actividad,
                  num_cabezas: item.num_cabezas,
                  sup_max: item.sup_max,
                  prod_max: item.prod_max,
                  rend_max: item.rend_max,
                  estado: item.estado,
                }));
                callback({
                  recordsTotal: res.recordsTotal,
                  recordsFiltered: res.recordsFiltered,
                  data: this.getList,
                });
                this.dtTrigger.next(null); // Trigger DataTables to render
              } else {
                this.getList = []; // Ensure getList is empty on no data
                callback({
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
                this.dtTrigger.next(null);
              }
            },
            error: (error: any) => {
              // Handle errors
              console.error('Error fetching data:', error);
              Swal.fire({
                // Show error message to the user
                title: 'Error',
                text: 'Failed to load data. Please check your network connection.',
                icon: 'error',
              });
              callback({
                // Important:  Tell DataTables there was an error.
                error: 'Failed to load data',
                recordsTotal: 0,
                recordsFiltered: 0,
                data: [],
              });
            },
          });
      },
      columns: [
        { data: 'nro' },
        { data: 'pre_numero_pregunta' },
        { data: 'depto' },
        { data: 'mpio' },
        { data: 'rubro' },
        { data: 'actividad' },
        { data: 'num_cabezas' },
        { data: 'prod_max' },
        { data: 'sup_max' },
        { data: 'rend_max' },
        {
          data: 'estado',
          render: (data: number) => {
            if (data === 1)
              return '<span class="badge bg-label-success">Activo</span>';
            if (data === 2)
              return '<span class="badge bg-label-danger">Inactivo</span>';
            return '<span>Unknown</span>'; // Add a default case
          },
        },
        {
          data: null,
          defaultContent: '',
          orderable: false,
          render: (data, type, row) => {
            // row.id contiene el ID de la fila
            return `
              <button class="btn btn-warning btn-sm btn-edit" data-id="${row.id}" pTooltip="Editar" tooltipPosition="top"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn btn-danger btn-sm btn-delete" data-id="${row.id}" pTooltip="Eliminar" tooltipPosition="top"><i class="fa-solid fa-trash-arrow-up"></i></button>
            `;
          },
        },
      ],
      destroy: true, // Add this to re-initialize the datatable.
      initComplete: function () {
        const api = this;

        $(this.api().table().container()).on('click', '.btn-edit', function () {
          console.log($(this));
          const id = $(this).data('id');
          self.modalVal('edit',id);
        });
        $(this.api().table().container()).on(
          'click',
          '.btn-delete',
          function () {
            const id = $(this).data('id');
            self.eliminar(id);
          }
        );
      },
    };
  }

  eliminar(id: number) {
    console.log('Eliminar', id);
    Swal.fire({
      title: 'Eliminar',
      icon: 'question',
      text: 'Desea eliminar este registro?',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'no',
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceService
          .post(`/variables/deleteValidacion`, { 'ids': id })
          .subscribe((res: any) => {
            Swal.fire({
              title: res.title,
              icon: res.icon,
              text: res.text,
              timer: 2500,
              showConfirmButton: false,
              showCancelButton: false,
            });
            this.actualizarTable(1,10);
          });
      }
    });
  }
  actualizarTable(page = null, pageSize= null, search=null){
    this.serviceService
          .get(
            `/variables/getLista?page=${page}&pageSize=${pageSize}&search=${search}`
          ).subscribe((res:any)=>{
            this.getList = res.data
          })
  }
  num_preg_function(){
    this.serviceService.get(`/variables/getNumPreg`)
    .subscribe((res:any)=>{
      this.num_preg_dato = res.data
    })
  }
  depto_function(){
    this.serviceService.get(`/variables/getDepto`)
    .subscribe((res:any)=>{
      this.depto_dato = res.data
    })
  }
  mpio_function(){
    this.serviceService.get(`/variables/getMpio/${this.deptoModel}`)
    .subscribe((res:any)=>{
      this.mpio_dato = res.data
    })
  }
  rubro_function(){
    this.serviceService.get(`/variables/getRubro`)
    .subscribe((res:any)=>{
      this.rubro_dato = res.data
    })
  }
  modalVal(tipo, id= null){
    this.visibleModal = true;
    this.tipo = tipo;
    this.titulo = tipo =='add'?'Añadir Validación':'Editar Validación';
    if(tipo == 'edit'){
      this.idEditar = id;
      this.visibleModal = true;
      this.serviceService
        .get(`/variables/getEditar/${id}`)
        .subscribe((res: any) => {
          this.datos = res.data[0];
          this.numPregModel= this.datos.pre_numero_pregunta;
          this.deptoModel= this.datos.depto;
          this.mpioModel= this.datos.municipio;
          this.rubroModel=this.datos.rubro;
          this.act_model=this.datos.actividad;
          this.num_cabeza_model=this.datos.num_cabezas;
          this.prod_model=this.datos.prod_max;
          this.sup_model=this.datos.sup_max;
          this.rend_model=this.datos.rend_max;
        });
    }
  }
  almacenar(){
    this.form={
      num_preg:this.numPregModel,
      depto: this.deptoModel,
      mpio: this.mpioModel,
      rubro: this.rubroModel,
      actividad: this.act_model,
      num_cabezas: this.num_cabeza_model,
      prod: this.prod_model,
      sup: this.sup_model,
      rend: this.rend_model,
      tipo: this.tipo,
      ids: this.idEditar?this.idEditar:''
    }
    this.visibleModal = false;
    Swal.fire({
      title: 'Almacenar',
      icon:'info',
      text: 'Esta Seguro de almacenar estos datos?',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si, Estoy Seguro',
      cancelButtonText: 'No'
    }).then((result)=>{
      if(result.isConfirmed){
        this.serviceService.post(`/variables/saveValidacion`, this.form)
        .subscribe((res:any)=>{
          this.actualizarTable(1,10);
          Swal.fire({
            title: res.title,
            icon:res.icon,
            text: res.text,
            timer: 2500,
            showConfirmButton: false,
            showCancelButton: false
          })
        })
      }
    })

  }
}
