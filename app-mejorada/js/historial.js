/**
 * Módulo de Historial General
 */

const Historial = {
    // Estado del módulo
    state: {
        filtros: {
            fechaDesde: '',
            fechaHasta: '',
            area: '',
            busqueda: '',
            persona: ''
        }
    },

    // Inicializar módulo
    init() {
        this.loadTemplate();
    },

    // Cargar plantilla HTML
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title mb-4">Historial General de Actividades</h5>
                        
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <label for="filtroFechaDesde" class="form-label">Fecha Desde</label>
                                <input type="date" class="form-control" id="filtroFechaDesde">
                            </div>
                            <div class="col-md-3">
                                <label for="filtroFechaHasta" class="form-label">Fecha Hasta</label>
                                <input type="date" class="form-control" id="filtroFechaHasta">
                            </div>
                            <div class="col-md-3">
                                <label for="filtroArea" class="form-label">Área</label>
                                <select class="form-select" id="filtroArea">
                                    <option value="">Todas las áreas</option>
                                    <option value="Túnel">Túnel</option>
                                    <option value="Empaquetado">Empaquetado</option>
                                    <option value="Glaseo">Glaseo</option>
                                    <option value="Echar y tratar">Echar y tratar</option>
                                    <option value="Corte">Corte</option>
                                    <option value="Carretillo">Carretillo</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="filtroPersona" class="form-label">Persona</label>
                                <select class="form-select" id="filtroPersona">
                                    <option value="">Todas las personas</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <input type="text" class="form-control" id="filtroBusqueda" placeholder="Buscar en el historial...">
                                    <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                                        <i class="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6 text-end">
                                <button class="btn btn-outline-primary me-2" id="btnExportarExcel">
                                    <i class="fas fa-file-excel me-1"></i>Exportar a Excel
                                </button>
                                <button class="btn btn-outline-secondary" id="btnLimpiarFiltros">
                                    <i class="fas fa-broom me-1"></i>Limpiar Filtros
                                </button>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Área</th>
                                        <th>Contenido</th>
                                        <th>Personas</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="historialTableBody">
                                    <!-- El contenido se cargará dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('historial', template);
        this.setupEventos();
        this.cargarPersonasEnSelector();
        this.mostrarHistorial();
    },

    // Configurar eventos
    setupEventos() {
        // Filtros
        document.getElementById('filtroFechaDesde').addEventListener('change', () => {
            this.state.filtros.fechaDesde = document.getElementById('filtroFechaDesde').value;
            this.mostrarHistorial();
        });

        document.getElementById('filtroFechaHasta').addEventListener('change', () => {
            this.state.filtros.fechaHasta = document.getElementById('filtroFechaHasta').value;
            this.mostrarHistorial();
        });

        document.getElementById('filtroArea').addEventListener('change', () => {
            this.state.filtros.area = document.getElementById('filtroArea').value;
            this.mostrarHistorial();
        });

        document.getElementById('filtroPersona').addEventListener('change', () => {
            this.state.filtros.persona = document.getElementById('filtroPersona').value;
            this.mostrarHistorial();
        });

        document.getElementById('filtroBusqueda').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.state.filtros.busqueda = document.getElementById('filtroBusqueda').value;
                this.mostrarHistorial();
            }
        });

        document.getElementById('btnBuscar').addEventListener('click', () => {
            this.state.filtros.busqueda = document.getElementById('filtroBusqueda').value;
            this.mostrarHistorial();
        });

        // Botones
        document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
            this.limpiarFiltros();
        });

        document.getElementById('btnExportarExcel').addEventListener('click', () => {
            this.exportarAExcel();
        });

        // Escuchar evento de nota finalizada
        document.addEventListener('notaFinalizada', (event) => {
            // Si estamos en la sección de historial, actualizar la vista
            if (document.getElementById('historial').classList.contains('active')) {
                this.mostrarHistorial();
            }
        });
    },

    // Cargar personas en el selector
    cargarPersonasEnSelector() {
        const personal = DB.getAll('personal');
        const selector = document.getElementById('filtroPersona');
        
        personal.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.id;
            option.textContent = persona.nombre;
            selector.appendChild(option);
        });
    },

    // Limpiar filtros
    limpiarFiltros() {
        this.state.filtros = {
            fechaDesde: '',
            fechaHasta: '',
            area: '',
            busqueda: '',
            persona: ''
        };

        document.getElementById('filtroFechaDesde').value = '';
        document.getElementById('filtroFechaHasta').value = '';
        document.getElementById('filtroArea').value = '';
        document.getElementById('filtroPersona').value = '';
        document.getElementById('filtroBusqueda').value = '';

        this.mostrarHistorial();
    },

    // Obtener historial filtrado
    getHistorialFiltrado() {
        let notas = DB.getAll('notas');
        
        // Aplicar filtros
        if (this.state.filtros.fechaDesde) {
            const fechaDesde = new Date(this.state.filtros.fechaDesde).setHours(0, 0, 0, 0);
            notas = notas.filter(nota => {
                const fechaNota = new Date(nota.fecha).setHours(0, 0, 0, 0);
                return fechaNota >= fechaDesde;
            });
        }
        
        if (this.state.filtros.fechaHasta) {
            const fechaHasta = new Date(this.state.filtros.fechaHasta).setHours(23, 59, 59, 999);
            notas = notas.filter(nota => {
                const fechaNota = new Date(nota.fecha).getTime();
                return fechaNota <= fechaHasta;
            });
        }
        
        if (this.state.filtros.area) {
            notas = notas.filter(nota => nota.area === this.state.filtros.area);
        }
        
        if (this.state.filtros.persona) {
            notas = notas.filter(nota => 
                nota.personaIds && 
                Array.isArray(nota.personaIds) && 
                nota.personaIds.includes(this.state.filtros.persona)
            );
        }
        
        if (this.state.filtros.busqueda) {
            const busqueda = this.state.filtros.busqueda.toLowerCase();
            notas = notas.filter(nota => 
                nota.contenido.toLowerCase().includes(busqueda) || 
                nota.area.toLowerCase().includes(busqueda) ||
                (nota.personasNombres && nota.personasNombres.some(nombre => 
                    nombre.toLowerCase().includes(busqueda)
                ))
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        return notas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    // Mostrar historial
    mostrarHistorial() {
        const tbody = document.getElementById('historialTableBody');
        const notas = this.getHistorialFiltrado();
        
        if (notas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay registros que coincidan con los filtros</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        notas.forEach(nota => {
            const fecha = new Date(nota.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES');
            const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            const tr = document.createElement('tr');
            tr.className = nota.estado === 'finalizado' ? 'table-success' : '';
            tr.innerHTML = `
                <td>${fechaFormateada} ${horaFormateada}</td>
                <td><span class="badge ${this.getBadgeClaseArea(nota.area)}">${nota.area}</span></td>
                <td>${nota.contenido}</td>
                <td>${nota.personasNombres ? nota.personasNombres.join(', ') : ''}</td>
                <td>
                    <span class="badge ${nota.estado === 'finalizado' ? 'bg-success' : 'bg-warning'}">
                        ${nota.estado === 'finalizado' ? 'Finalizado' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-ver-detalle" data-id="${nota.id}" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Configurar eventos en los botones
        this.setupBotonesAcciones();
    },

    // Configurar botones de acciones
    setupBotonesAcciones() {
        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.verDetalleNota(id);
            });
        });
    },

    // Ver detalle de nota
    verDetalleNota(id) {
        const nota = DB.getById('notas', id);
        if (!nota) {
            UI.mostrarNotificacion('Nota no encontrada', 'error');
            return;
        }

        const fecha = new Date(nota.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const modal = new bootstrap.Modal(document.getElementById('verDetalleModal'));
        const modalBody = document.querySelector('#verDetalleModal .modal-body');
        
        modalBody.innerHTML = `
            <div class="mb-3">
                <strong>Fecha y Hora:</strong> ${fechaFormateada} ${horaFormateada}
            </div>
            <div class="mb-3">
                <strong>Área:</strong> <span class="badge ${this.getBadgeClaseArea(nota.area)}">${nota.area}</span>
            </div>
            <div class="mb-3">
                <strong>Estado:</strong> 
                <span class="badge ${nota.estado === 'finalizado' ? 'bg-success' : 'bg-warning'}">
                    ${nota.estado === 'finalizado' ? 'Finalizado' : 'Pendiente'}
                </span>
            </div>
            <div class="mb-3">
                <strong>Personas Asignadas:</strong>
                <div class="mt-1">
                    ${nota.personasNombres ? nota.personasNombres.map(nombre => 
                        `<span class="badge bg-success me-1">${nombre}</span>`
                    ).join('') : 'Ninguna'}
                </div>
            </div>
            <div class="mb-3">
                <strong>Contenido:</strong>
                <div class="mt-1 p-2 bg-light rounded">
                    ${nota.contenido}
                </div>
            </div>
            ${nota.fechaFinalizacion ? `
                <div class="mb-3">
                    <strong>Fecha de Finalización:</strong>
                    ${new Date(nota.fechaFinalizacion).toLocaleString('es-ES')}
                </div>
            ` : ''}
        `;

        modal.show();
    },

    // Obtener clase de badge según el área
    getBadgeClaseArea(area) {
        const clases = {
            'Túnel': 'bg-primary',
            'Empaquetado': 'bg-success',
            'Glaseo': 'bg-info',
            'Echar y tratar': 'bg-warning',
            'Corte': 'bg-danger',
            'Carretillo': 'bg-secondary',
            'General': 'bg-dark'
        };
        
        return clases[area] || 'bg-dark';
    },

    // Exportar a Excel
    exportarAExcel() {
        const notas = this.getHistorialFiltrado();
        
        if (notas.length === 0) {
            UI.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws_data = notas.map(nota => ({
            'Fecha': new Date(nota.fecha).toLocaleString('es-ES'),
            'Área': nota.area,
            'Contenido': nota.contenido,
            'Personas': nota.personasNombres ? nota.personasNombres.join(', ') : '',
            'Estado': nota.estado === 'finalizado' ? 'Finalizado' : 'Pendiente',
            'Fecha Finalización': nota.fechaFinalizacion ? new Date(nota.fechaFinalizacion).toLocaleString('es-ES') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'Historial');

        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `historial_${fecha}.xlsx`);
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Historial.init();
}); 