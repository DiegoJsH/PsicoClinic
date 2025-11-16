// ===============================
// CONFIGURACIÓN BASE
// ===============================
const URL_BASE = 'https://springbootpsicoclinic.onrender.com';
//const API_BASE_URL = 'http://localhost:8080';

// ===============================
// SERVICIO DE CITAS
// ===============================
class ServicioCitas {
    static async obtenerTodas() {
        const respuesta = await fetch(`${URL_BASE}/citas`);
        if (!respuesta.ok) throw new Error('Error al obtener citas');
        return respuesta.json();
    }
}

// ===============================
// FUNCIONES DE REPORTE
// ===============================
async function cargarReporte() {
    try {
        const citas = await ServicioCitas.obtenerTodas();

        // Total de citas
        const totalCitas = citas.length;
        document.getElementById('totalCitasReporte').textContent = totalCitas;

        // Ingresos estimados (50 USD por cita)
        const ingresos = totalCitas * 50;
        document.getElementById('ingresosReporte').textContent = `$${ingresos.toLocaleString()}`;

        // Citas por especialista
        const citasPorEspecialista = {};
        citas.forEach(c => {
            const nombre = c.especialista?.nombre || 'Sin Nombre';
            citasPorEspecialista[nombre] = (citasPorEspecialista[nombre] || 0) + 1;
        });

        const contenedorEsp = document.getElementById('citasPorEspecialista');
        contenedorEsp.innerHTML = '';
        for (const [nombre, cantidad] of Object.entries(citasPorEspecialista)) {
            const porcentaje = ((cantidad / totalCitas) * 100).toFixed(1);
            const div = document.createElement('div');
            div.classList.add('mb-2');
            div.innerHTML = `
                <strong>${nombre}</strong> - ${cantidad} citas (${porcentaje}%)
                <div class="progress">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            `;
            contenedorEsp.appendChild(div);
        }

        // Distribución por tipo de cita
        const tiposCita = {};
        citas.forEach(c => {
            const tipo = c.tipoCita || 'Otro';
            tiposCita[tipo] = (tiposCita[tipo] || 0) + 1;
        });

        const contenedorTipo = document.getElementById('tiposDeCita');
        contenedorTipo.innerHTML = '';
        for (const [tipo, cantidad] of Object.entries(tiposCita)) {
            const porcentaje = ((cantidad / totalCitas) * 100).toFixed(1);
            const div = document.createElement('div');
            div.classList.add('mb-2');
            div.innerHTML = `
                <strong>${tipo}</strong> - ${cantidad} citas (${porcentaje}%)
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            `;
            contenedorTipo.appendChild(div);
        }

    } catch (error) {
        console.error('Error al cargar el reporte:', error);
    }
}

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', cargarReporte);
