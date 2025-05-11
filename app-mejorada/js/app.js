/**
 * Archivo principal de la aplicación
 * Contiene funciones para cargar datos iniciales y actualizar el dashboard
 */

// Definir la aplicación en el ámbito global
window.app = {
    // Estado de la aplicación
    state: {
        datosInicializados: false,
        chartSemanal: null
    },

    // Inicializar la aplicación
    init() {
        console.log('Iniciando aplicación...');
        
        // Verificar que DB esté disponible
        if (!window.DB) {
            console.warn('DB no está disponible, esperando 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Primero configurar la navegación
        this.setupNavigation();
        
        // Luego cargar los datos
        this.cargarDatos();
        
        // Configurar la actualización automática
        this.configurarActualizacionAutomatica();
        
        // Inicializar funcionalidades de exportación e importación
        this.initDataExportImport();
        
        // Inicializar módulo de informes
        if (window.Informes) {
            console.log('Inicializando módulo de informes...');
            Informes.init();
        } else {
            console.warn('Módulo de informes no está disponible');
        }
        
        // Finalmente actualizar el dashboard
        // Usar setTimeout para asegurar que el DOM esté completamente cargado
        setTimeout(() => {
            this.actualizarDashboard();
        }, 100);
    },
    
    // Configurar navegación
    setupNavigation() {
        // Añadir manejadores de eventos a los enlaces del sidebar si no se han configurado
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Quitar clase active de todos los enlaces
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Añadir clase active al enlace clicado
                link.classList.add('active');
                
                // Obtener el id de la sección
                const sectionId = link.getAttribute('data-section');
                
                // Cambiar título de la sección
                document.getElementById('sectionTitle').textContent = this.getSectionTitle(sectionId);
                
                // Ocultar todas las secciones
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Mostrar la sección seleccionada
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Notificar cambio de sección
                document.dispatchEvent(new CustomEvent('sectionChanged', { 
                    detail: { section: sectionId } 
                }));
                
                // En móvil, cerrar sidebar y overlay
                this.closeMobileMenu();
            });
        });
        
        // Configurar botón de toggle del sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Configurar overlay para cerrar el sidebar en móvil
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
    },
    
    // Abrir/cerrar menú móvil
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        // Evitar scroll en el body cuando el menú está abierto
        if (sidebar && sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    },
    
    // Cerrar menú móvil
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Restaurar scroll
        document.body.style.overflow = '';
    },
    
    // Obtener título de la sección
    getSectionTitle(sectionId) {
        const titles = {
            'dashboard': 'Dashboard',
            'notas': 'Notas y Programación',
            'personal': 'Gestión de Personal',
            'operaciones': 'Descarga y clasificación',
            'elaboracion': 'Elaboración',
            'inventario': 'Inventario',
            'nomina': 'Nómina',
            'reportes': 'Reportes',
            'configuracion': 'Configuración'
        };
        
        return titles[sectionId] || 'Dashboard';
    },
    
    // Cargar datos iniciales si no existen
    cargarDatos() {
        console.log('Verificando datos iniciales...');
        
        // Verificar si hay datos
        const operaciones = DB.getAll('operaciones');
        const notas = DB.getAll('notas');
        
        console.log('Verificación de datos completada');
    },
    
    // Actualizar todas las secciones del dashboard
    async actualizarDashboard() {
        try {
            console.log('Iniciando actualización del dashboard...');
            
            // Actualizar fecha actual
            await this.actualizarFechaActual();
            console.log('Fecha actual actualizada');
            
            // Actualizar actividades de hoy
            await this.actualizarActividadesHoy();
            console.log('Actividades de hoy actualizadas');
            
            // Actualizar próximas actividades
            await this.actualizarProximasActividades();
            console.log('Próximas actividades actualizadas');
            
            // Actualizar operaciones recientes
            await this.actualizarOperacionesRecientes();
            console.log('Operaciones recientes actualizadas');
            
            // Actualizar estadísticas semanales
            await this.actualizarEstadisticasSemanales();
            console.log('Estadísticas semanales actualizadas');
            
            // Actualizar gráficos
            await this.actualizarGraficos();
            console.log('Gráficos actualizados');
            
            // Actualizar operaciones del dashboard
            await this.actualizarOperacionesDashboard();
            console.log('Operaciones del dashboard actualizadas');
            
            // Actualizar notas del dashboard
            await this.actualizarNotasDashboard();
            console.log('Notas del dashboard actualizadas');
            
            console.log('Dashboard actualizado completamente');
        } catch (error) {
            console.error('Error al actualizar el dashboard:', error);
            UI.mostrarNotificacion('Error al actualizar el dashboard', 'error');
        }
    },

    async actualizarElaboracionesTerminadas() {
        try {
            const container = document.getElementById('actividadesCompletadas');
            if (!container) {
                console.error('No se encontró el contenedor de actividades completadas');
                return;
            }

            const elaboraciones = await DB.getAll('elaboraciones');
            const elaboracionesCompletadas = elaboraciones
                .filter(e => e.estado === 'completado')
                .sort((a, b) => new Date(b.completadoEn) - new Date(a.completadoEn));

            if (elaboracionesCompletadas.length === 0) {
                container.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-check-circle"></i>
                        <p>No hay actividades completadas para mostrar</p>
                    </div>
                `;
                return;
            }

            let html = '';
            elaboracionesCompletadas.forEach(elaboracion => {
                const fechaCompletado = new Date(elaboracion.completadoEn).toLocaleDateString('es-ES');
                
                html += `
                    <div class="actividad-item completada mb-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                <h6 class="mb-1">${elaboracion.descripcion || 'Sin descripción'}</h6>
                                <p class="mb-1">
                                    <small>
                                        ${elaboracion.detalleCompletado || 'Detalles no disponibles'}<br>
                                        <strong>Completado el:</strong> ${fechaCompletado}
                                </small>
                                </p>
                            </div>
                            <span class="badge bg-success">Completada</span>
                            </div>
                        </div>
                    `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error('Error al actualizar elaboraciones terminadas:', error);
            UI.mostrarNotificacion('Error al cargar las elaboraciones terminadas', 'error');
        }
    },

    // Actualizar actividades de hoy en el dashboard
    async actualizarActividadesHoy() {
        console.log('Iniciando actualizarActividadesHoy...');
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyStr = hoy.toISOString().split('T')[0];
        
        // Obtener operaciones para hoy que no estén completadas
        const todasOperaciones = DB.getAll('operaciones');
        const operaciones = todasOperaciones.filter(op => 
            op.fecha === hoyStr && 
            (op.tipo === 'Descarga' || op.tipo === 'Clasificación') &&
            op.estado !== 'completado'
        );

        const operacionesContainer = document.getElementById('operacionesRecientes');
        
        if (!operacionesContainer) return;
            
            if (operaciones.length === 0) {
                operacionesContainer.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-truck-loading"></i>
                    <p>No hay operaciones pendientes para hoy</p>
                    </div>
                `;
            return;
        }

        const html = operaciones.map(operacion => {
            const estado = operacion.estado || 'pendiente';
            const botonesHtml = `
                <div class="acciones">
                    ${estado === 'pendiente' ? 
                        `<button class="btn btn-iniciar" data-id="${operacion.id}">Iniciar</button>` : 
                        estado === 'en_proceso' ? 
                        `<button class="btn btn-completar" data-id="${operacion.id}">Completar</button>` :
                        `<button class="btn btn-finalizar" data-id="${operacion.id}" data-tipo="operacion">Finalizar</button>`
                    }
                </div>`;
            
            return `
                <div class="actividad-item ${operacion.tipo.toLowerCase()}" id="actividad-${operacion.id}">
                    <h4>${operacion.nombre || operacion.tipo}</h4>
                    <p>${operacion.descripcion || ''}</p>
                    ${botonesHtml}
                </div>`;
        }).join('');
        
        operacionesContainer.innerHTML = html;
    },

    // Actualizar operaciones recientes en el dashboard
    async actualizarOperacionesRecientes() {
        // Obtener solo operaciones completadas de los últimos 30 días
        const operaciones = DB.getAll('operaciones')
            .filter(op => {
                const fechaOp = new Date(op.fecha);
                const hoy = new Date();
                const diff = Math.round((hoy - fechaOp) / (1000 * 60 * 60 * 24));
                return (op.tipo === 'Descarga' || op.tipo === 'Clasificación') && 
                       op.estado === 'completado' && 
                       diff <= 30;
            })
            .sort((a, b) => new Date(b.completadoEn || b.fecha) - new Date(a.completadoEn || a.fecha));
        
        const container = document.getElementById('operacionesRecientes');
        
        if (!container) return;
        
        if (operaciones.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-truck-loading"></i>
                    <p>No hay operaciones completadas recientemente</p>
                </div>
            `;
            return;
        }
        
        // Agrupar operaciones por cliente
        const clientesOperaciones = {
            'FRIGALSA': { nombre: 'FRIGALSA', operaciones: [], total: 0, ultimaFecha: null },
            'ISP': { nombre: 'ISP', operaciones: [], total: 0, ultimaFecha: null },
            'PAY-PAY': { nombre: 'PAY-PAY', operaciones: [], total: 0, ultimaFecha: null },
            'ATUNLO': { nombre: 'ATUNLO', operaciones: [], total: 0, ultimaFecha: null }
        };
        
        // Procesar operaciones
        operaciones.forEach(op => {
            if (clientesOperaciones[op.lugar]) {
                    clientesOperaciones[op.lugar].total++;
                        clientesOperaciones[op.lugar].operaciones.push(op);
                    
                    // Actualizar última fecha
                const fechaCompletado = op.completadoEn || op.fecha;
                    if (!clientesOperaciones[op.lugar].ultimaFecha || 
                    new Date(fechaCompletado) > new Date(clientesOperaciones[op.lugar].ultimaFecha)) {
                    clientesOperaciones[op.lugar].ultimaFecha = fechaCompletado;
                }
            }
        });
        
        // Ordenar clientes por operaciones recientes (descendente)
        const clientesOrdenados = Object.values(clientesOperaciones)
            .filter(c => c.total > 0)
            .sort((a, b) => new Date(b.ultimaFecha) - new Date(a.ultimaFecha));
        
        let html = `<div class="clientes-resumen">`;
        
        clientesOrdenados.forEach(cliente => {
            const ultimaFecha = new Date(cliente.ultimaFecha).toLocaleDateString('es-ES');
            
            html += `
                <div class="cliente-card">
                    <div class="cliente-header">
                        <h5 class="cliente-nombre">${cliente.nombre}</h5>
                        <span class="badge bg-primary">${cliente.total} operaciones completadas</span>
                    </div>
                    <div class="cliente-info">
                        <p>Última operación: ${ultimaFecha}</p>
                    </div>
                    <div class="cliente-detalles">
            `;
            
            // Mostrar todas las operaciones ordenadas por fecha (más recientes primero)
            cliente.operaciones
                .sort((a, b) => new Date(b.completadoEn || b.fecha) - new Date(a.completadoEn || a.fecha))
                .forEach(op => {
                    const fechaCompletado = new Date(op.completadoEn || op.fecha).toLocaleDateString('es-ES');
                    
                    // Obtener la información de las personas asignadas
                    let personasHTML = '';
                    if (op.personasInfo) {
                        personasHTML = `
                            <div class="personal-mini">
                                <i class="fas fa-users me-1"></i>
                                ${op.personasInfo.split(',').map(persona => 
                                    `<span class="badge bg-secondary me-1">${persona.trim()}</span>`
                                ).join('')}
                            </div>
                        `;
                    } else if (op.personasNombres && op.personasNombres.length > 0) {
                        personasHTML = `
                            <div class="personal-mini">
                                <i class="fas fa-users me-1"></i>
                                ${op.personasNombres.map(persona => 
                                    `<span class="badge bg-secondary me-1">${persona}</span>`
                                ).join('')}
                            </div>
                        `;
                    }
                
                html += `
                        <div class="operacion-mini mb-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1 me-3">
                                    <div class="d-flex align-items-center mb-2">
                                        <span class="badge ${op.tipo === 'Descarga' ? 'bg-success' : 'bg-warning'} me-2">${op.tipo}</span>
                                        <span class="fecha-mini">
                                            <i class="far fa-calendar-alt me-1"></i>${fechaCompletado}
                                        </span>
                                    </div>
                                    ${personasHTML}
                                </div>
                                <div class="text-end">
                                    <button class="btn btn-sm btn-outline-primary" 
                                            onclick="app.verDetallesOperacion('${op.id}')">
                                        <i class="fas fa-eye me-1"></i>Ver detalles
                                    </button>
                                </div>
                            </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
    },

    // Función para ver detalles de una operación
    verDetallesOperacion(id) {
        const operacion = DB.getById('operaciones', id);
        if (!operacion) {
            UI.mostrarNotificacion('Operación no encontrada', 'error');
            return;
        }
        
        // Crear ventana modal con los detalles
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modalDetallesOperacion';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        
        const fechaCompletado = new Date(operacion.completadoEn || operacion.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Obtener la información de las personas asignadas
        let personasHTML = '<p class="text-muted"><i class="fas fa-info-circle me-2"></i>No hay personal asignado</p>';
        
        if (operacion.personasInfo) {
            // Si existe personasInfo, usarlo
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
            // Si existe personasNombres, usarlo
            personasHTML = `
                <ul class="list-group">
                    ${operacion.personasNombres.map(persona => `
                        <li class="list-group-item">
                            <i class="fas fa-user me-2"></i>${persona}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (operacion.personaIds && operacion.personaIds.length > 0) {
            // Si existe personaIds, obtener los nombres de la base de datos
            const personas = operacion.personaIds
                .map(id => DB.getById('personal', id))
                .filter(p => p)
                .map(p => p.nombre);
            
            if (personas.length > 0) {
                personasHTML = `
                    <ul class="list-group">
                        ${personas.map(persona => `
                            <li class="list-group-item">
                                <i class="fas fa-user me-2"></i>${persona}
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        }

        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-info-circle me-2"></i>
                            Detalles de la Operación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Información General</h6>
                    </div>
                                    <div class="card-body">
                                        <p><strong><i class="fas fa-tasks me-2"></i>Tipo:</strong> 
                                            <span class="badge ${operacion.tipo === 'Descarga' ? 'bg-success' : 'bg-warning'}">
                                                ${operacion.tipo}
                                            </span>
                                        </p>
                                        <p><strong><i class="fas fa-building me-2"></i>Cliente:</strong> ${operacion.lugar}</p>
                                        <p><strong><i class="fas fa-calendar-alt me-2"></i>Fecha:</strong> ${fechaCompletado}</p>
                                        <p><strong><i class="fas fa-flag me-2"></i>Estado:</strong> 
                                            <span class="badge bg-success">Completado</span>
                                        </p>
                </div>
            </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Personal Asignado</h6>
                                    </div>
                                    <div class="card-body">
                                        ${personasHTML}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">Descripción y Notas</h6>
                                    </div>
                                    <div class="card-body">
                                        ${operacion.descripcion ? `
                                            <p class="mb-0"><i class="fas fa-align-left me-2"></i>${operacion.descripcion}</p>
                                        ` : '<p class="text-muted mb-0"><i class="fas fa-info-circle me-2"></i>No hay descripción disponible</p>'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                    </div>
                </div>
                </div>
            `;

        // Agregar el modal al documento
        document.body.appendChild(modal);

        // Inicializar y mostrar el modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Limpiar el modal cuando se cierre
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    },

    // Actualizar próximas actividades en el dashboard
    async actualizarProximasActividades() {
        const actividades = this.getProximasActividades(7);
        const container = document.getElementById('proximasActividades');
        const operacionesContainer = document.getElementById('proximasOperaciones');
        
        if (!container) return;
        
        // Limpiar contenedores
        container.innerHTML = '';
        if (operacionesContainer) {
            operacionesContainer.innerHTML = '';
        }
        
        // Obtener elaboraciones terminadas
        const elaboraciones = await DB.getAll('elaboraciones');
        const elaboracionesTerminadas = elaboraciones.filter(elab => elab.estado === 'completado')
            .sort((a, b) => new Date(b.completadoEn) - new Date(a.completadoEn))
            .slice(0, 5); // Mostrar solo las 5 más recientes
        
        // Separar actividades y operaciones
        const notas = actividades.filter(act => act.tipo === 'nota');
        const operaciones = actividades.filter(act => 
            act.tipo === 'operacion' && 
            act.estado !== 'completado'
        );
        
        // Mostrar elaboraciones terminadas
        if (elaboracionesTerminadas.length > 0) {
            const terminadasHTML = `
                <div class="card elaboraciones-terminadas mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-check-circle me-2"></i>
                            Elaboraciones Terminadas Recientemente
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${elaboracionesTerminadas.map(elab => `
                                <div class="col-md-6 mb-3">
                                    <div class="card elaboracion-card h-100">
                                        <div class="card-body">
                                            <h6 class="card-subtitle mb-2 text-success">
                                                <i class="fas fa-check-double me-2"></i>
                                                ${elab.nombre || 'Elaboración'}
                                            </h6>
                                            <p class="mb-1">
                                                <i class="fas fa-calendar-day me-2 text-primary"></i>
                                                <strong>Finalizado:</strong> ${new Date(elab.completadoEn).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <p class="mb-1">
                                                <i class="fas fa-truck me-2 text-info"></i>
                                                <strong>Proveedor:</strong> ${elab.proveedor || 'No especificado'}
                                            </p>
                                            <p class="mb-1">
                                                <i class="fas fa-weight me-2 text-danger"></i>
                                                <strong>Kg Elaborados:</strong> ${elab.kgElaborados || 0} Kg
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += terminadasHTML;
        }
        
        // Mostrar próximas actividades (notas)
        if (notas.length === 0) {
            container.innerHTML += `
                <div class="placeholder-message">
                    <i class="fas fa-calendar-week"></i>
                    <p>No hay actividades programadas para los próximos días</p>
                </div>
            `;
        } else {
            // Agrupar por fecha
            const porFecha = {};
            
            notas.forEach(actividad => {
                const fecha = new Date(actividad.fecha);
                const fechaStr = fecha.toLocaleDateString('es-ES', { dateStyle: 'full' });
                
                if (!porFecha[fechaStr]) {
                    porFecha[fechaStr] = [];
                }
                
                porFecha[fechaStr].push(actividad);
            });
            
            // Mostrar por fecha
            Object.keys(porFecha).forEach(fecha => {
                // Crear encabezado de fecha
                const headerHTML = `
                    <div class="fecha-header mb-3">
                        <i class="far fa-calendar-alt me-2"></i>
                        <span>${fecha}</span>
                    </div>
                `;
                
                container.innerHTML += headerHTML;
                
                // Mostrar actividades de esta fecha
                porFecha[fecha].forEach(actividad => {
                    const horaFormateada = new Date(actividad.fecha).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    // Obtener el área correcta desde la actividad
                    const areaTrabajo = actividad.area || 'General';
                    
                    // Asignar color según el área
                    let claseBadge = 'bg-primary';
                    switch (areaTrabajo.toLowerCase()) {
                        case 'túnel':
                        case 'tunel':
                            claseBadge = 'bg-info';
                            break;
                        case 'empaquetado':
                            claseBadge = 'bg-success';
                            break;
                        case 'glaseo':
                            claseBadge = 'bg-warning text-dark';
                            break;
                        case 'corte':
                            claseBadge = 'bg-danger';
                            break;
                        case 'echar y tratar':
                            claseBadge = 'bg-primary';
                            break;
                        default:
                            claseBadge = 'bg-secondary';
                    }
                    
                    const actividadHTML = `
                        <div class="actividad-item" id="actividad-${actividad.id}">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="badge ${claseBadge}">
                                    <i class="fas fa-sticky-note me-1"></i>
                                    ${areaTrabajo}
                                </span>
                                <small class="text-muted">
                                    <i class="far fa-clock me-1"></i>${horaFormateada}
                                </small>
                            </div>
                            <div class="actividad-contenido">
                                <p class="mb-1">${actividad.detalle}</p>
                            </div>
                            <div class="actividad-personas">
                                ${this.renderizarPersonasActividad(actividad.personasNombres)}
                            </div>
                        </div>
                    `;
                    
                    container.innerHTML += actividadHTML;
                });
            });
        }
        
        // Mostrar próximas operaciones si existe el contenedor
        if (operacionesContainer) {
            if (operaciones.length === 0) {
                operacionesContainer.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-truck-loading"></i>
                        <p>No hay operaciones programadas para los próximos días</p>
                    </div>
                `;
            } else {
                // Agrupar por fecha
                const porFecha = {};
                
                operaciones.forEach(operacion => {
                    const fecha = new Date(operacion.fecha);
                    const fechaStr = fecha.toLocaleDateString('es-ES', { dateStyle: 'full' });
                    
                    if (!porFecha[fechaStr]) {
                        porFecha[fechaStr] = [];
                    }
                    
                    porFecha[fechaStr].push(operacion);
                });
                
                // Mostrar por fecha
                Object.keys(porFecha).forEach(fecha => {
                    // Crear encabezado de fecha
                    const headerHTML = `
                        <div class="fecha-header mb-3">
                            <i class="far fa-calendar-alt me-2"></i>
                            <span>${fecha}</span>
                        </div>
                    `;
                    
                    operacionesContainer.innerHTML += headerHTML;
                    
                    // Mostrar operaciones de esta fecha
                    porFecha[fecha].forEach(operacion => {
                        const horaFormateada = new Date(operacion.fecha).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        
                        const tipoOperacion = operacion.tipoOperacion || 
                            (operacion.titulo ? operacion.titulo.split(':')[0] : 'Operación');
                        
                        const lugarOperacion = operacion.lugar || 
                            (operacion.titulo ? operacion.titulo.split(':')[1]?.trim() : '');
                        
                        const claseBadge = tipoOperacion.includes('Descarga') ? 'badge-descarga' : 'badge-clasificacion';

                        // Agregar botón de finalizar
                        let botonesHTML = `
                            <div class="acciones">
                                <button class="btn-finalizar" data-id="${operacion.id}" data-tipo="operacion" onclick="app.finalizarActividad('${operacion.id}', 'operacion')">Finalizar</button>
                            </div>
                        `;
                        
                        const operacionHTML = `
                            <div class="actividad-item operacion" id="operacion-${operacion.id}">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="badge ${claseBadge}">
                                        <i class="fas fa-truck-loading me-1"></i>
                                        ${tipoOperacion}
                                    </span>
                                    <small class="text-muted">
                                        <i class="far fa-clock me-1"></i>${horaFormateada}
                                    </small>
                                </div>
                                <div class="actividad-contenido">
                                    ${lugarOperacion ? `<p class="mb-1 fw-bold">${lugarOperacion}</p>` : ''}
                                    <p class="mb-1">${operacion.detalle || ''}</p>
                                </div>
                                <div class="actividad-personas">
                                    ${this.renderizarPersonasActividad(operacion.personasNombres)}
                                </div>
                                ${botonesHTML}
                            </div>
                        `;
                        
                        operacionesContainer.innerHTML += operacionHTML;
                    });
                });
            }
        }
    },

    // Función para finalizar una actividad
    finalizarActividad(id, tipo) {
        console.log(`Finalizando actividad ${tipo} con ID: ${id}`);
        
        let actividad;
        try {
            switch(tipo) {
                case 'nota':
                    actividad = DB.getById('notas', id);
                    break;
                case 'elaboracion':
                    actividad = DB.getById('elaboraciones', id);
                    break;
                case 'operacion':
                    actividad = DB.getById('operaciones', id);
                    break;
                default:
                    console.error('Tipo de actividad no válido:', tipo);
                    UI.mostrarNotificacion('Error: Tipo de actividad no válido', 'error');
                    return;
            }
            
            if (!actividad) {
                console.error('Actividad no encontrada');
                UI.mostrarNotificacion('Error: Actividad no encontrada', 'error');
                return;
            }

            // Preservar toda la información del personal
            const datosPersonal = {
                personasInfo: actividad.personasInfo,
                personasNombres: actividad.personasNombres,
                personaIds: actividad.personaIds,
                personas: actividad.personas
            };
            
            // Marcar como completada y agregar fecha
            actividad.estado = 'completado';
            actividad.fechaCompletado = new Date().toISOString();
            actividad.completadoEn = new Date().toISOString();
            
            // Restaurar toda la información del personal
            Object.assign(actividad, datosPersonal);
            
            // Actualizar en la base de datos
            try {
                switch(tipo) {
                    case 'nota':
                        DB.update('notas', id, actividad);
                        break;
                    case 'elaboracion':
                        DB.update('elaboraciones', id, actividad);
                        break;
                    case 'operacion':
                        DB.update('operaciones', id, actividad);
                        break;
                }
                
                // Remover visualmente la actividad
                const elemento = document.querySelector(`[data-id="${id}"]`);
                if (elemento) {
                    elemento.style.opacity = '0';
                    setTimeout(() => elemento.remove(), 300);
                }
                
                // Actualizar secciones relevantes
                if (tipo === 'elaboracion') {
                    this.actualizarProximasActividades();
                } else if (tipo === 'operacion') {
                    this.actualizarOperacionesRecientes();
                }
                
                UI.mostrarNotificacion('Actividad completada correctamente', 'success');
            } catch (error) {
                console.error('Error al finalizar actividad:', error);
                UI.mostrarNotificacion('Error al finalizar la actividad', 'error');
            }
        } catch (error) {
            console.error('Error al obtener la actividad:', error);
            UI.mostrarNotificacion('Error al obtener la actividad', 'error');
        }
    },

    // Actualizar gráfico de producción (descarga y clasificación)
    actualizarGraficosProduccion() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        
        // Filtrar operaciones por semana y mes
        const operaciones = DB.getAll('operaciones');
        const elaboraciones = DB.getAll('elaboraciones');
        
        // Preparar datos para gráficos
        const datosOperaciones = this.prepararDatosOperaciones(operaciones);
        const datosElaboraciones = this.prepararDatosElaboraciones(elaboraciones);
        
        // Actualizar gráfico de operaciones
        const canvasOperaciones = document.getElementById('chartOperaciones');
        if (canvasOperaciones) {
            if (this.state.chartOperaciones) {
                this.state.chartOperaciones.destroy();
            }
            
            this.state.chartOperaciones = new Chart(canvasOperaciones, {
            type: 'bar',
            data: {
                    labels: datosOperaciones.labels,
                datasets: [
                    {
                            label: 'Descargas',
                            data: datosOperaciones.descargas,
                        backgroundColor: 'rgba(52, 152, 219, 0.5)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1
                    },
                    {
                            label: 'Clasificaciones',
                            data: datosOperaciones.clasificaciones,
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: false
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Operaciones por Día'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Actualizar gráfico de elaboraciones
        const canvasElaboraciones = document.getElementById('chartElaboraciones');
        if (canvasElaboraciones) {
            if (this.state.chartElaboraciones) {
                this.state.chartElaboraciones.destroy();
            }
            
            this.state.chartElaboraciones = new Chart(canvasElaboraciones, {
                type: 'bar',
                data: {
                    labels: datosElaboraciones.labels,
                    datasets: [
                        {
                            label: 'Elaboraciones',
                            data: datosElaboraciones.cantidades,
                            backgroundColor: 'rgba(155, 89, 182, 0.5)',
                            borderColor: 'rgba(155, 89, 182, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: false
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Elaboraciones por Día'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    },
    
    prepararDatosOperaciones(operaciones) {
        const datos = {
            labels: [],
            descargas: [],
            clasificaciones: []
        };
        
        // Agrupar operaciones por fecha
        const operacionesPorFecha = {};
        operaciones.forEach(op => {
            if (!operacionesPorFecha[op.fecha]) {
                operacionesPorFecha[op.fecha] = {
                    descargas: 0,
                    clasificaciones: 0
                };
            }
            
            if (op.tipo === 'Descarga') {
                operacionesPorFecha[op.fecha].descargas++;
            } else if (op.tipo === 'Clasificación') {
                operacionesPorFecha[op.fecha].clasificaciones++;
            }
        });
        
        // Ordenar fechas y preparar datos
        const fechas = Object.keys(operacionesPorFecha).sort();
        fechas.forEach(fecha => {
            datos.labels.push(fecha);
            datos.descargas.push(operacionesPorFecha[fecha].descargas);
            datos.clasificaciones.push(operacionesPorFecha[fecha].clasificaciones);
        });

        return datos;
    },

    prepararDatosElaboraciones(elaboraciones) {
        const datos = {
            labels: [],
            cantidades: []
        };
        
        // Agrupar elaboraciones por fecha
        const elaboracionesPorFecha = {};
        elaboraciones.forEach(el => {
            if (!elaboracionesPorFecha[el.fecha]) {
                elaboracionesPorFecha[el.fecha] = 0;
            }
            elaboracionesPorFecha[el.fecha]++;
        });
        
        // Ordenar fechas y preparar datos
        const fechas = Object.keys(elaboracionesPorFecha).sort();
        fechas.forEach(fecha => {
            datos.labels.push(fecha);
            datos.cantidades.push(elaboracionesPorFecha[fecha]);
        });
        
        return datos;
    },

    configurarActualizacionAutomatica() {
        console.log('Configurando actualización automática...');
        
        // Actualizar cada 1 minuto en lugar de 5
        setInterval(() => {
            console.log('Ejecutando actualización automática...');
            this.actualizarDashboard();
        }, 60000);
        
        // Escuchar eventos de actualización de datos
        document.addEventListener('datosActualizados', (event) => {
            console.log('Evento de actualización recibido:', event.detail);
            this.actualizarDashboard();
        });

        // Escuchar eventos específicos de cada módulo
        document.addEventListener('operacionCreada', () => {
            console.log('Nueva operación creada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('operacionActualizada', () => {
            console.log('Operación actualizada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('operacionEliminada', () => {
            console.log('Operación eliminada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('notaCreada', () => {
            console.log('Nueva nota creada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('notaActualizada', () => {
            console.log('Nota actualizada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('notaEliminada', () => {
            console.log('Nota eliminada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('elaboracionCreada', () => {
            console.log('Nueva elaboración creada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('elaboracionActualizada', () => {
            console.log('Elaboración actualizada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('elaboracionEliminada', () => {
            console.log('Elaboración eliminada, actualizando dashboard...');
            this.actualizarDashboard();
        });

        document.addEventListener('personalActualizado', () => {
            console.log('Personal actualizado, actualizando dashboard...');
            this.actualizarDashboard();
        });
    },

    // Inicializar funcionalidades de exportación e importación
    initDataExportImport() {
        console.log('Inicializando funcionalidades de exportación e importación...');
        
        // Verificar si los módulos necesarios están disponibles
        if (!window.DB) {
            console.error('El módulo DB no está disponible');
            // Intentar esperar a que DB esté disponible
            setTimeout(() => {
                if (window.DB) {
                    console.log('DB ya está disponible, inicializando exportación/importación...');
                    this.initDataExportImport();
                }
            }, 1000);
            return false;
        }
        
        if (typeof window.DB.exportData !== 'function') {
            console.error('DB no tiene la función exportData');
            // Proporcionar una implementación alternativa
            window.DB.exportData = function() {
                try {
                    const allData = {
                        version: '1.0',
                        timestamp: new Date().toISOString(),
                        stores: {}
                    };
                    
                    // Recolectar datos de cada almacén
                    Object.keys(this.stores).forEach(store => {
                        allData.stores[store] = this.stores[store];
                    });
                    
                    // Crear nombre de archivo con fecha
                    const date = new Date();
                    const dateStr = date.toISOString().split('T')[0];
                    const timeStr = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
                    const fileName = `gestion_produccion_${dateStr}_${timeStr}.json`;
                    
                    // Crear y descargar archivo
                    const jsonStr = JSON.stringify(allData);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    UI.mostrarNotificacion(`Datos exportados correctamente como ${fileName}`, 'success');
                    return true;
                } catch (error) {
                    console.error('Error al exportar datos:', error);
                    UI.mostrarNotificacion('Error al exportar datos. Inténtalo de nuevo.', 'error');
                    return false;
                }
            };
            console.log('Implementada función exportData en DB');
        }
        
        // Configurar botones de exportación
        const btnExportarDatos = document.getElementById('btnExportarDatos');
        if (btnExportarDatos) {
            btnExportarDatos.addEventListener('click', () => {
                UI.mostrarNotificacion('Preparando la exportación de datos...', 'info', 2000);
                setTimeout(() => {
                    try {
                        window.DB.exportData();
                    } catch (error) {
                        console.error('Error al exportar datos:', error);
                        UI.mostrarNotificacion('Error al exportar datos: ' + error.message, 'error');
                    }
                }, 300);
            });
            console.log('Botón de exportación configurado');
        }
        
        // Implementar importData si no existe
        if (typeof window.DB.importData !== 'function') {
            console.error('DB no tiene la función importData');
            
            window.DB.importData = function(jsonData) {
                try {
                    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                    
                    // Validar estructura de los datos
                    if (!data.stores || !data.timestamp) {
                        throw new Error('El formato del archivo no es válido');
                    }
                    
                    // Confirmación
                    if (!confirm(`¿Estás seguro de importar estos datos del ${new Date(data.timestamp).toLocaleString()}? Esto reemplazará TODOS los datos actuales.`)) {
                        return false;
                    }
                    
                    // Importar datos a cada almacén
                    let importCount = 0;
                    
                    Object.keys(data.stores).forEach(store => {
                        if (this.stores[store] !== undefined) {
                            this.stores[store] = data.stores[store];
                            importCount += Array.isArray(data.stores[store]) ? data.stores[store].length : 1;
                        }
                    });
                    
                    // Guardar cambios
                    this.save();
                    
                    // Mostrar mensaje de éxito
                    UI.mostrarNotificacion(`Datos importados correctamente. Se importaron ${importCount} registros.`, 'success');
                    
                    // Recargar la página para aplicar los cambios
                    setTimeout(() => { location.reload(); }, 2000);
                    
                    return true;
                } catch (error) {
                    console.error('Error al importar datos:', error);
                    UI.mostrarNotificacion(`Error al importar datos: ${error.message}`, 'error');
                    return false;
                }
            };
            console.log('Implementada función importData en DB');
        }
        
        // Configurar botones de importación
        const btnImportarDatos = document.getElementById('btnImportarDatos');
        if (btnImportarDatos) {
            btnImportarDatos.addEventListener('click', () => {
                // Crear y mostrar el selector de archivos
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                // Mostrar notificación
                UI.mostrarNotificacion('Selecciona el archivo con los datos a importar', 'info');
                
                input.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        UI.mostrarNotificacion('No se seleccionó ningún archivo', 'warning');
                        return;
                    }
                    
                    console.log(`Archivo seleccionado: ${file.name} (${Math.round(file.size/1024)} KB)`);
                    UI.mostrarNotificacion(`Procesando archivo: ${file.name}`, 'info');
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const contenido = e.target.result;
                            window.DB.importData(contenido);
                        } catch (error) {
                            console.error('Error al procesar archivo:', error);
                            UI.mostrarNotificacion(`Error al procesar archivo: ${error.message}`, 'error');
                        }
                    };
                    
                    reader.onerror = (error) => {
                        console.error('Error al leer archivo:', error);
                        UI.mostrarNotificacion('Error al leer el archivo', 'error');
                    };
                    
                    reader.readAsText(file);
                });
                
                input.click();
            });
            console.log('Botón de importación configurado');
        }
        
        return true;
    },

    async actualizarFechaActual() {
        try {
            const fechaActual = new Date();
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
            const elementoFecha = document.getElementById('fechaActual');
            if (elementoFecha) {
                elementoFecha.textContent = fechaFormateada;
            }
        } catch (error) {
            console.error('Error al actualizar la fecha actual:', error);
            UI.mostrarNotificacion('Error al actualizar la fecha actual', 'error');
        }
    },

    async actualizarGraficos() {
        try {
            await this.actualizarGraficosProduccion();
            await this.actualizarEstadisticasSemanales();
        } catch (error) {
            console.error('Error al actualizar los gráficos:', error);
            UI.mostrarNotificacion('Error al actualizar los gráficos', 'error');
        }
    },

    // Obtener todas las elaboraciones de la base de datos
    async getTodasElaboraciones() {
        try {
            return await DB.getAll('elaboraciones');
        } catch (error) {
            console.error('Error al obtener las elaboraciones:', error);
            UI.mostrarNotificacion('Error al cargar las elaboraciones', 'error');
            return [];
        }
    },

    // Obtener próximas actividades (para los próximos días)
    getProximasActividades(dias = 7) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const limite = new Date();
        limite.setDate(hoy.getDate() + dias);
        limite.setHours(23, 59, 59, 999);
        
        const hoyStr = hoy.toISOString().split('T')[0];
        const limiteStr = limite.toISOString().split('T')[0];
        
        // Obtener notas para el período que no estén completadas
        const notas = DB.getAll('notas').filter(nota => {
            const fechaNota = new Date(nota.fecha);
            return fechaNota > hoy && 
                   fechaNota <= limite &&
                   nota.estado !== 'completado';
        }).map(nota => ({
            id: nota.id,
            tipo: 'nota',
            fecha: nota.fecha,
            area: nota.area,
            titulo: `${nota.area}`,
            detalle: nota.contenido,
            personasNombres: nota.personasNombres || []
        }));
        
        // Obtener operaciones para el período que no estén completadas
        const operaciones = DB.getAll('operaciones').filter(op => 
            op.fecha > hoyStr && 
            op.fecha <= limiteStr && 
            (op.tipo === 'Descarga' || op.tipo === 'Clasificación') &&
            op.estado !== 'completado'
        ).map(op => ({
            id: op.id,
            tipo: 'operacion',
            fecha: op.fecha,
            tipoOperacion: op.tipo,
            lugar: op.lugar,
            titulo: `${op.tipo}: ${op.lugar}`,
            detalle: op.descripcion || '',
            personasNombres: op.personasNombres || [],
            estado: op.estado || 'pendiente'
        }));

        // Obtener actividades de elaboración para el período que no estén completadas
        const elaboraciones = DB.getAll('elaboraciones').filter(elab => {
            const fechaElab = new Date(elab.fecha);
            return fechaElab > hoy && 
                   fechaElab <= limite &&
                   elab.estado !== 'completado';
        }).map(elab => ({
            id: elab.id,
            tipo: 'elaboracion',
            fecha: elab.fecha,
            area: 'Elaboración',
            titulo: elab.titulo || 'Actividad de Elaboración',
            detalle: elab.descripcion || '',
            personasNombres: elab.personasNombres || [],
            estado: elab.estado || 'pendiente'
        }));
        
        // Combinar todas las actividades
        const todas = [...notas, ...operaciones, ...elaboraciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        return todas;
    },

    // Renderizar el HTML para las personas asignadas a una actividad
    renderizarPersonasActividad(personasNombres) {
        if (!personasNombres || personasNombres.length === 0) {
            return '<div class="actividad-personas"><small class="text-muted">Sin personal asignado</small></div>';
        }

        return `
            <div class="actividad-personas">
                <small class="text-muted">
                    <i class="fas fa-users me-1"></i>
                    ${personasNombres.join(', ')}
                </small>
            </div>
        `;
    },

    // Actualizar estadísticas semanales en el dashboard
    actualizarEstadisticasSemanales() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        
        // Obtener todas las operaciones y elaboraciones
        const operaciones = DB.getAll('operaciones');
        const elaboraciones = DB.getAll('elaboraciones');
        const notas = DB.getAll('notas');
        
        // Inicializar contadores
        const estadisticas = {
            elaboraciones: 0,
            operaciones: 0,
            notas: 0
        };
        
        // Contar actividades de esta semana
        operaciones.forEach(op => {
            const fechaOp = new Date(op.fecha);
            if (fechaOp >= inicioSemana && fechaOp <= hoy) {
                estadisticas.operaciones++;
            }
        });
        
        elaboraciones.forEach(elab => {
            const fechaElab = new Date(elab.fecha);
            if (fechaElab >= inicioSemana && fechaElab <= hoy) {
                estadisticas.elaboraciones++;
            }
        });
        
        notas.forEach(nota => {
            const fechaNota = new Date(nota.fecha);
            if (fechaNota >= inicioSemana && fechaNota <= hoy) {
                estadisticas.notas++;
            }
        });
        
        // Actualizar el HTML
        const container = document.getElementById('estadisticasSemanales');
        if (container) {
            container.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="card bg-primary text-white mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Elaboraciones</h5>
                                <p class="card-text display-4">${estadisticas.elaboraciones}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-success text-white mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Operaciones</h5>
                                <p class="card-text display-4">${estadisticas.operaciones}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-info text-white mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Notas</h5>
                                <p class="card-text display-4">${estadisticas.notas}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Actualizar operaciones de descarga y clasificación
    actualizarOperacionesDashboard() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyStr = hoy.toISOString().split('T')[0];
        
        // Obtener operaciones para hoy
        const operaciones = DB.getAll('operaciones').filter(op => 
            op.fecha === hoyStr && 
            (op.tipo === 'Descarga' || op.tipo === 'Clasificación') &&
            op.estado !== 'completado'
        );
        
        const container = document.getElementById('operacionesDashboard');
        if (!container) return;
        
        if (operaciones.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay operaciones programadas para hoy
                </div>
            `;
            return;
        }
        
        let html = '<div class="list-group">';
        operaciones.forEach(op => {
            const hora = new Date(op.fecha).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            html += `
                <div class="list-group-item" id="operacion-${op.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">
                                <span class="badge ${op.tipo === 'Descarga' ? 'bg-primary' : 'bg-success'} me-2">
                                    ${op.tipo}
                                </span>
                                ${op.lugar}
                            </h6>
                            <p class="mb-1">${op.descripcion || ''}</p>
                            <small class="text-muted">
                                <i class="far fa-clock me-1"></i>${hora}
                            </small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="app.finalizarActividad('${op.id}', 'operacion')">
                            Finalizar
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    },

    // Actualizar notas y programación de la sala de elaboración
    actualizarNotasDashboard() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Obtener notas para hoy
        const notas = DB.getAll('notas')
            .filter(nota => {
                const fechaNota = new Date(nota.fecha);
                return fechaNota >= hoy && 
                       fechaNota < new Date(hoy.getTime() + 24 * 60 * 60 * 1000) &&
                       nota.estado !== 'completado';
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fecha).getTime();
                const fechaB = new Date(b.fecha).getTime();
                return fechaA - fechaB; // Orden ascendente (más antigua primero)
            });
        
        const container = document.getElementById('notasDashboard');
        if (!container) return;
        
        if (notas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay notas o programaciones para hoy
                </div>
            `;
            return;
        }
        
        let html = '<div class="list-group">';
        notas.forEach(nota => {
            const fecha = new Date(nota.fecha);
            const hora = fecha.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            html += `
                <div class="list-group-item" id="nota-${nota.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">
                                <span class="badge bg-info me-2">
                                    ${nota.area}
                                </span>
                                ${nota.titulo || 'Nota'}
                            </h6>
                            <p class="mb-1">${nota.contenido}</p>
                            <small class="text-muted">
                                <i class="far fa-clock me-1"></i>${hora}
                            </small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="app.finalizarActividad('${nota.id}', 'nota')">
                            Finalizar
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    },

    // Funciones para generación de reportes
    generarReporte() {
        try {
            // Obtener datos para el reporte
            const datos = this.obtenerDatosReporte();
            
            // Mostrar modal con vista previa y opciones
            this.mostrarModalReporte(datos);
        } catch (error) {
            console.error('Error al generar reporte:', error);
            UI.mostrarNotificacion('Error al generar el reporte', 'error');
        }
    },

    obtenerDatosReporte() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());

        // Obtener datos de la semana actual
        const operaciones = DB.getAll('operaciones').filter(op => {
            const fechaOp = new Date(op.fecha);
            return fechaOp >= inicioSemana && fechaOp <= hoy;
        });

        const elaboraciones = DB.getAll('elaboraciones').filter(elab => {
            const fechaElab = new Date(elab.fecha);
            return fechaElab >= inicioSemana && fechaElab <= hoy;
        });

        const notas = DB.getAll('notas').filter(nota => {
            const fechaNota = new Date(nota.fecha);
            return fechaNota >= inicioSemana && fechaNota <= hoy;
        });

        return {
            fecha: hoy.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            operaciones: operaciones.map(op => ({
                tipo: op.tipo,
                lugar: op.lugar,
                fecha: new Date(op.fecha).toLocaleDateString('es-ES'),
                estado: op.estado || 'pendiente',
                personal: op.personasNombres || [],
                descripcion: op.descripcion || ''
            })),
            elaboraciones: elaboraciones.map(elab => ({
                nombre: elab.nombre || 'Elaboración',
                fecha: new Date(elab.fecha).toLocaleDateString('es-ES'),
                estado: elab.estado || 'pendiente',
                personal: elab.personasNombres || [],
                descripcion: elab.descripcion || ''
            })),
            notas: notas.map(nota => ({
                area: nota.area || 'General',
                fecha: new Date(nota.fecha).toLocaleDateString('es-ES'),
                estado: nota.estado || 'pendiente',
                personal: nota.personasNombres || [],
                contenido: nota.contenido || ''
            }))
        };
    },

    mostrarModalReporte(datos) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modalReporte';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-file-alt me-2"></i>
                            Reporte Semanal de Producción
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6 class="text-muted">Fecha del reporte: ${datos.fecha}</h6>
                        </div>

                        <!-- Tabs de navegación -->
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#operaciones" type="button">
                                    <i class="fas fa-truck-loading me-2"></i>Operaciones
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#elaboraciones" type="button">
                                    <i class="fas fa-industry me-2"></i>Elaboraciones
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#notas" type="button">
                                    <i class="fas fa-sticky-note me-2"></i>Notas
                                </button>
                            </li>
                        </ul>

                        <!-- Contenido de las tabs -->
                        <div class="tab-content">
                            <!-- Tab Operaciones -->
                            <div class="tab-pane fade show active" id="operaciones">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Lugar</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Personal</th>
                                                <th>Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${datos.operaciones.map(op => `
                                                <tr>
                                                    <td>
                                                        <span class="badge ${op.tipo === 'Descarga' ? 'bg-primary' : 'bg-success'}">
                                                            ${op.tipo}
                                                        </span>
                                                    </td>
                                                    <td>${op.lugar}</td>
                                                    <td>${op.fecha}</td>
                                                    <td>
                                                        <span class="badge ${op.estado === 'completado' ? 'bg-success' : 'bg-warning'}">
                                                            ${op.estado}
                                                        </span>
                                                    </td>
                                                    <td>${op.personal.length > 0 ? op.personal.join(', ') : 'Sin asignar'}</td>
                                                    <td>${op.descripcion || '-'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Tab Elaboraciones -->
                            <div class="tab-pane fade" id="elaboraciones">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Personal</th>
                                                <th>Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${datos.elaboraciones.map(elab => `
                                                <tr>
                                                    <td>${elab.nombre}</td>
                                                    <td>${elab.fecha}</td>
                                                    <td>
                                                        <span class="badge ${elab.estado === 'completado' ? 'bg-success' : 'bg-warning'}">
                                                            ${elab.estado}
                                                        </span>
                                                    </td>
                                                    <td>${elab.personal.length > 0 ? elab.personal.join(', ') : 'Sin asignar'}</td>
                                                    <td>${elab.descripcion || '-'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Tab Notas -->
                            <div class="tab-pane fade" id="notas">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Área</th>
                                                <th>Fecha</th>
                                                <th>Estado</th>
                                                <th>Personal</th>
                                                <th>Contenido</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${datos.notas.map(nota => `
                                                <tr>
                                                    <td>
                                                        <span class="badge bg-info">
                                                            ${nota.area}
                                                        </span>
                                                    </td>
                                                    <td>${nota.fecha}</td>
                                                    <td>
                                                        <span class="badge ${nota.estado === 'completado' ? 'bg-success' : 'bg-warning'}">
                                                            ${nota.estado}
                                                        </span>
                                                    </td>
                                                    <td>${nota.personal.length > 0 ? nota.personal.join(', ') : 'Sin asignar'}</td>
                                                    <td>${nota.contenido || '-'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cerrar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="app.exportarPDF()">
                            <i class="fas fa-file-pdf me-2"></i>Exportar PDF
                        </button>
                        <button type="button" class="btn btn-success" onclick="app.exportarExcel()">
                            <i class="fas fa-file-excel me-2"></i>Exportar Excel
                        </button>
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

    exportarPDF() {
        try {
            const datos = this.obtenerDatosReporte();
            const doc = new jsPDF();

            // Configuración inicial
            doc.setFont('helvetica');
            
            // Título
            doc.setFontSize(20);
            doc.text('Reporte Semanal de Producción', 105, 20, { align: 'center' });
            
            // Fecha
            doc.setFontSize(12);
            doc.text(`Fecha: ${datos.fecha}`, 105, 30, { align: 'center' });

            let yPos = 50;

            // Función helper para agregar sección
            const agregarSeccion = (titulo, items, campos) => {
                if (items.length === 0) return yPos;

                // Agregar nueva página si no hay espacio
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(16);
                doc.text(titulo, 14, yPos);
                yPos += 10;

                // Contenido
                doc.setFontSize(10);
                items.forEach(item => {
                    campos.forEach(campo => {
                        const texto = `${campo.label}: ${item[campo.key] || '-'}`;
                        doc.text(texto, 14, yPos);
                        yPos += 5;
                    });
                    yPos += 5;
                });

                yPos += 10;
                return yPos;
            };

            // Agregar secciones
            yPos = agregarSeccion('Operaciones', datos.operaciones, [
                { label: 'Tipo', key: 'tipo' },
                { label: 'Lugar', key: 'lugar' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' }
            ]);

            yPos = agregarSeccion('Elaboraciones', datos.elaboraciones, [
                { label: 'Nombre', key: 'nombre' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' }
            ]);

            yPos = agregarSeccion('Notas', datos.notas, [
                { label: 'Área', key: 'area' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' },
                { label: 'Contenido', key: 'contenido' }
            ]);

            // Guardar PDF
            doc.save('reporte_semanal.pdf');
            UI.mostrarNotificacion('Reporte PDF generado con éxito', 'success');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            UI.mostrarNotificacion('Error al generar el PDF', 'error');
        }
    },

    exportarExcel() {
        try {
            const datos = this.obtenerDatosReporte();
            const wb = XLSX.utils.book_new();

            // Función helper para crear hoja
            const crearHoja = (nombre, datos, campos) => {
                if (datos.length > 0) {
                    const ws = XLSX.utils.json_to_sheet(
                        datos.map(item => {
                            const fila = {};
                            campos.forEach(campo => {
                                fila[campo.label] = Array.isArray(item[campo.key]) 
                                    ? item[campo.key].join(', ') 
                                    : (item[campo.key] || '-');
                            });
                            return fila;
                        })
                    );
                    XLSX.utils.book_append_sheet(wb, ws, nombre);
                }
            };

            // Crear hojas
            crearHoja('Operaciones', datos.operaciones, [
                { label: 'Tipo', key: 'tipo' },
                { label: 'Lugar', key: 'lugar' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' },
                { label: 'Descripción', key: 'descripcion' }
            ]);

            crearHoja('Elaboraciones', datos.elaboraciones, [
                { label: 'Nombre', key: 'nombre' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' },
                { label: 'Descripción', key: 'descripcion' }
            ]);

            crearHoja('Notas', datos.notas, [
                { label: 'Área', key: 'area' },
                { label: 'Fecha', key: 'fecha' },
                { label: 'Estado', key: 'estado' },
                { label: 'Personal', key: 'personal' },
                { label: 'Contenido', key: 'contenido' }
            ]);

            // Guardar archivo
            XLSX.writeFile(wb, 'reporte_semanal.xlsx');
            UI.mostrarNotificacion('Reporte Excel generado con éxito', 'success');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            UI.mostrarNotificacion('Error al generar el Excel', 'error');
        }
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado. Inicializando módulos...');
    
    // Inicializar módulos
    DB.init();
    UI.init();
    window.app.init();
    
    // Inicializar módulos específicos
    Notas.init();
    Personal.init();
    Operaciones.init();
    Elaboracion.init();
    Inventario.init();
    Configuracion.init();
    Nomina.init();
});

// Función para crear un elemento de actividad
function crearElementoActividad(actividad) {
    const div = document.createElement('div');
    div.className = `actividad-item ${actividad.tipo}`;
    
    const header = document.createElement('div');
    header.className = 'actividad-header';
    
    const titulo = document.createElement('h4');
    titulo.className = 'actividad-titulo';
    titulo.textContent = actividad.titulo;
    
    const hora = document.createElement('span');
    hora.className = 'actividad-hora';
    hora.textContent = actividad.hora;
    
    const detalles = document.createElement('p');
    detalles.className = 'actividad-detalles';
    detalles.textContent = actividad.detalles;
    
    const estado = document.createElement('span');
    estado.className = `actividad-estado estado-${actividad.estado}`;
    estado.textContent = actividad.estado.charAt(0).toUpperCase() + actividad.estado.slice(1);
    
    header.appendChild(titulo);
    header.appendChild(hora);
    div.appendChild(header);
    div.appendChild(detalles);
    div.appendChild(estado);
    
    return div;
}

// Función para cargar actividades de elaboración
function cargarActividadesElaboracion() {
    const contenedor = document.getElementById('actividades-elaboracion');
    if (!contenedor) return;
    
    // Datos de ejemplo - en producción esto vendría de una API
    const actividades = [
        {
            tipo: 'elaboracion',
            titulo: 'Elaboración de Pan Francés',
            hora: '08:00 AM',
            detalles: 'Cantidad: 100 unidades - Responsable: Juan Pérez',
            estado: 'en-proceso'
        },
        {
            tipo: 'descarga',
            titulo: 'Descarga de Harina',
            hora: '09:30 AM',
            detalles: 'Proveedor: Molinos del Sur - Cantidad: 50 sacos',
            estado: 'pendiente'
        },
        {
            tipo: 'clasificacion',
            titulo: 'Clasificación de Materia Prima',
            hora: '10:00 AM',
            detalles: 'Área: Almacén Principal - Responsable: María González',
            estado: 'completado'
        }
    ];
    
    contenedor.innerHTML = '';
    actividades.forEach(actividad => {
        contenedor.appendChild(crearElementoActividad(actividad));
    });
}

// Cargar actividades cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarActividadesElaboracion();
    // ... existing code ...
}); 