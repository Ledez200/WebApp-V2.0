loadTemplate() {
    const template = `
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Nueva Tarea</h5>
                            <form id="formNuevaTarea">
                                <div class="mb-3">
                                    <label for="fechaTarea" class="form-label">Fecha</label>
                                    <input type="date" class="form-control" id="fechaTarea" required>
                                </div>
                                <div class="mb-3">
                                    <label for="horaTarea" class="form-label">Hora</label>
                                    <input type="time" class="form-control" id="horaTarea" required>
                                </div>
                                <div class="mb-3">
                                    <label for="tipoTarea" class="form-label">Tipo de Tarea</label>
                                    <select class="form-select" id="tipoTarea" required>
                                        <option value="">Seleccione un tipo</option>
                                        <option value="Descarga">Descarga</option>
                                        <option value="Clasificación">Clasificación</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="personaTarea" class="form-label">Persona Asignada</label>
                                    <select class="form-select" id="personaTarea" required>
                                        <option value="">Seleccione una persona</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="contenidoTarea" class="form-label">Contenido</label>
                                    <textarea class="form-control" id="contenidoTarea" rows="4" required></textarea>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">Guardar Tarea</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <ul class="nav nav-tabs mb-3" id="tareasTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="activos-tab" data-bs-toggle="tab" data-bs-target="#activos" type="button" role="tab" aria-controls="activos" aria-selected="true">
                                        <i class="fas fa-tasks me-1"></i>Activos
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="archivo-tab" data-bs-toggle="tab" data-bs-target="#archivo" type="button" role="tab" aria-controls="archivo" aria-selected="false">
                                        <i class="fas fa-archive me-1"></i>Archivo
                                    </button>
                                </li>
                            </ul>
                            
                            <div class="tab-content" id="tareasTabsContent">
                                <div class="tab-pane fade show active" id="activos" role="tabpanel" aria-labelledby="activos-tab">
                                    <div class="row mb-3 filtros-container">
                                        <div class="col-md-3">
                                            <label for="filtroFecha" class="form-label">Filtrar por fecha</label>
                                            <input type="date" class="form-control" id="filtroFecha">
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroTipo" class="form-label">Filtrar por tipo</label>
                                            <select class="form-select" id="filtroTipo">
                                                <option value="">Todos los tipos</option>
                                                <option value="Descarga">Descarga</option>
                                                <option value="Clasificación">Clasificación</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroPersona" class="form-label">Filtrar por persona</label>
                                            <select class="form-select" id="filtroPersona">
                                                <option value="">Todas las personas</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroBusqueda" class="form-label">Buscar</label>
                                            <div class="input-group">
                                                <input type="text" class="form-control" id="filtroBusqueda" placeholder="Buscar...">
                                                <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="listaTareasActivas" class="tareas-container">
                                        <!-- Las tareas activas se cargarán dinámicamente -->
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="archivo" role="tabpanel" aria-labelledby="archivo-tab">
                                    <div class="row mb-3 filtros-container">
                                        <div class="col-md-3">
                                            <label for="filtroFechaArchivo" class="form-label">Filtrar por fecha</label>
                                            <input type="date" class="form-control" id="filtroFechaArchivo">
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroTipoArchivo" class="form-label">Filtrar por tipo</label>
                                            <select class="form-select" id="filtroTipoArchivo">
                                                <option value="">Todos los tipos</option>
                                                <option value="Descarga">Descarga</option>
                                                <option value="Clasificación">Clasificación</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroPersonaArchivo" class="form-label">Filtrar por persona</label>
                                            <select class="form-select" id="filtroPersonaArchivo">
                                                <option value="">Todas las personas</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label for="filtroBusquedaArchivo" class="form-label">Buscar</label>
                                            <div class="input-group">
                                                <input type="text" class="form-control" id="filtroBusquedaArchivo" placeholder="Buscar...">
                                                <button class="btn btn-outline-secondary" type="button" id="btnBuscarArchivo">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="listaTareasArchivo" class="tareas-container">
                                        <!-- Las tareas archivadas se cargarán dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    UI.cargarContenido('descarga-clasificacion', template);
    this.setupEventos();
    this.cargarPersonasEnSelectores();
    this.mostrarTareas();
},

// Mostrar tareas en la interfaz
mostrarTareas() {
    const containerActivas = document.getElementById('listaTareasActivas');
    const containerArchivo = document.getElementById('listaTareasArchivo');
    if (!containerActivas || !containerArchivo) {
        console.error('No se encontraron los contenedores de tareas');
        return;
    }
    const tareas = this.getTareasFiltradas();
    // Solo tareas NO finalizadas en Activos
    const tareasActivas = tareas.filter(tarea => tarea.estado !== 'finalizado' && tarea.estado !== 'completado');
    // Solo tareas finalizadas en Archivo
    const tareasArchivadas = tareas.filter(tarea => tarea.estado === 'finalizado' || tarea.estado === 'completado');
    // Mostrar tareas activas
    if (tareasActivas.length === 0) {
        containerActivas.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No hay tareas activas que coincidan con los filtros
            </div>
        `;
    } else {
        containerActivas.innerHTML = this.generarHTMLTareas(tareasActivas, false);
    }
    // Mostrar tareas archivadas
    if (tareasArchivadas.length === 0) {
        containerArchivo.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No hay tareas archivadas que coincidan con los filtros
            </div>
        `;
    } else {
        containerArchivo.innerHTML = this.generarHTMLTareas(tareasArchivadas, true);
    }
    this.setupBotonesTareas();
},

// Generar HTML para las tareas
generarHTMLTareas(tareas, esArchivo = false) {
    let html = '';
    tareas.forEach(tarea => {
        const fechaObj = new Date(tarea.fecha);
        const fecha = fechaObj.toLocaleDateString('es-ES');
        const hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const colorClase = this.getColorClaseTipo(tarea.tipo);
        const icono = this.getIconoTipo(tarea.tipo);
        const estadoBadge = (tarea.estado === 'finalizado' || tarea.estado === 'completado')
            ? '<span class="badge bg-success me-2"><i class="fas fa-check me-1"></i>Finalizado</span>'
            : '<span class="badge bg-warning me-2"><i class="fas fa-clock me-1"></i>Pendiente</span>';
        if (esArchivo) {
            // Versión compacta para el archivo
            html += `
                <div class="tarea-item ${colorClase} mb-1" data-id="${tarea.id}">
                    <div class="card">
                        <div class="card-body p-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center flex-grow-1">
                                    <span class="badge ${this.getBadgeClaseTipo(tarea.tipo)} me-1" style="font-size: 0.7em;">
                                        <i class="fas ${icono}"></i>${tarea.tipo}
                                    </span>
                                    <small class="text-muted me-1" style="font-size: 0.7em;">
                                        ${fecha} ${hora}
                                    </small>
                                    <small class="text-muted text-truncate" style="font-size: 0.7em;">
                                        ${tarea.contenido}
                                    </small>
                                </div>
                                <div class="tarea-actions ms-1">
                                    <button class="btn btn-xs btn-outline-primary btn-editar-tarea me-1" data-id="${tarea.id}" title="Editar tarea" style="padding: 0.1rem 0.3rem; font-size: 0.7em;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Versión normal para tareas activas
            html += `
                <div class="tarea-item ${colorClase} mb-3" data-id="${tarea.id}">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div class="tarea-meta">
                                <span class="badge ${this.getBadgeClaseTipo(tarea.tipo)} me-2">
                                    <i class="fas ${icono} me-1"></i>${tarea.tipo}
                                </span>
                                ${estadoBadge}
                                <span class="text-muted">
                                    <i class="far fa-calendar-alt me-1"></i>${fecha}
                                    <i class="far fa-clock ms-2 me-1"></i>${hora}
                                </span>
                            </div>
                            <div class="tarea-actions">
                                <button class="btn btn-sm btn-outline-primary btn-editar-tarea me-1" data-id="${tarea.id}" title="Editar tarea">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger btn-eliminar-tarea me-1" data-id="${tarea.id}" title="Eliminar tarea">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success btn-finalizar-tarea" data-id="${tarea.id}" title="Marcar como finalizada">
                                    <i class="fas fa-check"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="tarea-contenido mb-2">${tarea.contenido}</div>
                            <div class="tarea-persona mt-2">
                                <span class="badge bg-info">
                                    <i class="fas fa-user me-1"></i>${tarea.personaNombre}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    return html;
},

// En setupBotonesTareas, agrego el evento para el botón finalizar:
setupBotonesTareas() {
    document.querySelectorAll('.btn-finalizar-tarea').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            this.finalizarTarea(id);
        });
    });
},

// Agrego la función finalizarTarea:
finalizarTarea(id) {
    const tarea = DB.getById('tareas', id);
    if (!tarea) {
        UI.mostrarNotificacion('Tarea no encontrada', 'error');
        return;
    }
    tarea.estado = 'completado';
    tarea.fechaCompletado = new Date().toISOString();
    DB.update('tareas', id, tarea);
    UI.mostrarNotificacion('Tarea finalizada correctamente', 'success');
    this.mostrarTareas();
},

// ... existing code ...
