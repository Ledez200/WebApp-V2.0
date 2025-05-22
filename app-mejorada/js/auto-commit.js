/**
 * Script para automatizar commits y pushes a GitHub
 */

const AutoCommit = {
    // Estado del módulo
    state: {
        ultimoCommit: null,
        intervalo: 5 * 60 * 1000, // 5 minutos
        timer: null
    },

    // Inicializar
    init() {
        console.log('Iniciando sistema de auto-commit...');
        this.iniciarTimer();
        
        // Escuchar cambios en el almacenamiento local
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('db_')) {
                this.detectarCambios();
            }
        });
    },

    // Iniciar timer para verificar cambios periódicamente
    iniciarTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        
        this.state.timer = setInterval(() => {
            this.detectarCambios();
        }, this.state.intervalo);
    },

    // Detectar cambios y hacer commit si es necesario
    async detectarCambios() {
        try {
            // Obtener estado actual del repositorio
            const { stdout: status } = await this.ejecutarComando('git status --porcelain');
            
            if (status.trim()) {
                console.log('Cambios detectados, preparando commit...');
                await this.hacerCommit();
            }
        } catch (error) {
            console.error('Error al detectar cambios:', error);
        }
    },

    // Hacer commit de los cambios
    async hacerCommit() {
        try {
            // Agregar todos los cambios
            await this.ejecutarComando('git add .');
            
            // Crear mensaje de commit con fecha y hora
            const fecha = new Date().toLocaleString('es-ES');
            const mensaje = `Actualización automática: ${fecha}`;
            
            // Hacer commit
            await this.ejecutarComando(`git commit -m "${mensaje}"`);
            
            // Hacer push
            await this.ejecutarComando('git push origin main');
            
            console.log('Cambios subidos exitosamente a GitHub');
            this.state.ultimoCommit = new Date();
            
            // Mostrar notificación
            UI.mostrarNotificacion('Cambios guardados en GitHub', 'success');
        } catch (error) {
            console.error('Error al hacer commit:', error);
            UI.mostrarNotificacion('Error al guardar cambios en GitHub', 'error');
        }
    },

    // Ejecutar comando git
    ejecutarComando(comando) {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            exec(comando, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ stdout, stderr });
            });
        });
    },

    // Detener el sistema de auto-commit
    detener() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en un entorno de producción
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        AutoCommit.init();
    }
}); 