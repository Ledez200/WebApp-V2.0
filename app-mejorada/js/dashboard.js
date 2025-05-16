// Función para procesar los datos de tendencias
function procesarDatosTendenciasCompletas() {
    try {
        // Obtener datos del localStorage y verificar su contenido
        const operacionesRaw = localStorage.getItem('gp_operaciones');
        const notasRaw = localStorage.getItem('gp_notas');
        const elaboracionesRaw = localStorage.getItem('gp_elaboraciones');
        
        console.log('Datos raw del localStorage:', {
            operaciones: operacionesRaw,
            notas: notasRaw,
            elaboraciones: elaboracionesRaw
        });

        const operaciones = operacionesRaw ? JSON.parse(operacionesRaw) : [];
        const notas = notasRaw ? JSON.parse(notasRaw) : [];
        const elaboraciones = elaboracionesRaw ? JSON.parse(elaboracionesRaw) : [];
        
        console.log('Datos parseados:', {
            operaciones,
            notas,
            elaboraciones
        });
        
        // Obtener las últimas 7 fechas
        const hoy = new Date();
        const labels = [];
        const datosOperaciones = [];
        const datosNotas = [];
        const datosElaboraciones = [];
        
        // Inicializar contadores para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            // Formatear la etiqueta para mostrar día y fecha
            const label = fecha.toLocaleDateString('es-ES', { 
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
            });
            labels.push(label);
            
            // Contar operaciones para esta fecha
            const operacionesDia = operaciones.filter(op => {
                if (!op.fecha) {
                    console.warn('Operación sin fecha:', op);
                    return false;
                }
                const fechaOp = new Date(op.fecha);
                const fechaOpStr = fechaOp.toISOString().split('T')[0];
                console.log(`Comparando fechas - Operación: ${fechaOpStr}, Fecha objetivo: ${fechaStr}`);
                return fechaOpStr === fechaStr;
            }).length;
            
            // Contar notas para esta fecha
            const notasDia = notas.filter(nota => {
                if (!nota.fecha) {
                    console.warn('Nota sin fecha:', nota);
                    return false;
                }
                const fechaNota = new Date(nota.fecha);
                const fechaNotaStr = fechaNota.toISOString().split('T')[0];
                console.log(`Comparando fechas - Nota: ${fechaNotaStr}, Fecha objetivo: ${fechaStr}`);
                return fechaNotaStr === fechaStr;
            }).length;
            
            // Contar elaboraciones para esta fecha
            const elaboracionesDia = elaboraciones.filter(elab => {
                if (!elab.fecha) {
                    console.warn('Elaboración sin fecha:', elab);
                    return false;
                }
                const fechaElab = new Date(elab.fecha);
                const fechaElabStr = fechaElab.toISOString().split('T')[0];
                console.log(`Comparando fechas - Elaboración: ${fechaElabStr}, Fecha objetivo: ${fechaStr}`);
                return fechaElabStr === fechaStr;
            }).length;
            
            console.log(`Conteo para ${fechaStr}:`, {
                operaciones: operacionesDia,
                notas: notasDia,
                elaboraciones: elaboracionesDia
            });
            
            datosOperaciones.push(operacionesDia);
            datosNotas.push(notasDia);
            datosElaboraciones.push(elaboracionesDia);
        }
        
        // Calcular totales
        const totalOperaciones = operaciones.length;
        const totalNotas = notas.length;
        const totalElaboraciones = elaboraciones.length;
        
        // Calcular estadísticas por tipo de operación
        const operacionesPorTipo = operaciones.reduce((acc, op) => {
            const tipo = op.tipo || 'Sin tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        
        // Calcular estadísticas por área de elaboración
        const elaboracionesPorArea = elaboraciones.reduce((acc, elab) => {
            const area = elab.area || 'Sin área';
            acc[area] = (acc[area] || 0) + 1;
            return acc;
        }, {});
        
        const resultado = {
            labels,
            datosOperaciones,
            datosNotas,
            datosElaboraciones,
            totalOperaciones,
            totalNotas,
            totalElaboraciones,
            operacionesPorTipo,
            elaboracionesPorArea
        };
        
        console.log('Resultado final del procesamiento:', resultado);
        
        return resultado;
    } catch (error) {
        console.error('Error al procesar datos de tendencias:', error);
        return {
            labels: [],
            datosOperaciones: [],
            datosNotas: [],
            datosElaboraciones: [],
            totalOperaciones: 0,
            totalNotas: 0,
            totalElaboraciones: 0,
            operacionesPorTipo: {},
            elaboracionesPorArea: {}
        };
    }
}

// Gráfico de líneas (tendencias)
function crearGraficoTendencias() {
    const ctx = document.getElementById('tendenciasChart');
    if (!ctx) {
        console.warn('No se encontró el elemento canvas para el gráfico de tendencias');
        return;
    }

    const datos = procesarDatosTendenciasCompletas();
    
    // Destruir el gráfico existente si existe
    if (window.tendenciasChart instanceof Chart) {
        window.tendenciasChart.destroy();
    }
    
    window.tendenciasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datos.labels,
            datasets: [
                {
                    label: 'Operaciones',
                    data: datos.datosOperaciones,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Notas',
                    data: datos.datosNotas,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencias de Actividad'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

// Gráfico de barras apiladas
function crearGraficoBarrasTendencias() {
    const ctx = document.getElementById('tendenciasBarrasChart');
    if (!ctx) {
        console.warn('No se encontró el elemento canvas para el gráfico de barras');
        return;
    }

    const datos = procesarDatosTendenciasCompletas();
    
    // Destruir el gráfico existente si existe
    if (window.tendenciasBarrasChart instanceof Chart) {
        window.tendenciasBarrasChart.destroy();
    }
    
    window.tendenciasBarrasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.labels,
            datasets: [
                {
                    label: 'Operaciones',
                    data: datos.datosOperaciones,
                    backgroundColor: '#4CAF50',
                    stack: 'Stack 0'
                },
                {
                    label: 'Notas',
                    data: datos.datosNotas,
                    backgroundColor: '#2196F3',
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Actividad Acumulada'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

// Gráfico circular de proporción total
function crearGraficoActividadPie() {
    const ctx = document.getElementById('actividadPieChart');
    if (!ctx) {
        console.warn('No se encontró el elemento canvas para el gráfico circular');
        return;
    }

    const datos = procesarDatosTendenciasCompletas();
    
    // Destruir el gráfico existente si existe
    if (window.actividadPieChart instanceof Chart) {
        window.actividadPieChart.destroy();
    }
    
    window.actividadPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Operaciones', 'Notas'],
            datasets: [{
                data: [datos.totalOperaciones, datos.totalNotas],
                backgroundColor: ['#4CAF50', '#2196F3']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Actividad'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Gráfico de operaciones por tipo
function crearGraficoOperacionesPorTipo() {
    const ctx = document.getElementById('operacionesPorTipoChart');
    if (!ctx) {
        console.warn('No se encontró el elemento canvas para el gráfico de operaciones por tipo');
        return;
    }

    const operacionesRaw = localStorage.getItem('gp_operaciones');
    const operaciones = operacionesRaw ? JSON.parse(operacionesRaw) : [];
    
    // Agrupar operaciones por tipo
    const tiposOperaciones = operaciones.reduce((acc, op) => {
        const tipo = op.tipo || 'Sin tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});
    
    // Destruir el gráfico existente si existe
    if (window.operacionesPorTipoChart instanceof Chart) {
        window.operacionesPorTipoChart.destroy();
    }
    
    window.operacionesPorTipoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(tiposOperaciones),
            datasets: [{
                label: 'Cantidad de Operaciones',
                data: Object.values(tiposOperaciones),
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#9C27B0',
                    '#F44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Operaciones por Tipo'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                }
            }
        }
    });
}

// Inicializar todos los gráficos
function inicializarGraficos() {
    crearGraficoTendencias();
    crearGraficoBarrasTendencias();
    crearGraficoActividadPie();
    crearGraficoOperacionesPorTipo();
}

// Actualizar los gráficos cuando cambien los datos
function actualizarGraficos() {
    try {
        console.log('Iniciando actualización de gráficos...');
        const datos = procesarDatosTendenciasCompletas();
        
        // Actualizar cada gráfico
        crearGraficoTendencias();
        crearGraficoBarrasTendencias();
        crearGraficoActividadPie();
        crearGraficoOperacionesPorTipo();
        
        console.log('Gráficos actualizados correctamente');
    } catch (error) {
        console.error('Error al actualizar gráficos:', error);
    }
}

// Exportar funciones
window.Dashboard = {
    inicializarGraficos,
    actualizarGraficos
};

document.addEventListener('DOMContentLoaded', inicializarGraficos); 