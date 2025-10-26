// ===============================
// CONFIGURACIÓN BASE
// ===============================
const URL_BASE = 'https://springbootpsicoclinic.onrender.com';

// ===============================
// SERVICIOS API
// ===============================
class ServicioCitas {
    static async obtenerTodas() {
        const respuesta = await fetch(`${URL_BASE}/citas`);
        if (!respuesta.ok) throw new Error('Error al obtener citas');
        return respuesta.json();
    }
}

class ServicioPacientes {
    static async obtenerTodos() {
        const respuesta = await fetch(`${URL_BASE}/pacientes`);
        if (!respuesta.ok) throw new Error('Error al obtener pacientes');
        return respuesta.json();
    }
}

class ServicioPersonal {
    static async obtenerTodos() {
        const respuesta = await fetch(`${URL_BASE}/personal`);
        if (!respuesta.ok) throw new Error('Error al obtener personal');
        return respuesta.json();
    }
}

// ===============================
// FUNCIONES PRINCIPALES
// ===============================

// Mostrar el total de pacientes registrados
async function cargarTotalPacientes() {
    try {
        const pacientes = await ServicioPacientes.obtenerTodos();
        const elemento = document.getElementById('totalPacientesdash');
        if (elemento) elemento.textContent = pacientes.length;

        agregarAlerta('info', `Hay ${pacientes.length} pacientes registrados actualmente.`);
        agregarActividad('Actualización de pacientes');
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

// Mostrar el total de personal (especialistas)
async function cargarTotalPersonal() {
    try {
        const personal = await ServicioPersonal.obtenerTodos();
        const elemento = document.getElementById('totalPersonaldash');
        if (elemento) elemento.textContent = personal.length;

        agregarActividad('Datos de personal actualizados');
    } catch (error) {
        console.error('Error al cargar personal:', error);
    }
}

// Mostrar el total de citas y las próximas citas
async function cargarCitas() {
    try {
        const citas = await ServicioCitas.obtenerTodas();
        const elementoTotal = document.getElementById('totalCitasdash');
        if (elementoTotal) elementoTotal.textContent = citas.length;

        mostrarProximasCitas(citas);
        agregarActividad('Citas cargadas correctamente');
    } catch (error) {
        console.error('Error al cargar citas:', error);
        agregarAlerta('warning', 'No se pudieron cargar las citas.');
    }
}


// ===============================
// MOSTRAR PRÓXIMAS CITAS
// ===============================
function mostrarProximasCitas(citas) {
    const contenedor = document.querySelector('#proximasCitasBody');
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiar el contenido anterior

    if (citas.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted">No hay citas programadas</p>';
        return;
    }

    // Ordenar por fecha y hora (más próximas primero)
    citas.sort((a, b) => {
        const fechaHoraA = new Date(`${a.fecha}T${a.hora}`);
        const fechaHoraB = new Date(`${b.fecha}T${b.hora}`);
        return fechaHoraA - fechaHoraB;
    });

    // Mostrar solo las próximas 5 citas
    const proximas = citas.slice(0, 5);

    proximas.forEach(cita => {
        const paciente = cita.paciente || {};
        const especialista = cita.especialista || {};

        const item = document.createElement('div');
        item.classList.add('appointment-item', 'mb-2');

        item.innerHTML = `
            <div class="appointment-time">${cita.hora || '—'}</div>
            <div class="appointment-details">
                <div class="appointment-patient">${paciente.nombre || 'Paciente'} ${paciente.apellido || ''}</div>
                <div class="appointment-type">${cita.tipoCita || 'Consulta'}</div>
            </div>
            <div class="appointment-doctor">${especialista.nombre || 'Especialista'} ${especialista.apellido || ''}</div>
        `;

        contenedor.appendChild(item);
    });
}

// ===============================
// SECCIÓN DE ALERTAS
// ===============================
function agregarAlerta(tipo, mensaje) {
    const contenedorAlertas = document.getElementById('alertasContainer');
    if (!contenedorAlertas) return;

    const tipoBootstrap = tipo === 'warning' ? 'alert-warning' :
                          tipo === 'info' ? 'alert-info' : 'alert-secondary';

    const alerta = document.createElement('div');
    alerta.classList.add('alert', tipoBootstrap, 'fade', 'show', 'py-2');
    alerta.setAttribute('role', 'alert');
    alerta.innerHTML = `<small><strong>${tipo === 'warning' ? 'Aviso:' : 'Info:'}</strong> ${mensaje}</small>`;

    contenedorAlertas.prepend(alerta);

    // Quitar alerta después de 6 segundos
    setTimeout(() => alerta.remove(), 6000);
}

// ===============================
// ACTIVIDAD RECIENTE
// ===============================
function agregarActividad(texto) {
    const contenedorActividad = document.getElementById('actividadReciente');
    if (!contenedorActividad) return;

    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const item = document.createElement('div');
    item.classList.add('activity-item', 'mb-2');
    item.innerHTML = `
        <div class="activity-time">${hora}</div>
        <div class="activity-text">${texto}</div>
    `;

    contenedorActividad.prepend(item);
}


// ===============================
// CALCULAR INGRESOS DEL MES
// ===============================
async function calcularIngresosMes() {
    try {
        const citas = await ServicioCitas.obtenerTodas();

        // Precio fijo por cita (puedes cambiarlo si deseas)
        const precioPorCita = 50;

        // 🔹 OPCIONAL: filtrar solo citas del mes actual
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        const citasDelMes = citas.filter(cita => {
            const fechaCita = new Date(cita.fecha);
            return (
                fechaCita.getMonth() === mesActual &&
                fechaCita.getFullYear() === anioActual
            );
        });

        // Calcular monto total
        const total = citasDelMes.length * precioPorCita;

        // Mostrar resultado en el dashboard
        const elemento = document.getElementById('ingresosMes');
        if (elemento) elemento.textContent = `$${total.toLocaleString()}`;

        agregarActividad(`Ingresos del mes actual: $${total}`);
    } catch (error) {
        console.error('Error al calcular ingresos:', error);
        agregarAlerta('warning', 'No se pudieron calcular los ingresos del mes.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    cargarTotalPacientes();
    cargarTotalPersonal();
    cargarCitas();
calcularIngresosMes()
});
