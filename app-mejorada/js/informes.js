/**
 * Módulo de Informes Mejorado
 * Permite generar informes detallados y estéticos de la producción
 */

// Hacer el módulo disponible globalmente
window.Informes = {
    // Estado del módulo
    state: {
        periodo: 'semanal',
        fechaInicio: '',
        fechaFin: '',
        tipoInforme: 'completo',
        datos: null
    },

    // Inicializar módulo
    init() {
        console.log('Inicializando módulo de informes mejorado...');
        this.inicializarFechas();
        this.configurarEventListeners();
        console.log('Módulo de informes inicializado correctamente');
    },

    // Inicializar fechas por defecto
    inicializarFechas() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        
        this.state.fechaInicio = inicioSemana.toISOString().split('T')[0];
        this.state.fechaFin = hoy.toISOString().split('T')[0];
        
        // Actualizar campos de fecha inmediatamente
        this.actualizarCamposFecha();
    },

    // Configurar event listeners
    configurarEventListeners() {
        console.log('Configurando event listeners para informes...');

        // Selector de período
        const selectPeriodo = document.getElementById('periodoInforme');
        if (selectPeriodo) {
            console.log('Selector de período encontrado');
            selectPeriodo.value = this.state.periodo;
            selectPeriodo.addEventListener('change', () => {
                this.state.periodo = selectPeriodo.value;
                if (this.state.periodo !== 'personalizado') {
                    this.inicializarFechas();
                }
            });
        } else {
            console.warn('No se encontró el selector de período');
        }

        // Campos de fecha
        const inputFechaInicio = document.getElementById('fechaInicioInforme');
        const inputFechaFin = document.getElementById('fechaFinInforme');
        
        if (inputFechaInicio) {
            console.log('Campo fecha inicio encontrado');
            inputFechaInicio.value = this.state.fechaInicio;
            inputFechaInicio.addEventListener('change', () => {
                this.state.fechaInicio = inputFechaInicio.value;
            });
        } else {
            console.warn('No se encontró el campo fecha inicio');
        }
        
        if (inputFechaFin) {
            console.log('Campo fecha fin encontrado');
            inputFechaFin.value = this.state.fechaFin;
            inputFechaFin.addEventListener('change', () => {
                this.state.fechaFin = inputFechaFin.value;
            });
        } else {
            console.warn('No se encontró el campo fecha fin');
        }

        // Botón de generar informe
        const btnGenerarInforme = document.getElementById('btnGenerarInforme');
        if (btnGenerarInforme) {
            console.log('Botón generar informe encontrado');
            btnGenerarInforme.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Botón generar informe clickeado');
                this.generarInforme();
            });
        } else {
            console.warn('No se encontró el botón generar informe');
        }

        // Event listener para el botón de exportar PDF
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btnExportarPDF') {
                this.exportarAPDF();
            }
        });
    },

    // Actualizar campos de fecha en el formulario
    actualizarCamposFecha() {
        const inputFechaInicio = document.getElementById('fechaInicioInforme');
        const inputFechaFin = document.getElementById('fechaFinInforme');
        
        if (inputFechaInicio) inputFechaInicio.value = this.state.fechaInicio;
        if (inputFechaFin) inputFechaFin.value = this.state.fechaFin;
    },

    // Generar informe
    async generarInforme() {
        try {
            console.log('Iniciando generación de informe...');
            console.log('Estado actual:', this.state);

            // Validar fechas
            if (!this.validarFechas()) {
                UI.mostrarNotificacion('Por favor, seleccione un rango de fechas válido', 'error');
                return;
            }

            UI.mostrarNotificacion('Generando informe detallado...', 'info');
            
            // Obtener datos
            const datos = await this.obtenerDatosInforme();
            console.log('Datos obtenidos:', datos);
            
            if (!datos || !datos.operaciones || !datos.notas) {
                throw new Error('No se pudieron obtener los datos del informe');
            }

            this.state.datos = datos;
            this.mostrarVistaPrevia(datos);
            UI.mostrarNotificacion('Informe generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar informe:', error);
            UI.mostrarNotificacion(`Error al generar el informe: ${error.message}`, 'error');
        }
    },

    // Validar fechas
    validarFechas() {
        const inicio = new Date(this.state.fechaInicio);
        const fin = new Date(this.state.fechaFin);
        
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return false;
        }
        
        return inicio <= fin;
    },

    // Obtener datos para el informe
    async obtenerDatosInforme() {
        try {
            const [operaciones, notas, personal] = await Promise.all([
                DB.getAll('operaciones'),
                DB.getAll('notas'),
                DB.getAll('personal')
            ]);

            // Definir las áreas válidas
            const areasValidas = ['tunel', 'empaquetado', 'glaseo', 'mezclado', 'hornos', 'almacen'];

            // Filtrar por fechas
            const operacionesFiltradas = operaciones.filter(op => {
                const fechaOp = new Date(op.fecha);
                const inicio = new Date(this.state.fechaInicio);
                const fin = new Date(this.state.fechaFin);
                return fechaOp >= inicio && fechaOp <= fin;
            });

            const notasFiltradas = notas.filter(nota => {
                const fechaNota = new Date(nota.fecha);
                const inicio = new Date(this.state.fechaInicio);
                const fin = new Date(this.state.fechaFin);
                return fechaNota >= inicio && fechaNota <= fin;
            });

            // Obtener información de personas para operaciones
            const operacionesConPersonas = operacionesFiltradas.map(op => {
                const personasInfo = op.personaIds ? op.personaIds.map(id => {
                    const persona = DB.getById('personal', id);
                    return persona ? persona.nombre : 'No encontrado';
                }).join(', ') : '-';
                return { ...op, personasInfo };
            });

            // Obtener información de personas para notas
            const notasConPersonas = notasFiltradas.map(nota => {
                const personasInfo = nota.personaIds ? nota.personaIds.map(id => {
                    const persona = DB.getById('personal', id);
                    return persona ? persona.nombre : 'No encontrado';
                }).join(', ') : '-';
                return { ...nota, personasInfo };
            });

            // Obtener notas por persona
            const notasPorPersona = personal.reduce((acc, persona) => {
                const notasPersona = notasFiltradas.filter(nota => 
                    nota.personaIds && nota.personaIds.includes(persona.id)
                );
                
                acc[persona.id] = {
                    nombre: persona.nombre,
                    totalNotas: notasPersona.length,
                    notas: notasPersona.map(nota => ({
                        fecha: new Date(nota.fecha).toLocaleDateString(),
                        area: nota.area,
                        contenido: nota.contenido,
                        estado: nota.estado || ''
                    }))
                };
                
                return acc;
            }, {});

            // Obtener operaciones por persona
            const operacionesPorPersona = personal.reduce((acc, persona) => {
                const operacionesPersona = operacionesFiltradas.filter(op => 
                    op.personaIds && op.personaIds.includes(persona.id)
                );
                
                acc[persona.id] = {
                    nombre: persona.nombre,
                    totalOperaciones: operacionesPersona.length,
                    operaciones: operacionesPersona.map(op => ({
                        fecha: new Date(op.fecha).toLocaleDateString(),
                        tipo: op.tipo,
                        lugar: op.lugar,
                        descripcion: op.descripcion,
                        estado: op.estado || ''
                    }))
                };
                
                return acc;
            }, {});

            // Función auxiliar para obtener el área correcta
            const obtenerArea = (nota, operacion) => {
                // Primero intentar obtener el área de la nota
                if (nota && nota.area && areasValidas.includes(nota.area.toLowerCase())) {
                    return nota.area.toLowerCase();
                }
                
                // Si no hay área válida en la nota, intentar obtenerla de la operación
                if (operacion && operacion.area && areasValidas.includes(operacion.area.toLowerCase())) {
                    return operacion.area.toLowerCase();
                }
                
                // Si no se puede determinar el área, usar 'No especificada'
                return 'No especificada';
            };

            // Calcular métricas generales
            const metricas = {
                totalOperaciones: operacionesFiltradas.length,
                totalNotas: notasFiltradas.length,
                operacionesCompletadas: operacionesFiltradas.filter(op => op.estado === 'completado').length,
                
                // Estadísticas por tipo de operación
                operacionesPorTipo: operacionesFiltradas.reduce((acc, op) => {
                    if (!acc[op.tipo]) acc[op.tipo] = 0;
                    acc[op.tipo]++;
                    return acc;
                }, {}),
                
                // Estadísticas por área basadas en notas
                notasPorArea: notasFiltradas.reduce((acc, nota) => {
                    const area = obtenerArea(nota);
                    if (!acc[area]) acc[area] = 0;
                    acc[area]++;
                    return acc;
                }, {}),
                
                // Análisis de productividad por área
                productividadPorArea: operacionesFiltradas.reduce((acc, op) => {
                    // Buscar todas las notas relacionadas con esta operación
                    const notasRelacionadas = notasFiltradas.filter(nota => 
                        nota.operacionId === op.id
                    );
                    
                    // Obtener el área correcta
                    const area = obtenerArea(notasRelacionadas[0], op);
                    
                    if (!acc[area]) {
                        acc[area] = {
                            total: 0,
                            completadas: 0,
                            tipos: {},
                            personas: new Set()
                        };
                    }
                    acc[area].total++;
                    if (op.estado === 'completado') acc[area].completadas++;
                    
                    // Contar por tipo
                    if (!acc[area].tipos[op.tipo]) acc[area].tipos[op.tipo] = 0;
                    acc[area].tipos[op.tipo]++;
                    
                    // Registrar personas
                    if (op.personaIds) {
                        op.personaIds.forEach(id => acc[area].personas.add(id));
                    }
                    
                    return acc;
                }, {}),
                
                // Análisis de desempeño del personal
                desempenoPersonal: personal.reduce((acc, persona) => {
                    const operacionesPersona = operacionesFiltradas.filter(op => 
                        op.personaIds && op.personaIds.includes(persona.id)
                    );
                    
                    acc[persona.id] = {
                        nombre: persona.nombre,
                        totalOperaciones: operacionesPersona.length,
                        operacionesCompletadas: operacionesPersona.filter(op => op.estado === 'completado').length,
                        areas: new Set(),
                        tipos: {},
                        notas: notasPorPersona[persona.id] || { totalNotas: 0, notas: [] },
                        operaciones: operacionesPorPersona[persona.id] || { totalOperaciones: 0, operaciones: [] }
                    };
                    
                    // Análisis por área y tipo
                    operacionesPersona.forEach(op => {
                        // Buscar todas las notas relacionadas con esta operación
                        const notasRelacionadas = notasFiltradas.filter(nota => 
                            nota.operacionId === op.id
                        );
                        
                        // Obtener el área correcta
                        const area = obtenerArea(notasRelacionadas[0], op);
                        acc[persona.id].areas.add(area);
                        
                        if (!acc[persona.id].tipos[op.tipo]) {
                            acc[persona.id].tipos[op.tipo] = 0;
                        }
                        acc[persona.id].tipos[op.tipo]++;
                    });
                    
                    // Convertir Set a Array para serialización
                    acc[persona.id].areas = Array.from(acc[persona.id].areas);
                    
                    return acc;
                }, {})
            };

            return {
                operaciones: operacionesConPersonas,
                notas: notasConPersonas,
                metricas,
                periodo: {
                    inicio: this.state.fechaInicio,
                    fin: this.state.fechaFin
                }
            };
        } catch (error) {
            console.error('Error al obtener datos del informe:', error);
            throw new Error('Error al obtener datos del informe');
        }
    },

    // Mostrar vista previa del informe
    mostrarVistaPrevia(datos) {
        const container = document.getElementById('vistaPreviaInforme');
        if (!container) {
            console.error('No se encontró el contenedor de vista previa');
            return;
        }

        let html = `
            <div class="report-header mb-4">
                <h2 class="text-center">Informe de Producción</h2>
                <p class="text-center text-muted">Período: ${new Date(this.state.fechaInicio).toLocaleDateString('es-ES')} al ${new Date(this.state.fechaFin).toLocaleDateString('es-ES')}</p>
            </div>

            <!-- Navegación por pestañas -->
            <ul class="nav nav-tabs mb-4" id="reportTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="metricas-tab" data-bs-toggle="tab" data-bs-target="#metricas" type="button" role="tab">
                        <i class="fas fa-chart-bar me-2"></i>Métricas
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="resumen-tab" data-bs-toggle="tab" data-bs-target="#resumen" type="button" role="tab">
                        <i class="fas fa-list me-2"></i>Resumen
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="elaborado-tab" data-bs-toggle="tab" data-bs-target="#elaborado" type="button" role="tab">
                        <i class="fas fa-file-alt me-2"></i>Elaborado
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="dc-tab" data-bs-toggle="tab" data-bs-target="#dc" type="button" role="tab">
                        <i class="fas fa-tasks me-2"></i>D/C
                    </button>
                </li>
            </ul>

            <!-- Contenido de las pestañas -->
            <div class="tab-content" id="reportTabsContent">
                <!-- Pestaña de Métricas -->
                <div class="tab-pane fade show active" id="metricas" role="tabpanel">
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="card-title mb-0">D/C</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            Total D/C
                                            <span class="badge bg-primary rounded-pill">${datos.metricas.totalOperaciones}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            D/C por día
                                            <span class="badge bg-primary rounded-pill">${(datos.metricas.totalOperaciones / (Math.ceil((new Date(datos.periodo.fin) - new Date(datos.periodo.inicio)) / (1000 * 60 * 60 * 24)))).toFixed(1)}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            Personas con D/C
                                            <span class="badge bg-primary rounded-pill">${Object.values(datos.metricas.desempenoPersonal).filter(p => p.totalOperaciones > 0).length}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="card h-100">
                                <div class="card-header bg-success text-white">
                                    <h5 class="card-title mb-0">Elaborado</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            Total Elaborado
                                            <span class="badge bg-success rounded-pill">${datos.metricas.totalNotas}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            Elaborado por día
                                            <span class="badge bg-success rounded-pill">${(datos.metricas.totalNotas / (Math.ceil((new Date(datos.periodo.fin) - new Date(datos.periodo.inicio)) / (1000 * 60 * 60 * 24)))).toFixed(1)}</span>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            Personas con Elaborado
                                            <span class="badge bg-success rounded-pill">${Object.values(datos.metricas.desempenoPersonal).filter(p => p.notas.totalNotas > 0).length}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pestaña de Resumen -->
                <div class="tab-pane fade" id="resumen" role="tabpanel">
                    <div class="card">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="resumenTable">
                                    <thead>
                                        <tr>
                                            <th>Persona</th>
                                            <th>Total D/C</th>
                                            <th>Total Elaborado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.entries(datos.metricas.desempenoPersonal)
                                            .filter(([_, persona]) => persona.totalOperaciones > 0 || persona.notas.totalNotas > 0)
                                            .map(([_, persona]) => `
                                                <tr>
                                                    <td>${persona.nombre}</td>
                                                    <td>${persona.totalOperaciones}</td>
                                                    <td>${persona.notas.totalNotas}</td>
                                                </tr>
                                            `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pestaña de Elaborado -->
                <div class="tab-pane fade" id="elaborado" role="tabpanel">
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="searchElaborado" placeholder="Buscar persona o contenido...">
                            </div>
                        </div>
                    </div>
                    <div class="bulma-accordions" id="elaboradoAccordion">
                        ${Object.entries(datos.metricas.desempenoPersonal)
                            .filter(([_, persona]) => persona.notas.totalNotas > 0)
                            .map(([_, persona], index) => `
                                <div class="bulma-accordion">
                                    <div class="bulma-accordion-header d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-user me-2"></i>
                                            <div>
                                                <h6 class="mb-0">${persona.nombre}</h6>
                                                <small class="text-muted">${persona.notas.totalNotas} notas</small>
                                            </div>
                                        </div>
                                        <span class="badge bg-success">${persona.notas.totalNotas}</span>
                                    </div>
                                    <div class="bulma-accordion-body">
                                        <div class="table-responsive">
                                            <table class="table table-hover table-sm">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th style="width: 15%">Fecha</th>
                                                        <th style="width: 15%">Área</th>
                                                        <th style="width: 60%">Contenido</th>
                                                        <th style="width: 10%">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${persona.notas.notas.map(nota => `
                                                        <tr>
                                                            <td class="text-nowrap small">${nota.fecha}</td>
                                                            <td><span class="badge bg-info">${nota.area}</span></td>
                                                            <td class="small">${nota.contenido}</td>
                                                            <td>${nota.estado ? `<span class="badge bg-success">${nota.estado}</span>` : ''}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>

                <!-- Pestaña de D/C -->
                <div class="tab-pane fade" id="dc" role="tabpanel">
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="searchDC" placeholder="Buscar persona o descripción...">
                            </div>
                        </div>
                    </div>
                    <div class="bulma-accordions" id="dcAccordion">
                        ${Object.entries(datos.metricas.desempenoPersonal)
                            .filter(([_, persona]) => persona.totalOperaciones > 0)
                            .map(([_, persona], index) => `
                                <div class="bulma-accordion">
                                    <div class="bulma-accordion-header">
                                        <div class="d-flex align-items-center w-100">
                                            <div class="flex-grow-1">
                                                <h5 class="mb-0">${persona.nombre}</h5>
                                                <small class="text-muted">${persona.totalOperaciones} operaciones</small>
                                            </div>
                                            <div class="ms-3">
                                                <span class="badge bg-primary rounded-pill">${persona.totalOperaciones}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bulma-accordion-body">
                                        <div class="table-responsive">
                                            <table class="table table-hover table-sm">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>Fecha</th>
                                                        <th>Tipo</th>
                                                        <th>Lugar</th>
                                                        <th>Descripción</th>
                                                        <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${persona.operaciones.operaciones.map(op => `
                                                        <tr>
                                                            <td class="text-nowrap">${op.fecha}</td>
                                                            <td><span class="badge bg-primary">${op.tipo}</span></td>
                                                            <td>${op.lugar}</td>
                                                            <td>${op.descripcion}</td>
                                                            <td>${op.estado ? `<span class="badge bg-success">${op.estado}</span>` : ''}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Inicializar DataTables para la tabla de resumen
        if (window.jQuery && window.$.fn.DataTable) {
            $('#resumenTable').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
                },
                pageLength: 10,
                order: [[1, 'desc']]
            });
        }

        // Configurar los acordeones para que se puedan cerrar
        const elaboradoAccordion = document.getElementById('elaboradoAccordion');
        const dcAccordion = document.getElementById('dcAccordion');

        // Función para inicializar un acordeón
        const inicializarAcordeon = (acordeon) => {
            if (!acordeon) return;

            const accordions = acordeon.querySelectorAll('.bulma-accordion');
            
            accordions.forEach(accordion => {
                const header = accordion.querySelector('.bulma-accordion-header');
                const body = accordion.querySelector('.bulma-accordion-body');
                
                header.addEventListener('click', () => {
                    // Cerrar todos los demás acordeones
                    accordions.forEach(other => {
                        if (other !== accordion) {
                            other.querySelector('.bulma-accordion-body').classList.remove('is-active');
                        }
                    });
                    
                    // Alternar el acordeón actual
                    body.classList.toggle('is-active');
                });
            });
        };

        // Inicializar ambos acordeones
        inicializarAcordeon(elaboradoAccordion);
        inicializarAcordeon(dcAccordion);

        // Funcionalidad de búsqueda
        const setupAccordionSearch = (searchId, accordionId) => {
            const searchInput = document.getElementById(searchId);
            const accordion = document.getElementById(accordionId);
            
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = accordion.querySelectorAll('.bulma-accordion');
                
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    const matches = text.includes(searchTerm);
                    item.style.display = matches ? '' : 'none';
                });
            });
        };

        // Configurar búsqueda para ambas secciones
        setupAccordionSearch('searchElaborado', 'elaboradoAccordion');
        setupAccordionSearch('searchDC', 'dcAccordion');
    },

    // Método para exportar a PDF
    async exportarAPDF() {
        try {
            if (!this.state.datos) {
                throw new Error('No hay datos para exportar');
            }

            const doc = new jsPDF();
            let y = 20;
            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Función para agregar nueva página
            const addNewPage = () => {
                doc.addPage();
                y = 20;
            };

            // Función para dibujar línea separadora
            const drawSeparator = () => {
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, y, pageWidth - margin, y);
                y += 5;
            };

            // Función para agregar título de sección
            const addSectionTitle = (title) => {
                doc.setFontSize(14);
                doc.setTextColor(41, 128, 185);
                doc.text(title, margin, y);
                y += 10;
            };

            // Función para agregar texto normal
            const addText = (text, x = margin, fontSize = 10) => {
                doc.setFontSize(fontSize);
                doc.setTextColor(0, 0, 0);
                doc.text(text, x, y);
                y += 7;
            };

            // Función para agregar texto en negrita
            const addBoldText = (text, x = margin) => {
                doc.setFont(undefined, 'bold');
                addText(text, x);
                doc.setFont(undefined, 'normal');
            };

            // Encabezado
            doc.setFontSize(20);
            doc.setTextColor(41, 128, 185);
            doc.text('Informe de Producción', pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Período
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Período: ${new Date(this.state.fechaInicio).toLocaleDateString('es-ES')} al ${new Date(this.state.fechaFin).toLocaleDateString('es-ES')}`, pageWidth / 2, y, { align: 'center' });
            y += 20;

            // Métricas Generales
            addSectionTitle('Métricas Generales');
            drawSeparator();

            // D/C
            addBoldText('D/C:');
            addText(`Total D/C: ${this.state.datos.metricas.totalOperaciones}`, margin + 5);
            addText(`D/C por día: ${(this.state.datos.metricas.totalOperaciones / (Math.ceil((new Date(this.state.datos.periodo.fin) - new Date(this.state.datos.periodo.inicio)) / (1000 * 60 * 60 * 24)))).toFixed(1)}`, margin + 5);
            addText(`Personas con D/C: ${Object.values(this.state.datos.metricas.desempenoPersonal).filter(p => p.totalOperaciones > 0).length}`, margin + 5);
            y += 10;

            // Elaborado
            addBoldText('Elaborado:');
            addText(`Total Elaborado: ${this.state.datos.metricas.totalNotas}`, margin + 5);
            addText(`Elaborado por día: ${(this.state.datos.metricas.totalNotas / (Math.ceil((new Date(this.state.datos.periodo.fin) - new Date(this.state.datos.periodo.inicio)) / (1000 * 60 * 60 * 24)))).toFixed(1)}`, margin + 5);
            addText(`Personas con Elaborado: ${Object.values(this.state.datos.metricas.desempenoPersonal).filter(p => p.notas.totalNotas > 0).length}`, margin + 5);
            y += 15;

            // Resumen por Persona
            addSectionTitle('Resumen por Persona');
            drawSeparator();

            // Encabezados de la tabla
            doc.setFont(undefined, 'bold');
            doc.text('Persona', margin, y);
            doc.text('Total D/C', margin + 60, y);
            doc.text('Total Elaborado', margin + 100, y);
            y += 7;
            drawSeparator();

            // Datos de la tabla
            doc.setFont(undefined, 'normal');
            Object.entries(this.state.datos.metricas.desempenoPersonal)
                .filter(([_, persona]) => persona.totalOperaciones > 0 || persona.notas.totalNotas > 0)
                .forEach(([_, persona]) => {
                    if (y > pageHeight - 20) {
                        addNewPage();
                    }
                    doc.text(persona.nombre, margin, y);
                    doc.text(persona.totalOperaciones.toString(), margin + 60, y);
                    doc.text(persona.notas.totalNotas.toString(), margin + 100, y);
                    y += 7;
                });

            // Elaborado por Persona
            addNewPage();
            addSectionTitle('Elaborado por Persona');
            drawSeparator();

            Object.entries(this.state.datos.metricas.desempenoPersonal)
                .filter(([_, persona]) => persona.notas.totalNotas > 0)
                .forEach(([_, persona]) => {
                    if (y > pageHeight - 50) {
                        addNewPage();
                    }
                    addBoldText(persona.nombre);
                    addText(`Total: ${persona.notas.totalNotas}`, margin + 5);
                    
                    persona.notas.notas.forEach(nota => {
                        if (y > pageHeight - 20) {
                            addNewPage();
                        }
                        addText(`• ${nota.fecha} - ${nota.area}`, margin + 10);
                        addText(nota.contenido, margin + 15);
                        if (nota.estado) {
                            addText(`Estado: ${nota.estado}`, margin + 15);
                        }
                        y += 5;
                    });
                    y += 10;
                });

            // D/C por Persona
            addNewPage();
            addSectionTitle('D/C por Persona');
            drawSeparator();

            Object.entries(this.state.datos.metricas.desempenoPersonal)
                .filter(([_, persona]) => persona.totalOperaciones > 0)
                .forEach(([_, persona]) => {
                    if (y > pageHeight - 50) {
                        addNewPage();
                    }
                    addBoldText(persona.nombre);
                    addText(`Total: ${persona.totalOperaciones}`, margin + 5);
                    
                    persona.operaciones.operaciones.forEach(op => {
                        if (y > pageHeight - 20) {
                            addNewPage();
                        }
                        addText(`• ${op.fecha} - ${op.tipo}`, margin + 10);
                        addText(`Lugar: ${op.lugar}`, margin + 15);
                        addText(`Descripción: ${op.descripcion}`, margin + 15);
                        if (op.estado) {
                            addText(`Estado: ${op.estado}`, margin + 15);
                        }
                        y += 5;
                    });
                    y += 10;
                });

            // Guardar el PDF
            const fileName = `informe_produccion_${this.state.fechaInicio}_${this.state.fechaFin}.pdf`;
            doc.save(fileName);
            
            UI.mostrarNotificacion(`PDF generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al exportar a PDF:', error);
            UI.mostrarNotificacion(`Error al generar el PDF: ${error.message}`, 'error');
        }
    }
};

// Inicializar el módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando módulo de informes...');
    Informes.init();
}); 