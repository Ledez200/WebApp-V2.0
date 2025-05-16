// Procesar datos de tendencias para operaciones y notas (reforzado)
function procesarDatosTendenciasCompletas() {
    const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
    const notas = JSON.parse(localStorage.getItem('notas')) || [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const labels = [];
    const datosOperaciones = Array(7).fill(0);
    const datosNotas = Array(7).fill(0);
    const dias = [];

    // Crear fechas base para los últimos 7 días
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        fecha.setHours(0, 0, 0, 0);
        dias.push(new Date(fecha));
        labels.push(fecha.toLocaleDateString('es-ES', { weekday: 'short' }));
    }

    // Función para normalizar fecha (solo día)
    function normalizarFecha(fechaStr) {
        if (!fechaStr) return null;
        let fecha;
        // Si es ISO o tiene T
        if (fechaStr.includes('T')) {
            fecha = new Date(fechaStr);
        } else {
            // Si es solo YYYY-MM-DD
            fecha = new Date(fechaStr + 'T00:00:00');
        }
        fecha.setHours(0, 0, 0, 0);
        return fecha;
    }

    // Contar operaciones por día
    operaciones.forEach(op => {
        const fechaOp = normalizarFecha(op.fecha);
        if (!fechaOp) return;
        dias.forEach((dia, idx) => {
            if (fechaOp.getTime() === dia.getTime()) {
                datosOperaciones[idx]++;
            }
        });
    });
    // Contar notas por día
    notas.forEach(nota => {
        const fechaNota = normalizarFecha(nota.fecha);
        if (!fechaNota) return;
        dias.forEach((dia, idx) => {
            if (fechaNota.getTime() === dia.getTime()) {
                datosNotas[idx]++;
            }
        });
    });

    // Logs de depuración
    console.log('Días:', dias.map(d => d.toISOString().split('T')[0]));
    console.log('Operaciones:', operaciones.map(o => o.fecha));
    console.log('Notas:', notas.map(n => n.fecha));
    console.log('Datos operaciones:', datosOperaciones);
    console.log('Datos notas:', datosNotas);

    return {
        labels,
        datosOperaciones,
        datosNotas,
        totalOperaciones: operaciones.length,
        totalNotas: notas.length
    };
}

// Gráfico de líneas (tendencias)
function crearGraficoTendencias() {
    const ctx = document.getElementById('tendenciasChart').getContext('2d');
    const noDataElement = document.getElementById('tendenciasNoData');
    const datos = procesarDatosTendenciasCompletas();
    const hayDatos = datos.datosOperaciones.some(v => v > 0) || datos.datosNotas.some(v => v > 0);
    if (window.tendenciasChart && typeof window.tendenciasChart.destroy === 'function') {
        window.tendenciasChart.destroy();
    }
    if (hayDatos) {
        noDataElement.style.display = 'none';
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
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        noDataElement.style.display = 'block';
    }
}

// Gráfico de barras apiladas
function crearGraficoBarrasTendencias() {
    const ctx = document.getElementById('tendenciasBarrasChart').getContext('2d');
    const datos = procesarDatosTendenciasCompletas();
    const hayDatos = datos.datosOperaciones.some(v => v > 0) || datos.datosNotas.some(v => v > 0);
    if (window.tendenciasBarrasChart && typeof window.tendenciasBarrasChart.destroy === 'function') {
        window.tendenciasBarrasChart.destroy();
    }
    if (hayDatos) {
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
                    legend: { position: 'top' }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    }
}

// Gráfico circular de proporción total
function crearGraficoActividadPie() {
    const ctx = document.getElementById('actividadPieChart').getContext('2d');
    const noDataElement = document.getElementById('actividadNoData');
    const datos = procesarDatosTendenciasCompletas();
    if (window.actividadPieChart && typeof window.actividadPieChart.destroy === 'function') {
        window.actividadPieChart.destroy();
    }
    if (datos.totalOperaciones > 0 || datos.totalNotas > 0) {
        noDataElement.style.display = 'none';
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
                    legend: { position: 'right' }
                }
            }
        });
    } else {
        noDataElement.style.display = 'block';
    }
}

// Inicializar el dashboard
function inicializarDashboard() {
    if (window.tendenciasChart && typeof window.tendenciasChart.destroy === 'function') {
        window.tendenciasChart.destroy();
    }
    if (window.tendenciasBarrasChart && typeof window.tendenciasBarrasChart.destroy === 'function') {
        window.tendenciasBarrasChart.destroy();
    }
    if (window.actividadPieChart && typeof window.actividadPieChart.destroy === 'function') {
        window.actividadPieChart.destroy();
    }
    crearGraficoTendencias();
    crearGraficoBarrasTendencias();
    crearGraficoActividadPie();
}

document.addEventListener('DOMContentLoaded', inicializarDashboard); 