/**
 * Módulo de gestión de nóminas
 */

const Nomina = {
    // Estado del módulo
    state: {
        nominaEditando: null,
        filtros: {
            fechaDesde: '',
            fechaHasta: '',
            persona: '',
            seccion: '',
            busqueda: ''
        }
    },

    // Constantes de precios
    PRECIOS: {
        HORA_NORMAL: 6.875,
        HORA_EXTRA: 9.00
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de nómina
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'nomina') {
                this.verificarYCargarPersonal();
                this.mostrarNominas();
            }
        });
        
        // Escuchar eventos de actualización de personal
        document.addEventListener('personalActualizado', () => {
            console.log('Evento de actualización de personal recibido en Nóminas');
            this.cargarPersonasEnSelectores();
        });
    },
    
    // Cargar plantilla HTML
    loadTemplate() {
        console.log("Cargando plantilla de nómina...");
        
        // Usar directamente la plantilla interna para evitar problemas de CORS
        this.crearPlantillaInterna();
        
        // Descomentar esto solo si se está sirviendo desde un servidor web
        /*
        fetch('templates/nomina.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar la plantilla de nómina');
                }
                return response.text();
            })
            .then(html => {
                const section = document.getElementById('nomina');
                if (section) {
                    section.innerHTML = html;
                    this.setupEventListeners();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Crear plantilla interna si no se puede cargar el archivo
                this.crearPlantillaInterna();
            });
        */
    },
    
    // Crear plantilla interna si no se puede cargar el archivo
    crearPlantillaInterna() {
        const section = document.getElementById('nomina');
        if (!section) return;
        
        section.innerHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Registro de Nóminas</h5>
                        </div>
                        <div class="card-body">
                            <form id="formularioNomina">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Persona</label>
                                        <select class="form-select" id="nominaPersona" required>
                                            <option value="">Seleccionar persona</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="nominaFecha" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Sección</label>
                                        <select class="form-select" id="nominaSeccion" required>
                                            <option value="">Seleccionar sección</option>
                                            <option value="Descarga">Descarga</option>
                                            <option value="Elaboración">Elaboración</option>
                                            <option value="Clasificación">Clasificación</option>
                                            <option value="Empaquetado">Empaquetado</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Horas Normales</label>
                                        <input type="number" class="form-control" id="nominaHorasNormales" min="0" step="0.5" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Horas Extras</label>
                                        <input type="number" class="form-control" id="nominaHorasExtras" min="0" step="0.5" value="0">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="nominaObservaciones" rows="2"></textarea>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-secondary me-2" id="btnLimpiarNomina">Limpiar</button>
                                    <button type="submit" class="btn btn-primary" id="btnGuardarNomina">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Sección de filtros -->
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Filtros</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Fecha Desde</label>
                                    <input type="date" class="form-control" id="filtroFechaDesde">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Fecha Hasta</label>
                                    <input type="date" class="form-control" id="filtroFechaHasta">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Persona</label>
                                    <select class="form-select" id="filtroPersona">
                                        <option value="">Todas</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Sección</label>
                                    <select class="form-select" id="filtroSeccion">
                                        <option value="">Todas</option>
                                        <option value="Descarga">Descarga</option>
                                        <option value="Elaboración">Elaboración</option>
                                        <option value="Clasificación">Clasificación</option>
                                        <option value="Empaquetado">Empaquetado</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="d-flex justify-content-end">
                                        <button type="button" class="btn btn-secondary me-2" id="btnLimpiarFiltros">
                                            <i class="fas fa-eraser me-1"></i> Limpiar
                                        </button>
                                        <button type="button" class="btn btn-primary" id="btnAplicarFiltros">
                                            <i class="fas fa-filter me-1"></i> Aplicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla de registros -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Registros de Nómina</h5>
                            <div class="input-group" style="max-width: 300px;">
                                <input type="text" class="form-control" id="buscarNomina" placeholder="Buscar...">
                                <button class="btn btn-outline-secondary" type="button" id="btnAplicarFiltros">
                                    <i class="fas fa-filter"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Persona</th>
                                            <th>Fecha</th>
                                            <th>Sección</th>
                                            <th>Horas Normales</th>
                                            <th>Horas Extras</th>
                                            <th>Total Horas</th>
                                            <th>Monto Normal</th>
                                            <th>Monto Extra</th>
                                            <th>Total Monto</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="nominasTableBody">
                                        <!-- Contenido dinámico -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="botones-superiores">
                <button class="boton-accion" id="btnExportarPDF">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button class="boton-accion" id="btnExportarExcel">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button class="boton-accion" id="btnRespaldarDatos">
                    <i class="fas fa-save"></i> Respaldo
                </button>
                <button class="boton-accion" id="btnCargarDatos">
                    <i class="fas fa-upload"></i> Cargar
                </button>
            </div>
        `;
        
        this.setupEventListeners();
    },
    
    // Configurar eventos
    setupEventListeners() {
        const form = document.getElementById('formularioNomina');
        const btnLimpiar = document.getElementById('btnLimpiarNomina');
        const btnExportarPDF = document.getElementById('btnExportarPDF');
        const btnExportarExcel = document.getElementById('btnExportarExcel');
        const btnRespaldarDatos = document.getElementById('btnRespaldarDatos');
        const btnCargarDatos = document.getElementById('btnCargarDatos');
        const btnFiltrar = document.getElementById('btnAplicarFiltros');
        const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
        const inputBusqueda = document.getElementById('buscarNomina');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarNomina();
            });
        }
        
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        }
        
        if (btnExportarPDF) {
            btnExportarPDF.addEventListener('click', () => this.exportarPDF());
        }
        
        if (btnExportarExcel) {
            btnExportarExcel.addEventListener('click', () => this.exportarExcel());
        }
        
        if (btnRespaldarDatos) {
            btnRespaldarDatos.addEventListener('click', () => this.respaldarDatos());
        }
        
        if (btnCargarDatos) {
            btnCargarDatos.addEventListener('click', () => this.cargarDatos());
        }
        
        if (btnFiltrar) {
            btnFiltrar.addEventListener('click', () => this.aplicarFiltros());
        }

        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', () => {
                // Limpiar todos los campos de filtro
                document.getElementById('filtroFechaDesde').value = '';
                document.getElementById('filtroFechaHasta').value = '';
                document.getElementById('filtroPersona').value = '';
                document.getElementById('filtroSeccion').value = '';
                document.getElementById('buscarNomina').value = '';
                
                // Limpiar estado de filtros
                this.state.filtros = {
                    fechaDesde: '',
                    fechaHasta: '',
                    persona: '',
                    seccion: '',
                    busqueda: ''
                };
                
                // Mostrar todas las nóminas
                this.mostrarNominas();
            });
        }

        if (inputBusqueda) {
            inputBusqueda.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.aplicarFiltros();
                }
            });
        }
        
        // Establecer fecha actual
        const inputFecha = document.getElementById('nominaFecha');
        if (inputFecha) {
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.value = hoy;
        }
    },
    
    // Verificar y cargar datos del personal
    verificarYCargarPersonal() {
        const personas = DB.getAll('personal');
        const personasActivas = personas.filter(p => p.activo !== false);
        
        if (personas.length === 0) {
            UI.mostrarNotificacion('No hay personal registrado. Por favor, agregue personal primero.', 'warning');
        } else if (personasActivas.length === 0) {
            UI.mostrarNotificacion('No hay personal activo. Por favor, active algún miembro del personal.', 'warning');
        } else {
            this.cargarPersonasEnSelectores();
        }
    },
    
    // Cargar personas en selectores
    cargarPersonasEnSelectores() {
        console.log('Cargando personas en selectores de Nóminas...');
        const personas = DB.getAll('personal');
        const personasActivas = personas.filter(p => p.activo !== false);
        
        console.log(`Total personas: ${personas.length}, Activas: ${personasActivas.length}`);
        
        // Ordenar alfabéticamente
        personasActivas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Selectores donde cargar las personas
        const selectores = [
            document.getElementById('nominaPersona'),
            document.getElementById('filtroPersona')
        ];
        
        selectores.forEach(selector => {
            if (!selector) {
                console.warn(`Selector no encontrado: ${selector}`);
                return;
            }
            
            // Mantener la opción "Seleccionar persona" o "Todas" según el caso
            const valorPredeterminado = selector.id === 'filtroPersona' ? 
                '<option value="">Todas</option>' : 
                '<option value="">Seleccionar persona</option>';
                
            selector.innerHTML = valorPredeterminado;
            
            personasActivas.forEach(persona => {
                const option = document.createElement('option');
                option.value = persona.id;
                option.textContent = persona.nombre;
                selector.appendChild(option);
            });
            
            console.log(`Selector ${selector.id} actualizado con ${personasActivas.length} personas`);
        });
    },
    
    // Guardar registro de nómina
    guardarNomina() {
        const personaId = document.getElementById('nominaPersona').value;
        const fecha = document.getElementById('nominaFecha').value;
        const seccion = document.getElementById('nominaSeccion').value;
        const horasNormales = parseFloat(document.getElementById('nominaHorasNormales').value);
        const horasExtras = parseFloat(document.getElementById('nominaHorasExtras').value) || 0;
        const observaciones = document.getElementById('nominaObservaciones').value;
        
        if (!personaId || !fecha || !seccion || isNaN(horasNormales)) {
            UI.mostrarNotificacion('Por favor, complete todos los campos requeridos', 'warning');
            return;
        }
        
        const persona = DB.getById('personal', personaId);
        if (!persona) {
            UI.mostrarNotificacion('Persona no encontrada', 'error');
            return;
        }
        
        const nomina = {
            id: this.state.nominaEditando ? this.state.nominaEditando : Date.now().toString(),
            personaId,
            personaNombre: persona.nombre,
            fecha,
            seccion,
            horasNormales,
            horasExtras,
            estado: 'pendiente',
            observaciones,
            fechaRegistro: new Date().toISOString()
        };
        
        console.log('Guardando nómina:', nomina);
        
        try {
            if (this.state.nominaEditando) {
                console.log('Actualizando nómina existente con ID:', this.state.nominaEditando);
                // Corregir: Usar método adecuado para actualizar nómina
                const resultado = DB.actualizarNomina(nomina);
                console.log('Resultado de actualización:', resultado);
                UI.mostrarNotificacion('Registro de nómina actualizado correctamente', 'success');
            } else {
                console.log('Agregando nueva nómina');
                const resultado = DB.agregarNomina(nomina);
                console.log('Nueva nómina agregada con ID:', resultado);
                UI.mostrarNotificacion('Registro de nómina guardado correctamente', 'success');
            }
            
            this.limpiarFormulario();
            this.mostrarNominas();
        } catch (error) {
            console.error('Error al guardar/actualizar nómina:', error);
            UI.mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    },
    
    // Limpiar formulario
    limpiarFormulario() {
        document.getElementById('formularioNomina').reset();
        
        // Establecer fecha actual
        const inputFecha = document.getElementById('nominaFecha');
        if (inputFecha) {
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.value = hoy;
        }
        
        this.state.nominaEditando = null;
        
        // Cambiar botón a "Guardar"
        const btnGuardar = document.getElementById('btnGuardarNomina');
        if (btnGuardar) {
            btnGuardar.textContent = 'Guardar';
        }
    },
    
    // Mostrar registros de nómina
    mostrarNominas() {
        console.log('Mostrando registros de nómina');
        
        // Verificar si hay filtros activos
        const hayFiltrosActivos = Object.values(this.state.filtros).some(valor => valor !== '');
        
        // Obtener nóminas según si hay filtros o no
        const nominas = hayFiltrosActivos ? this.getNominasFiltradas() : DB.getAll('nominas');
        
        // Mostrar las nóminas en la tabla
        this.mostrarNominasFiltradas(nominas);
        
        // Actualizar total de horas
        this.actualizarTotalHoras(nominas);
    },
    
    // Configurar eventos de botones de acciones (editar, eliminar)
    configurarBotonesAcciones() {
        console.log('Configurando botones de acciones para nóminas');
        
        // Botones de editar
        const botonesEditar = document.querySelectorAll('#nominasTableBody .btn-editar');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                console.log('Botón editar presionado para ID:', id);
                this.editarNomina(id);
            });
        });
        
        // Botones de eliminar
        const botonesEliminar = document.querySelectorAll('#nominasTableBody .btn-eliminar');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                console.log('Botón eliminar presionado para ID:', id);
                this.confirmarEliminarNomina(id);
            });
        });
        
        console.log(`Configurados ${botonesEditar.length} botones de editar y ${botonesEliminar.length} botones de eliminar`);
    },
    
    // Editar nómina
    editarNomina(id) {
        console.log('Editando nómina con ID:', id);
        
        // Obtener el registro de nómina desde DB
        const nomina = DB.getNominaPorId(id);
        if (!nomina) {
            console.error('Registro de nómina no encontrado con ID:', id);
            UI.mostrarNotificacion('Registro no encontrado', 'error');
            return;
        }
        
        console.log('Datos de nómina recuperados:', nomina);
        
        // Establecer valores en el formulario
        document.getElementById('nominaPersona').value = nomina.personaId || '';
        document.getElementById('nominaFecha').value = nomina.fecha || '';
        document.getElementById('nominaSeccion').value = nomina.seccion || '';
        document.getElementById('nominaHorasNormales').value = nomina.horasNormales || 0;
        document.getElementById('nominaHorasExtras').value = nomina.horasExtras || 0;
        document.getElementById('nominaObservaciones').value = nomina.observaciones || '';
        
        // Guardar ID de la nómina que se está editando
        this.state.nominaEditando = id;
        
        // Cambiar botón a "Actualizar"
        const btnGuardar = document.getElementById('btnGuardarNomina');
        if (btnGuardar) {
            btnGuardar.textContent = 'Actualizar';
        }
        
        // Desplazarse al formulario
        document.getElementById('formularioNomina').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Confirmar eliminación
    confirmarEliminarNomina(id) {
        if (confirm('¿Está seguro de eliminar este registro de nómina? Esta acción no se puede deshacer.')) {
            this.eliminarNomina(id);
        }
    },
    
    // Eliminar nómina
    eliminarNomina(id) {
        try {
            DB.eliminarNomina(id);
            UI.mostrarNotificacion('Registro de nómina eliminado correctamente', 'success');
            this.mostrarNominas();
        } catch (error) {
            UI.mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    },
    
    // Aplicar filtros a la lista de nóminas
    aplicarFiltros() {
        const fechaDesde = document.getElementById('filtroFechaDesde').value;
        const fechaHasta = document.getElementById('filtroFechaHasta').value;
        const persona = document.getElementById('filtroPersona').value;
        const seccion = document.getElementById('filtroSeccion').value;
        const busqueda = document.getElementById('buscarNomina').value;

        // Actualizar estado de filtros
        this.state.filtros = {
            fechaDesde,
            fechaHasta,
            persona,
            seccion,
            busqueda
        };

        // Obtener nóminas filtradas
        const nominas = this.getNominasFiltradas();
        
        // Actualizar la tabla
        this.mostrarNominasFiltradas(nominas);
        
        // Actualizar total de horas
        this.actualizarTotalHoras(nominas);
    },

    // Obtener nóminas filtradas
    getNominasFiltradas() {
        let nominas = DB.getAll('nominas');
        
        // Aplicar filtros
        if (this.state.filtros.fechaDesde) {
            nominas = nominas.filter(n => n.fecha >= this.state.filtros.fechaDesde);
        }
        
        if (this.state.filtros.fechaHasta) {
            nominas = nominas.filter(n => n.fecha <= this.state.filtros.fechaHasta);
        }
        
        if (this.state.filtros.persona) {
            nominas = nominas.filter(n => n.personaId === this.state.filtros.persona);
        }
        
        if (this.state.filtros.seccion) {
            nominas = nominas.filter(n => n.seccion === this.state.filtros.seccion);
        }
        
        if (this.state.filtros.busqueda) {
            const busqueda = this.state.filtros.busqueda.toLowerCase();
            nominas = nominas.filter(n => 
                n.personaNombre.toLowerCase().includes(busqueda) ||
                n.seccion.toLowerCase().includes(busqueda) ||
                (n.observaciones && n.observaciones.toLowerCase().includes(busqueda))
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        return nominas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    // Mostrar nóminas filtradas en la tabla
    mostrarNominasFiltradas(nominas) {
        const tbody = document.getElementById('nominasTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (nominas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">No hay registros que coincidan con los filtros</td>
                </tr>
            `;
            return;
        }
        
        let totalGeneral = {
            horasNormales: 0,
            horasExtras: 0,
            montoNormal: 0,
            montoExtra: 0,
            total: 0
        };
        
        nominas.forEach(nomina => {
            const horasNormales = nomina.horasNormales || 0;
            const horasExtras = nomina.horasExtras || 0;
            const totalHoras = horasNormales + horasExtras;
            
            // Cálculos monetarios
            const montoNormal = horasNormales * this.PRECIOS.HORA_NORMAL;
            const montoExtra = horasExtras * this.PRECIOS.HORA_EXTRA;
            const totalMonto = montoNormal + montoExtra;
            
            // Actualizar totales generales
            totalGeneral.horasNormales += horasNormales;
            totalGeneral.horasExtras += horasExtras;
            totalGeneral.montoNormal += montoNormal;
            totalGeneral.montoExtra += montoExtra;
            totalGeneral.total += totalMonto;
            
            const fechaFormateada = new Date(nomina.fecha).toLocaleDateString('es-ES');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nomina.personaNombre || 'Sin asignar'}</td>
                <td>${fechaFormateada}</td>
                <td>${nomina.seccion || 'N/A'}</td>
                <td>${horasNormales.toFixed(1)}</td>
                <td>${horasExtras.toFixed(1)}</td>
                <td>${totalHoras.toFixed(1)}</td>
                <td>${montoNormal.toFixed(2)} €</td>
                <td>${montoExtra.toFixed(2)} €</td>
                <td>${totalMonto.toFixed(2)} €</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-editar" data-id="${nomina.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-eliminar" data-id="${nomina.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Agregar fila de totales
        const trTotales = document.createElement('tr');
        trTotales.className = 'table-primary fw-bold';
        trTotales.innerHTML = `
            <td colspan="3">TOTALES</td>
            <td>${totalGeneral.horasNormales.toFixed(1)}</td>
            <td>${totalGeneral.horasExtras.toFixed(1)}</td>
            <td>${(totalGeneral.horasNormales + totalGeneral.horasExtras).toFixed(1)}</td>
            <td>${totalGeneral.montoNormal.toFixed(2)} €</td>
            <td>${totalGeneral.montoExtra.toFixed(2)} €</td>
            <td>${totalGeneral.total.toFixed(2)} €</td>
            <td></td>
        `;
        tbody.appendChild(trTotales);
        
        // Configurar eventos en los botones
        this.configurarBotonesAcciones();
    },

    // Actualizar total de horas registradas
    actualizarTotalHoras(nominas) {
        const totalHoras = nominas.reduce((total, nomina) => {
            return total + (nomina.horasNormales || 0) + (nomina.horasExtras || 0);
        }, 0);
        
        const elementoTotal = document.getElementById('totalHorasRegistradas');
        if (elementoTotal) {
            elementoTotal.textContent = totalHoras.toFixed(1);
        }
    },
    
    // Exportar a PDF
    exportarPDF() {
        try {
            let doc;
            if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') {
                doc = new window.jspdf.jsPDF('l', 'mm', 'a4'); // Orientación horizontal
            } else if (typeof jsPDF !== 'undefined') {
                doc = new jsPDF('l', 'mm', 'a4'); // Orientación horizontal
            } else {
                throw new Error('jsPDF no está disponible');
            }

            const nominas = DB.getNominas();
            if (nominas.length === 0) {
                UI.mostrarNotificacion('No hay datos para exportar', 'warning');
                return;
            }

            // Configuración de página
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);

            // Título y fecha
            doc.setFontSize(16);
            doc.setTextColor(41, 128, 185);
            doc.text('Registro de Nóminas', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, pageWidth - margin, 15, { align: 'right' });

            // Configuración de columnas
            const columns = [
                { header: 'Persona', width: 40 },
                { header: 'Fecha', width: 25 },
                { header: 'Sección', width: 25 },
                { header: 'Horas Normales', width: 25 },
                { header: 'Horas Extras', width: 25 },
                { header: 'Total Horas', width: 25 },
                { header: 'Monto Normal (€)', width: 30 },
                { header: 'Monto Extra (€)', width: 30 },
                { header: 'Total (€)', width: 30 }
            ];

            // Preparar datos
            const data = nominas.map(nomina => {
                const horasNormales = nomina.horasNormales || 0;
                const horasExtras = nomina.horasExtras || 0;
                const totalHoras = horasNormales + horasExtras;
                const montoNormal = (horasNormales * this.PRECIOS.HORA_NORMAL).toFixed(2);
                const montoExtra = (horasExtras * this.PRECIOS.HORA_EXTRA).toFixed(2);
                const totalMonto = (parseFloat(montoNormal) + parseFloat(montoExtra)).toFixed(2);

                return {
                    personaNombre: nomina.personaNombre || 'Sin asignar',
                    fecha: new Date(nomina.fecha).toLocaleDateString('es-ES'),
                    seccion: nomina.seccion || 'N/A',
                    horasNormales: horasNormales.toFixed(1),
                    horasExtras: horasExtras.toFixed(1),
                    totalHoras: totalHoras.toFixed(1),
                    montoNormal: montoNormal + ' €',
                    montoExtra: montoExtra + ' €',
                    totalMonto: totalMonto + ' €'
                };
            });

            // Calcular totales
            const totales = data.reduce((acc, curr) => ({
                horasNormales: acc.horasNormales + parseFloat(curr.horasNormales),
                horasExtras: acc.horasExtras + parseFloat(curr.horasExtras),
                montoNormal: acc.montoNormal + parseFloat(curr.montoNormal),
                montoExtra: acc.montoExtra + parseFloat(curr.montoExtra),
                totalMonto: acc.totalMonto + parseFloat(curr.totalMonto)
            }), {
                horasNormales: 0,
                horasExtras: 0,
                montoNormal: 0,
                montoExtra: 0,
                totalMonto: 0
            });

            // Agregar fila de totales
            data.push({
                personaNombre: 'TOTALES',
                fecha: '',
                seccion: '',
                horasNormales: totales.horasNormales.toFixed(1),
                horasExtras: totales.horasExtras.toFixed(1),
                totalHoras: (totales.horasNormales + totales.horasExtras).toFixed(1),
                montoNormal: totales.montoNormal.toFixed(2) + ' €',
                montoExtra: totales.montoExtra.toFixed(2) + ' €',
                totalMonto: totales.totalMonto.toFixed(2) + ' €'
            });

            // Dibujar tabla
            let y = 25;
            const rowHeight = 8;
            const headerHeight = 10;
            let currentPage = 1;
            const totalPages = Math.ceil((data.length * rowHeight + headerHeight) / (pageHeight - margin * 2));

            // Función para dibujar encabezado
            const drawHeader = (yPos) => {
                let x = margin;
                doc.setFillColor(41, 128, 185);
                doc.setTextColor(255);
                doc.setFontSize(9);
                doc.setFont(undefined, 'bold');

                columns.forEach(col => {
                    doc.rect(x, yPos, col.width, headerHeight, 'F');
                    doc.text(col.header, x + 2, yPos + 6);
                    x += col.width;
                });

                doc.setTextColor(0);
                doc.setFont(undefined, 'normal');
                return yPos + headerHeight;
            };

            // Función para dibujar fila
            const drawRow = (row, yPos, isTotal = false) => {
                let x = margin;
                doc.setFontSize(8);

                if (isTotal) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
                    doc.setFont(undefined, 'bold');
                }

                // Persona
                doc.text(row.personaNombre, x + 2, yPos + 5);
                x += columns[0].width;

                // Fecha
                doc.text(row.fecha, x + 2, yPos + 5, { align: 'center' });
                x += columns[1].width;

                // Sección
                doc.text(row.seccion, x + 2, yPos + 5, { align: 'center' });
                x += columns[2].width;

                // Horas Normales
                doc.text(row.horasNormales, x + columns[3].width - 2, yPos + 5, { align: 'right' });
                x += columns[3].width;

                // Horas Extras
                doc.text(row.horasExtras, x + columns[4].width - 2, yPos + 5, { align: 'right' });
                x += columns[4].width;

                // Total Horas
                doc.text(row.totalHoras, x + columns[5].width - 2, yPos + 5, { align: 'right' });
                x += columns[5].width;

                // Monto Normal
                doc.text(row.montoNormal, x + columns[6].width - 2, yPos + 5, { align: 'right' });
                x += columns[6].width;

                // Monto Extra
                doc.text(row.montoExtra, x + columns[7].width - 2, yPos + 5, { align: 'right' });
                x += columns[7].width;

                // Total Monto
                doc.text(row.totalMonto, x + columns[8].width - 2, yPos + 5, { align: 'right' });

                doc.setFont(undefined, 'normal');
                return yPos + rowHeight;
            };

            // Dibujar tabla página por página
            for (let i = 0; i < data.length; i++) {
                if (y + rowHeight > pageHeight - margin) {
                    // Agregar número de página
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(
                        `Página ${currentPage} de ${totalPages}`,
                        pageWidth - margin,
                        pageHeight - margin,
                        { align: 'right' }
                    );

                    // Nueva página
                    doc.addPage();
                    currentPage++;
                    y = margin;
                }

                if (i === 0 || y === margin) {
                    y = drawHeader(y);
                }

                y = drawRow(data[i], y, i === data.length - 1);
            }

            // Agregar número de página en la última página
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                `Página ${currentPage} de ${totalPages}`,
                pageWidth - margin,
                pageHeight - margin,
                { align: 'right' }
            );

            const fileName = `registro_nominas_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            UI.mostrarNotificacion(`PDF generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            UI.mostrarNotificacion('Error al generar PDF: ' + error.message, 'error');
        }
    },
    
    // Exportar a Excel
    exportarExcel() {
        const nominas = DB.getNominas();
        if (nominas.length === 0) {
            UI.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        try {
            // Verificar disponibilidad de XLSX
            if (typeof XLSX === 'undefined') {
                UI.mostrarNotificacion('Biblioteca XLSX no disponible', 'error');
                return;
            }
            
            // Crear libro
            const wb = XLSX.utils.book_new();
            
            // Obtener resumen por persona
            const resumenPersonas = DB.getResumenNominas();
            
            // Preparar datos para el resumen
            const dataResumen = [
                ['RESUMEN DE NÓMINAS POR PERSONA'],
                [`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`],
                [],
                ['Persona', 'Horas Normales', 'Horas Extras', 'Total Horas', 'Días Trabajados', 'Secciones']
            ];
            
            // Agregar datos del resumen
            resumenPersonas.forEach(persona => {
                dataResumen.push([
                    persona.nombre,
                    persona.horasNormales.toFixed(1),
                    persona.horasExtras.toFixed(1),
                    persona.totalHoras.toFixed(1),
                    persona.diasTrabajados,
                    persona.secciones.join(', ')
                ]);
            });
            
            // Crear hoja de resumen
            const wsResumen = XLSX.utils.aoa_to_sheet(dataResumen);
            
            // Configurar ancho de columnas para el resumen
            wsResumen['!cols'] = [
                { wch: 25 },  // Persona
                { wch: 15 },  // Horas Normales
                { wch: 15 },  // Horas Extras
                { wch: 15 },  // Total Horas
                { wch: 15 },  // Días Trabajados
                { wch: 30 }   // Secciones
            ];
            
            // Añadir hoja de resumen al libro
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
            
            // Preparar datos para el detalle
            const dataDetalle = [
                ['DETALLE DE NÓMINAS'],
                [],
                ['Persona', 'Fecha', 'Sección', 'Horas Normales', 'Horas Extras', 'Total Horas', 'Monto Normal', 'Monto Extra', 'Total Monto', 'Observaciones']
            ];
            
            // Agregar datos del detalle
            nominas.forEach(nomina => {
                dataDetalle.push([
                    nomina.personaNombre || 'No asignado',
                    nomina.fecha,
                    nomina.seccion || 'N/A',
                    nomina.horasNormales.toFixed(1),
                    nomina.horasExtras.toFixed(1),
                    (nomina.horasNormales + nomina.horasExtras).toFixed(1),
                    (nomina.horasNormales * this.PRECIOS.HORA_NORMAL).toFixed(2),
                    (nomina.horasExtras * this.PRECIOS.HORA_EXTRA).toFixed(2),
                    ((nomina.horasNormales * this.PRECIOS.HORA_NORMAL) + (nomina.horasExtras * this.PRECIOS.HORA_EXTRA)).toFixed(2),
                    nomina.observaciones || ''
                ]);
            });
            
            // Crear hoja de detalle
            const wsDetalle = XLSX.utils.aoa_to_sheet(dataDetalle);
            
            // Configurar ancho de columnas para el detalle
            wsDetalle['!cols'] = [
                { wch: 25 },  // Persona
                { wch: 12 },  // Fecha
                { wch: 15 },  // Sección
                { wch: 15 },  // Horas Normales
                { wch: 15 },  // Horas Extras
                { wch: 15 },  // Total Horas
                { wch: 15 },  // Monto Normal
                { wch: 15 },  // Monto Extra
                { wch: 15 },  // Total Monto
                { wch: 30 }   // Observaciones
            ];
            
            // Añadir hoja de detalle al libro
            XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');
            
            // Guardar archivo
            const fileName = `registro_nominas_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            UI.mostrarNotificacion(`Excel generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar Excel:', error);
            UI.mostrarNotificacion(`Error al generar Excel: ${error.message}`, 'error');
        }
    },
    
    // Respaldar datos
    respaldarDatos() {
        const nominas = DB.getNominas();
        if (nominas.length === 0) {
            UI.mostrarNotificacion('No hay datos para respaldar', 'warning');
            return;
        }
        
        const datos = JSON.stringify(nominas);
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nominas_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        UI.mostrarNotificacion('Datos respaldados correctamente', 'success');
    },
    
    // Cargar datos desde respaldo
    cargarDatos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const nominas = JSON.parse(event.target.result);
                    DB.importarNominas(nominas);
                    this.mostrarNominas();
                    UI.mostrarNotificacion('Datos cargados correctamente', 'success');
                } catch (error) {
                    UI.mostrarNotificacion('Error al cargar el archivo: formato incorrecto', 'error');
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    }
};

// Registrar módulo para inicialización
if (typeof modulesToInit === 'undefined') {
    window.modulesToInit = {};
}
window.modulesToInit.nomina = Nomina; 