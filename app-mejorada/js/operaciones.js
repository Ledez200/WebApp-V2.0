/**
 * Módulo de gestión de operaciones (descargas, elaboraciones, clasificaciones)
 */

const Operaciones = {
    // Estado del módulo
    state: {
        operacionEditando: null,
        filtros: {
            fecha: '',
            tipo: '',
            lugar: '',
            busqueda: '',
            persona: '',
            estado: 'todos',
            semana: 'todas'
        }
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de operaciones
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'operaciones') {
                this.verificarYCargarPersonal();
                this.mostrarOperaciones();
            }
        });
        
        // Escuchar eventos de actualización de personal
        document.addEventListener('personalActualizado', () => {
            console.log('Evento de actualización de personal recibido en Operaciones');
            // Actualizar los selectores de personas cuando se modifique el personal
            if (document.getElementById('operaciones').classList.contains('active')) {
                this.cargarPersonasEnSelectores();
            }
        });
    },

    // Cargar plantilla HTML en la sección
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Registrar Operación</h5>
                                <form id="formNuevaOperacion">
                                    <div class="mb-3">
                                        <label for="tipoOperacion" class="form-label">Tipo de Operación</label>
                                        <select class="form-select" id="tipoOperacion" required>
                                            <option value="">Seleccione un tipo</option>
                                            <option value="Descarga">Descarga</option>
                                            <option value="Clasificación">Clasificación</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="fechaOperacion" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="fechaOperacion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="horaOperacion" class="form-label">Hora</label>
                                        <input type="time" class="form-control" id="horaOperacion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="lugarOperacion" class="form-label">Lugar/Cliente</label>
                                        <select class="form-select" id="lugarOperacion" required>
                                            <option value="">Seleccione un cliente</option>
                                            <option value="FRIGALSA">FRIGALSA</option>
                                            <option value="ISP">ISP</option>
                                            <option value="PAY-PAY">PAY-PAY</option>
                                            <option value="ATUNLO">ATUNLO</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="descripcionOperacion" class="form-label">Descripción</label>
                                        <textarea class="form-control" id="descripcionOperacion" rows="3"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="personasOperacion" class="form-label">Personas Asignadas</label>
                                        <div class="input-group">
                                            <select class="form-select" id="personasOperacion" multiple size="3">
                                                <!-- Las personas se cargarán dinámicamente -->
                                            </select>
                                            <button class="btn btn-outline-secondary" type="button" id="btnRefrescarPersonalOperacion" title="Actualizar lista de personal">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        </div>
                                        <div class="form-text">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples personas</div>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Guardar Operación</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Historial de Operaciones</h5>
                                
                                <div class="row mb-3 filtros-container">
                                    <div class="col-md-2">
                                        <label for="filtroFechaOperacion" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="filtroFechaOperacion">
                                    </div>
                                    <div class="col-md-2">
                                        <label for="filtroTipoOperacion" class="form-label">Tipo</label>
                                        <select class="form-select" id="filtroTipoOperacion">
                                            <option value="">Todos</option>
                                            <option value="Descarga">Descarga</option>
                                            <option value="Clasificación">Clasificación</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="filtroLugarOperacion" class="form-label">Cliente</label>
                                        <select class="form-select" id="filtroLugarOperacion">
                                            <option value="">Todos</option>
                                            <option value="FRIGALSA">FRIGALSA</option>
                                            <option value="ISP">ISP</option>
                                            <option value="PAY-PAY">PAY-PAY</option>
                                            <option value="ATUNLO">ATUNLO</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="filtroPersonaOperacion" class="form-label">Persona</label>
                                        <select class="form-select" id="filtroPersonaOperacion">
                                            <option value="">Todas</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="filtroEstadoOperacion" class="form-label">Estado</label>
                                        <select class="form-select" id="filtroEstadoOperacion">
                                            <option value="todos">Todos</option>
                                            <option value="pendiente">Pendientes</option>
                                            <option value="completado">Completados</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label for="filtroSemanaOperacion" class="form-label">Semana</label>
                                        <select class="form-select" id="filtroSemanaOperacion">
                                            <option value="todas">Todas</option>
                                            <option value="actual">Actual</option>
                                            <option value="proxima">Próxima</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div id="listaOperaciones" class="operaciones-container">
                                    <!-- Las operaciones se cargarán dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para editar operación -->
            <div class="modal fade" id="editarOperacionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Operación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formEditarOperacion">
                                <input type="hidden" id="idOperacionEditar">
                                <div class="mb-3">
                                    <label for="tipoOperacionEditar" class="form-label">Tipo de Operación</label>
                                    <select class="form-select" id="tipoOperacionEditar" required>
                                        <option value="Descarga">Descarga</option>
                                        <option value="Clasificación">Clasificación</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="fechaOperacionEditar" class="form-label">Fecha</label>
                                    <input type="date" class="form-control" id="fechaOperacionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="horaOperacionEditar" class="form-label">Hora</label>
                                    <input type="time" class="form-control" id="horaOperacionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="lugarOperacionEditar" class="form-label">Lugar/Cliente</label>
                                    <select class="form-select" id="lugarOperacionEditar" required>
                                        <option value="FRIGALSA">FRIGALSA</option>
                                        <option value="ISP">ISP</option>
                                        <option value="PAY-PAY">PAY-PAY</option>
                                        <option value="ATUNLO">ATUNLO</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="descripcionOperacionEditar" class="form-label">Descripción</label>
                                    <textarea class="form-control" id="descripcionOperacionEditar" rows="3"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="personasOperacionEditar" class="form-label">Personas Asignadas</label>
                                    <div class="input-group">
                                        <select class="form-select" id="personasOperacionEditar" multiple size="3">
                                            <!-- Las personas se cargarán dinámicamente -->
                                        </select>
                                        <button class="btn btn-outline-secondary" type="button" id="btnRefrescarPersonalOperacionEditar" title="Actualizar lista de personal">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples personas</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnGuardarEdicionOperacion">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('operaciones', template);
        
        // Inicializar eventos después de cargar la plantilla
        this.setupEventos();
    },

    // Configurar eventos para la interfaz de operaciones
    setupEventos() {
        // Cargar personas en los selectores inmediatamente
        this.verificarYCargarPersonal();
        
        // Botones para refrescar personal
        const btnRefrescarPersonal = document.getElementById('btnRefrescarPersonalOperacion');
        if (btnRefrescarPersonal) {
            btnRefrescarPersonal.addEventListener('click', (e) => {
                e.preventDefault();
                this.verificarYCargarPersonal();
                UI.mostrarNotificacion('Información', 'Lista de personal actualizada', 'info');
            });
        }
        
        const btnRefrescarPersonalEditar = document.getElementById('btnRefrescarPersonalOperacionEditar');
        if (btnRefrescarPersonalEditar) {
            btnRefrescarPersonalEditar.addEventListener('click', (e) => {
                e.preventDefault();
                this.verificarYCargarPersonal();
                UI.mostrarNotificacion('Información', 'Lista de personal actualizada', 'info');
            });
        }
        
        // Formulario para nueva operación
        const formNuevaOperacion = document.getElementById('formNuevaOperacion');
        if (formNuevaOperacion) {
            formNuevaOperacion.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarOperacion();
            });
        }
        
        // Eventos para filtros
        const filtroFecha = document.getElementById('filtroFechaOperacion');
        const filtroTipo = document.getElementById('filtroTipoOperacion');
        const filtroLugar = document.getElementById('filtroLugarOperacion');
        const filtroPersona = document.getElementById('filtroPersonaOperacion');
        const filtroEstado = document.getElementById('filtroEstadoOperacion');
        const filtroSemana = document.getElementById('filtroSemanaOperacion');
        
        if (filtroFecha) {
            filtroFecha.addEventListener('change', () => {
                this.state.filtros.fecha = filtroFecha.value;
                this.mostrarOperaciones();
            });
        }
        
        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => {
                this.state.filtros.tipo = filtroTipo.value;
                this.mostrarOperaciones();
            });
        }
        
        if (filtroLugar) {
            filtroLugar.addEventListener('change', () => {
                this.state.filtros.lugar = filtroLugar.value;
                this.mostrarOperaciones();
            });
        }
        
        if (filtroPersona) {
            filtroPersona.addEventListener('change', () => {
                this.state.filtros.persona = filtroPersona.value;
                this.mostrarOperaciones();
            });
        }
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                this.state.filtros.estado = filtroEstado.value;
                this.mostrarOperaciones();
            });
        }
        
        if (filtroSemana) {
            filtroSemana.addEventListener('change', () => {
                this.state.filtros.semana = filtroSemana.value;
                this.mostrarOperaciones();
            });
        }
        
        // Eventos para editar operación
        const btnGuardarEdicion = document.getElementById('btnGuardarEdicionOperacion');
        if (btnGuardarEdicion) {
            btnGuardarEdicion.addEventListener('click', () => {
                this.guardarEdicionOperacion();
            });
        }
        
        // Inicializar fecha actual en el formulario
        const fechaOperacion = document.getElementById('fechaOperacion');
        if (fechaOperacion) {
            const ahora = new Date();
            fechaOperacion.value = ahora.toISOString().split('T')[0];
        }

        // Manejador de eventos para botones de operaciones
        document.addEventListener('click', async (e) => {
            const target = e.target;
            
            // Botón Iniciar
            if (target.matches('.btn-iniciar')) {
                const id = target.dataset.id;
                if (id) {
                    await iniciarOperacion(id);
                    await this.mostrarOperaciones();
                }
            }
            
            // Botón Completar
            if (target.matches('.btn-completar')) {
                const id = target.dataset.id;
                if (id) {
                    await completarOperacion(id);
                    await this.mostrarOperaciones();
                }
            }
        });
    },

    // Verificar datos de personal y cargar en selectores
    verificarYCargarPersonal() {
        const personal = DB.getAll('personal');
        console.log(`Verificando datos de personal: ${personal.length} registros encontrados`);
        
        // Cargar los datos en los selectores
        this.cargarPersonasEnSelectores();
    },
    
    // Cargar las personas registradas en los selectores
    cargarPersonasEnSelectores() {
        // Obtener TODAS las personas registradas (solo activas)
        const personal = DB.getAll('personal');
        const personalActivo = personal.filter(p => p.activo !== false);
        
        // Ordenar alfabéticamente
        personalActivo.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Selectores donde cargar las personas
        const selectores = [
            document.getElementById('personasOperacion'),
            document.getElementById('personasOperacionEditar'),
            document.getElementById('filtroPersonaOperacion')
        ];
        
        selectores.forEach(selector => {
            if (!selector) {
                console.warn(`Selector '${selector}' no encontrado`);
                return;
            }
            
            // Limpiar completamente el selector
            selector.innerHTML = '';
            
            // Para el selector de filtro, añadir la opción "Todas las personas"
            if (selector.id === 'filtroPersonaOperacion') {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Todas las personas';
                selector.appendChild(option);
            }
            
            // Añadir las personas sin duplicados
            const personasAgregadas = new Set(); // Para controlar IDs ya agregados
            
            personalActivo.forEach(persona => {
                // Asegurar que la persona tiene un ID válido
                if (!persona.id) {
                    console.warn(`Persona sin ID encontrada: ${persona.nombre}`);
                    return;
                }
                
                // Evitar duplicados verificando si ya se añadió este ID
                if (!personasAgregadas.has(persona.id)) {
                    const option = document.createElement('option');
                    option.value = persona.id;
                    option.textContent = persona.nombre;
                    selector.appendChild(option);
                    
                    // Marcar como agregada
                    personasAgregadas.add(persona.id);
                }
            });
        });
    },

    // Guardar nueva operación
    guardarOperacion() {
        const tipo = document.getElementById('tipoOperacion').value;
        const fecha = document.getElementById('fechaOperacion').value;
        const hora = document.getElementById('horaOperacion').value;
        const lugar = document.getElementById('lugarOperacion').value;
        const descripcion = document.getElementById('descripcionOperacion').value;
        const personaIds = Array.from(document.getElementById('personasOperacion').selectedOptions, option => option.value);
        
        if (!tipo || !fecha || !hora || !lugar || !descripcion) {
            UI.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Obtener información de las personas asignadas si existen
        let personasNombres = [];
        if (personaIds.length > 0) {
            personaIds.forEach(id => {
                if (id) {
                    const personaObj = DB.getById('personal', id);
                    if (personaObj) {
                        personasNombres.push(personaObj.nombre);
                    }
                }
            });
        }
        
        const fechaObj = new Date(`${fecha}T${hora}:00`);
        
        const nuevaOperacion = {
            id: `operacion_${Date.now()}`,
            tipo,
            fecha: fechaObj.toISOString(),
            lugar,
            descripcion,
            personaIds: personaIds.filter(id => id),
            personasNombres: personasNombres,
            creada: new Date().toISOString()
        };
        
        // Guardar en la base de datos
        const resultado = DB.add('operaciones', nuevaOperacion);
        
        if (resultado) {
            // Limpiar formulario
            document.getElementById('tipoOperacion').value = '';
            document.getElementById('lugarOperacion').value = '';
            document.getElementById('descripcionOperacion').value = '';
            
            // Actualizar vista
            this.mostrarOperaciones();
            
            // Notificar éxito
            UI.mostrarNotificacion('Éxito', 'Operación guardada correctamente', 'success');
            
            // Disparar eventos específicos
            document.dispatchEvent(new CustomEvent('operacionCreada', { 
                detail: { operacion: resultado } 
            }));
            document.dispatchEvent(new CustomEvent('datosActualizados', { 
                detail: { tipo: 'operaciones' } 
            }));

            // Actualizar el dashboard inmediatamente
            if (window.app && typeof window.app.actualizarDashboard === 'function') {
                window.app.actualizarDashboard();
            }
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo guardar la operación', 'error');
        }
    },

    // Iniciar seguimiento de una operación
    iniciarSeguimiento(id) {
        const operacion = DB.getById('operaciones', id);
        if (!operacion) {
            UI.mostrarNotificacion('Error', 'No se encontró la operación', 'error');
            return;
        }

        const resultado = DB.update('operaciones', id, {
            ...operacion,
            seguimiento: 'en_progreso',
            estado: 'en_progreso'
        });

        if (resultado) {
            this.mostrarOperaciones();
            UI.mostrarNotificacion('Éxito', 'Seguimiento iniciado', 'success');
            document.dispatchEvent(new CustomEvent('datosActualizados', { 
                detail: { tipo: 'operaciones' } 
            }));
        }
    },

    // Completar una operación
    async completarOperacion(id) {
        try {
            const operacion = await DB.get('operaciones', id);
            if (operacion) {
                operacion.estado = 'completado';
                operacion.completadoEn = new Date().toISOString();
                await DB.update('operaciones', id, operacion);
                UI.mostrarNotificacion('Operación completada correctamente', 'success');
                // Actualizar el dashboard inmediatamente
                window.app.actualizarDashboard();
            }
        } catch (error) {
            console.error('Error al completar operación:', error);
            UI.mostrarNotificacion('Error al completar la operación', 'error');
        }
    },

    // Obtener las operaciones filtradas
    getOperacionesFiltradas() {
        let operaciones = DB.getOperaciones({
            fecha: this.state.filtros.fecha,
            tipo: this.state.filtros.tipo,
            lugar: this.state.filtros.lugar,
            busqueda: this.state.filtros.busqueda
        });
        
        // Aplicar filtro de persona
        if (this.state.filtros.persona) {
            operaciones = operaciones.filter(op => 
                op.personaIds && 
                Array.isArray(op.personaIds) && 
                op.personaIds.includes(this.state.filtros.persona)
            );
        }
        
        // Aplicar filtro de estado
        if (this.state.filtros.estado !== 'todos') {
            operaciones = operaciones.filter(op => op.estado === this.state.filtros.estado);
        }
        
        // Aplicar filtro de semana
        if (this.state.filtros.semana !== 'todas') {
            const hoy = new Date();
            const inicioSemanaActual = new Date(hoy);
            inicioSemanaActual.setDate(hoy.getDate() - hoy.getDay());
            inicioSemanaActual.setHours(0, 0, 0, 0);
            
            const finSemanaActual = new Date(inicioSemanaActual);
            finSemanaActual.setDate(inicioSemanaActual.getDate() + 6);
            finSemanaActual.setHours(23, 59, 59, 999);
            
            const inicioSemanaSiguiente = new Date(finSemanaActual);
            inicioSemanaSiguiente.setDate(finSemanaActual.getDate() + 1);
            inicioSemanaSiguiente.setHours(0, 0, 0, 0);
            
            const finSemanaSiguiente = new Date(inicioSemanaSiguiente);
            finSemanaSiguiente.setDate(inicioSemanaSiguiente.getDate() + 6);
            finSemanaSiguiente.setHours(23, 59, 59, 999);
            
            if (this.state.filtros.semana === 'actual') {
                operaciones = operaciones.filter(op => {
                    const fechaOp = new Date(op.fecha);
                    return fechaOp >= inicioSemanaActual && fechaOp <= finSemanaActual;
                });
            } else if (this.state.filtros.semana === 'proxima') {
                operaciones = operaciones.filter(op => {
                    const fechaOp = new Date(op.fecha);
                    return fechaOp >= inicioSemanaSiguiente && fechaOp <= finSemanaSiguiente;
                });
            }
        }
        
        // Ordenar por fecha (ascendente) y luego por estado (pendientes primero)
        operaciones.sort((a, b) => {
            // Primero ordenar por fecha
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            
            if (fechaA < fechaB) return -1;
            if (fechaA > fechaB) return 1;
            
            // Si la fecha es la misma, ordenar por estado (pendientes primero)
            if (a.estado === 'pendiente' && b.estado === 'completado') return -1;
            if (a.estado === 'completado' && b.estado === 'pendiente') return 1;
            
            return 0;
        });
        
        return operaciones;
    },

    // Mostrar las operaciones según los filtros
    mostrarOperaciones() {
        const operaciones = this.getOperacionesFiltradas();
        const container = document.getElementById('listaOperaciones');
        
        if (!container) return;
        
        if (operaciones.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-inbox"></i>
                    <p>No hay operaciones registradas con los filtros seleccionados</p>
                </div>
            `;
            return;
        }
        
        // Ordenar operaciones por fecha (más recientes primero)
        operaciones.sort((a, b) => {
            return new Date(b.fecha) - new Date(a.fecha);
        });
        
        let html = '';
        
        operaciones.forEach(op => {
            // Formatear fecha
            const fecha = new Date(op.fecha);
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
            
            // Determinar clase para el tipo de operación
            let tipoClass = '';
            let badgeClass = '';
            let operacionClass = '';
            
            switch (op.tipo) {
                case 'Descarga':
                    tipoClass = 'bg-success';
                    badgeClass = 'badge-descarga';
                    operacionClass = 'operacion-descarga';
                    break;
                case 'Clasificación':
                    tipoClass = 'bg-warning';
                    badgeClass = 'badge-clasificacion';
                    operacionClass = 'operacion-clasificacion';
                    break;
                default:
                    tipoClass = 'bg-secondary';
                    operacionClass = 'operacion-default';
            }
            
            // Información de personas asignadas
            let personasInfo = '';
            if (op.personasInfo) {
                personasInfo = `<div class="mt-1"><small><i class="fas fa-users me-1"></i>Asignada a: ${op.personasInfo}</small></div>`;
            } else if (op.personasNombres && op.personasNombres.length > 0) {
                personasInfo = `<div class="mt-1"><small><i class="fas fa-users me-1"></i>Asignada a: ${op.personasNombres.join(', ')}</small></div>`;
            }

            html += `
                <div class="operacion-card ${operacionClass}" data-id="${op.id}">
                    <div class="operacion-header">
                        <div class="operacion-fecha">${fechaFormateada}</div>
                        <div class="operacion-tipo">
                            <span class="badge ${badgeClass}">${op.tipo}</span>
                            <span class="badge bg-primary ms-2">${op.lugar}</span>
                        </div>
                    </div>
                    <div class="operacion-content">
                        ${op.descripcion || 'Sin descripción'}
                        ${personasInfo}
                    </div>
                    <div class="operacion-actions">
                        <button class="btn btn-sm btn-outline-info btn-ver-operacion" data-id="${op.id}">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-primary btn-editar-operacion" data-id="${op.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-eliminar-operacion" data-id="${op.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Asignar eventos a los botones
        this.setupBotonesOperaciones();
    },

    // Configurar botones de operaciones
    setupBotonesOperaciones() {
        // Botones Ver
        document.querySelectorAll('.btn-ver-operacion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.verOperacion(id);
            });
        });

        // Botones Editar
        document.querySelectorAll('.btn-editar-operacion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.editarOperacion(id);
            });
        });

        // Botones Eliminar
        document.querySelectorAll('.btn-eliminar-operacion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.eliminarOperacion(id);
            });
        });
    },

    // Función para ver detalles de una operación
    verOperacion(id) {
        const operacion = DB.getById('operaciones', id);
        if (!operacion) {
            UI.mostrarNotificacion('Error: Operación no encontrada', 'error');
            return;
        }

        const fechaFormateada = new Date(operacion.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Obtener la información de las personas
        let personasHTML = '<p class="text-muted"><i class="fas fa-info-circle me-2"></i>No hay personal asignado</p>';
        if (operacion.personasInfo) {
            personasHTML = `
                <ul class="list-group">
                    ${operacion.personasInfo.split(',').map(persona => `
                        <li class="list-group-item">
                            <i class="fas fa-user me-2"></i>${persona.trim()}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (operacion.personasNombres && operacion.personasNombres.length > 0) {
            personasHTML = `
                <ul class="list-group">
                    ${operacion.personasNombres.map(persona => `
                        <li class="list-group-item">
                            <i class="fas fa-user me-2"></i>${persona}
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modalVerOperacion';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles de la Operación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>Tipo:</strong> 
                                    <span class="badge ${operacion.tipo === 'Descarga' ? 'bg-success' : 'bg-warning'}">
                                        ${operacion.tipo}
                                    </span>
                                </p>
                                <p><strong>Cliente:</strong> ${operacion.lugar}</p>
                                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                                <p><strong>Estado:</strong> 
                                    <span class="badge ${operacion.estado === 'completado' ? 'bg-success' : 'bg-primary'}">
                                        ${operacion.estado || 'pendiente'}
                                    </span>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-users me-2"></i>Personal Asignado</h6>
                                ${personasHTML}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <h6><i class="fas fa-align-left me-2"></i>Descripción</h6>
                                <p>${operacion.descripcion || 'Sin descripción'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    },

    // Abrir modal para editar operación
    editarOperacion(id) {
        // Buscar operación por ID
        const operacion = DB.getById('operaciones', id);
        
        if (!operacion) {
            UI.mostrarNotificacion('Operación no encontrada', 'error');
            return;
        }
        
        // Guardar operación que se está editando
        this.state.operacionEditando = operacion;
        
        // Llenar el formulario de edición
        const fechaObj = new Date(operacion.fecha);
        const fecha = fechaObj.toISOString().split('T')[0];
        const hora = fechaObj.toTimeString().slice(0,5);
        
        document.getElementById('idOperacionEditar').value = operacion.id;
        document.getElementById('tipoOperacionEditar').value = operacion.tipo;
        document.getElementById('fechaOperacionEditar').value = fecha;
        document.getElementById('horaOperacionEditar').value = hora;
        document.getElementById('lugarOperacionEditar').value = operacion.lugar;
        document.getElementById('descripcionOperacionEditar').value = operacion.descripcion;
        
        // Seleccionar las personas asignadas
        const selectorPersonas = document.getElementById('personasOperacionEditar');
        if (operacion.personaIds && Array.isArray(operacion.personaIds)) {
            // Deseleccionar todas las opciones primero
            Array.from(selectorPersonas.options).forEach(option => {
                option.selected = false;
            });
            
            // Seleccionar las opciones correspondientes a personaIds
            operacion.personaIds.forEach(personaId => {
                if (personaId) {
                    const option = Array.from(selectorPersonas.options).find(opt => opt.value === personaId);
                    if (option) {
                        option.selected = true;
                    }
                }
            });
        }
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editarOperacionModal'));
        modal.show();
    },

    // Guardar cambios en la operación editada
    guardarEdicionOperacion() {
        const id = document.getElementById('idOperacionEditar').value;
        const tipo = document.getElementById('tipoOperacionEditar').value;
        const fecha = document.getElementById('fechaOperacionEditar').value;
        const hora = document.getElementById('horaOperacionEditar').value;
        const lugar = document.getElementById('lugarOperacionEditar').value;
        const descripcion = document.getElementById('descripcionOperacionEditar').value;
        const personaIds = Array.from(document.getElementById('personasOperacionEditar').selectedOptions, option => option.value);
        
        if (!tipo || !fecha || !hora || !lugar || !descripcion) {
            UI.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Obtener información de las personas asignadas si existen
        let personasNombres = [];
        if (personaIds.length > 0) {
            personaIds.forEach(id => {
                if (id) {
                    const personaObj = DB.getById('personal', id);
                    if (personaObj) {
                        personasNombres.push(personaObj.nombre);
                    }
                }
            });
        }
        
        const fechaObj = new Date(`${fecha}T${hora}:00`);
        
        const actualizaciones = {
            tipo,
            fecha: fechaObj.toISOString(),
            lugar,
            descripcion,
            personaIds: personaIds.filter(id => id),
            personasNombres: personasNombres,
            editada: new Date().toISOString()
        };
        
        // Actualizar operación
        const resultado = DB.update('operaciones', id, actualizaciones);
        
        if (resultado) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarOperacionModal'));
            modal.hide();
            
            // Limpiar referencia
            this.state.operacionEditando = null;
            
            // Actualizar vista
            this.mostrarOperaciones();
            
            // Notificar éxito
            UI.mostrarNotificacion('Éxito', 'Operación actualizada correctamente', 'success');
            
            // Disparar eventos específicos
            document.dispatchEvent(new CustomEvent('operacionActualizada', { 
                detail: { operacion: resultado } 
            }));
            document.dispatchEvent(new CustomEvent('datosActualizados', { 
                detail: { tipo: 'operaciones' } 
            }));
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo actualizar la operación', 'error');
        }
    },

    // Confirmar eliminación de operación
    confirmarEliminarOperacion(id) {
        if (!id) {
            UI.mostrarNotificacion('Error', 'ID de operación no válido', 'error');
            return;
        }

        UI.confirmar({
            title: 'Eliminar operación',
            message: '¿Está seguro de eliminar esta operación? Esta acción no se puede deshacer.',
            type: 'warning',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }).then(confirmed => {
            if (confirmed) {
                this.eliminarOperacion(id);
            }
        });
    },

    // Eliminar operación
    eliminarOperacion(id) {
        console.log('Intentando eliminar operación con ID:', id);
        
        if (!id) {
            UI.mostrarNotificacion('Error', 'ID de operación no válido', 'error');
            return;
        }
        
        // Obtener la operación para verificar que existe
        const operacion = DB.getById('operaciones', id);
        if (!operacion) {
            UI.mostrarNotificacion('Error', 'No se encontró la operación a eliminar', 'error');
            return;
        }
        
        try {
            const resultado = DB.delete('operaciones', id);
            
            if (resultado) {
                // Actualizar vista
                this.mostrarOperaciones();
                
                // Notificar éxito
                UI.mostrarNotificacion('Éxito', 'Operación eliminada correctamente', 'success');
                
                // Disparar eventos específicos
                document.dispatchEvent(new CustomEvent('operacionEliminada', { 
                    detail: { id: id } 
                }));
                document.dispatchEvent(new CustomEvent('datosActualizados', { 
                    detail: { tipo: 'operaciones' } 
                }));
            } else {
                throw new Error('No se pudo eliminar la operación');
            }
        } catch (error) {
            console.error('Error al eliminar operación:', error);
            UI.mostrarNotificacion('Error', 'No se pudo eliminar la operación: ' + error.message, 'error');
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Operaciones.init();
    
    document.body.addEventListener('click', async (e) => {
        if (e.target.matches('.btn-iniciar')) {
            const operacionId = e.target.dataset.id;
            await iniciarOperacion(operacionId);
        } else if (e.target.matches('.btn-completar')) {
            const operacionId = e.target.dataset.id;
            await completarOperacion(operacionId);
        } else if (e.target.matches('.btn-finalizar')) {
            const id = e.target.dataset.id;
            const tipo = e.target.dataset.tipo || 'operacion';
            if (id) {
                window.app.finalizarActividad(id, tipo);
            }
        }
    });
    
    actualizarVistaOperaciones();
});

async function iniciarOperacion(id) {
    try {
        const operacion = await DB.get('operaciones', id);
        if (operacion) {
            operacion.estado = 'en_proceso';
            operacion.fechaInicio = new Date().toISOString();
            await DB.update('operaciones', id, operacion);
            mostrarNotificacion('Operación iniciada correctamente', 'success');
            await actualizarVistaOperaciones();
        }
    } catch (error) {
        console.error('Error al iniciar operación:', error);
        mostrarNotificacion('Error al iniciar la operación', 'error');
    }
}

async function completarOperacion(id) {
    try {
        const operacion = await DB.get('operaciones', id);
        if (operacion) {
            operacion.estado = 'completado';
            operacion.completadoEn = new Date().toISOString();
            await DB.update('operaciones', id, operacion);
            UI.mostrarNotificacion('Operación completada correctamente', 'success');
            // Actualizar el dashboard inmediatamente
            window.app.actualizarDashboard();
        }
    } catch (error) {
        console.error('Error al completar operación:', error);
        UI.mostrarNotificacion('Error al completar la operación', 'error');
    }
}

async function actualizarVistaOperaciones() {
    if (Operaciones && typeof Operaciones.mostrarOperaciones === 'function') {
        await Operaciones.mostrarOperaciones();
    }
} 