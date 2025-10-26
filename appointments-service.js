// API Configuration
//const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = 'https://springbootpsicoclinic.onrender.com';

// API Service para Citas
class CitasService {
    static async request(url, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                ...options
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            return response.headers.get('content-type')?.includes('json') ? response.json() : response.text();
        } catch (error) {
            console.error('Error en request:', error);
            throw error;
        }
    }

    static getAllCitas() { return this.request('/citas'); }
    static createCita(data) { return this.request('/citas', { method: 'POST', body: JSON.stringify(data) }); }
    static getCitaById(id) { return this.request(`/citas/${id}`); }
    static updateCita(id, data) { return this.request(`/citas/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    static deleteCita(id) { return this.request(`/citas/${id}`, { method: 'DELETE' }); }
    static getCitasByPaciente(pacienteId) { return this.request(`/citas/paciente/${pacienteId}`); }
    static getCitasByEspecialista(especialistaId) { return this.request(`/citas/especialista/${especialistaId}`); }
    static getCitasByFecha(fecha) { return this.request(`/citas/fecha/${fecha}`); }
    static getCitasByEstado(estado) { return this.request(`/citas/estado/${estado}`); }
    static getCitasByEspecialistaAndFecha(especialistaId, fecha) { 
        return this.request(`/citas/especialista/${especialistaId}/fecha/${fecha}`); 
    }
}

// API Service para Pacientes (para cargar en selects)
class PacienteServiceCitas {
    static async getAllPacientes() {
        const response = await fetch(`${API_BASE_URL}/pacientes`);
        if (!response.ok) throw new Error('Error al cargar pacientes');
        return response.json();
    }
}

// API Service para Personal (para cargar en selects)
class PersonalServiceCitas {
    static async getAllPersonal() {
        const response = await fetch(`${API_BASE_URL}/personal`);
        if (!response.ok) throw new Error('Error al cargar personal');
        return response.json();
    }
}

// Utilidades
const getEstadoBadgeClass = (estado) => {
    const estados = {
        'Completada': 'bg-success',
        'Pendiente': 'bg-warning',
        'Programada': 'bg-primary',
        'Cancelada': 'bg-danger',
        'Confirmada': 'bg-info'
    };
    return estados[estado] || 'bg-secondary';
};

// Calcular estadísticas
const calcularEstadisticas = (citas) => {
    const hoy = new Date().toISOString().split('T')[0]; // Formato: "2025-10-24"
    
    return {
        citasHoy: citas.filter(c => c.fecha === hoy).length,
        completadas: citas.filter(c => c.estado === 'Completada').length,
        pendientes: citas.filter(c => c.estado === 'Pendiente').length,
        canceladas: citas.filter(c => c.estado === 'Cancelada').length
    };
};

// Variables globales
let todasLasCitas = [];

// Cargar datos para los selects del modal
async function cargarDatosModal() {
    try {
        const [pacientes, personal] = await Promise.all([
            PacienteServiceCitas.getAllPacientes(),
            PersonalServiceCitas.getAllPersonal()
        ]);
        
        const pacienteSelect = document.getElementById('patientSelect');
        if (pacienteSelect) {
            pacienteSelect.innerHTML = '<option value="">Seleccionar paciente...</option>' +
                pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} (ID: ${p.id})</option>`).join('');
        }

        const doctorSelect = document.getElementById('doctorSelect');
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Seleccionar especialista...</option>' +
                personal.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} - ${p.especialidad || 'Especialista'} (ID: ${p.id})</option>`).join('');
        }
    } catch (error) {
        console.error('Error al cargar datos del modal:', error);
        alert('Error al cargar pacientes y especialistas');
    }
}

// Cargar citas
async function loadCitas() {
    try {
        todasLasCitas = await CitasService.getAllCitas();
        displayCitas(todasLasCitas);
        updateEstadisticas(todasLasCitas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
        alert(`Error al cargar citas: ${error.message}`);
    }
}

// Actualizar estadísticas
function updateEstadisticas(citas) {
    const stats = calcularEstadisticas(citas);
    
    document.getElementById("citasHoy").textContent = citas.length;
    document.getElementById('citasCompletadas').textContent = stats.completadas;
    document.getElementById('citasPendientes').textContent = stats.pendientes;
    document.getElementById('citasCanceladas').textContent = stats.canceladas;
}

// Mostrar citas en tabla
function displayCitas(citas) {
    const tbody = document.getElementById('citasTableBody');
    if (!tbody) return;
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay citas para mostrar</td></tr>';
        return;
    }
    
    tbody.innerHTML = citas.map(c => {
        // Adaptar a la estructura del backend (paciente y especialista son objetos)
        const paciente = c.paciente || {};
        const especialista = c.especialista || {};
        const inicialesPaciente = (paciente.nombre?.[0] || 'P') + (paciente.apellido?.[0] || 'X');
        const inicialesEspecialista = (especialista.nombre?.[0] || 'E') + (especialista.apellido?.[0] || 'S');
        
        return `
            <tr>
                <td>
                    <div class="fw-semibold">${c.hora || 'N/A'}</div>
                    <small class="text-muted">${c.fecha || 'N/A'}</small>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-2">${inicialesPaciente}</div>
                        <div>
                            <div class="fw-semibold">${paciente.nombre || 'N/A'} ${paciente.apellido || ''}</div>
                            <small class="text-muted">ID: ${paciente.id || 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-2">${inicialesEspecialista}</div>
                        <div>
                            <div class="fw-semibold">${especialista.nombre || 'N/A'} ${especialista.apellido || ''}</div>
                            <small class="text-muted">ID: ${especialista.id || 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>${c.tipoCita || 'Consulta General'}</td>
                <td><span class="badge ${getEstadoBadgeClass(c.estado)}">${c.estado || 'Pendiente'}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button onclick="viewCita(${c.id})" class="btn btn-outline-primary" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button onclick="editCita(${c.id})" class="btn btn-outline-secondary" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteCitaById(${c.id})" class="btn btn-outline-danger" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Eliminar cita
async function deleteCitaById(id) {
    if (!confirm('¿Está seguro de eliminar esta cita?')) return;
    try {
        await CitasService.deleteCita(id);
        alert('Cita eliminada exitosamente');
        loadCitas();
    } catch (error) {
        alert('Error al eliminar la cita');
    }
}

// Guardar nueva cita
async function guardarNuevaCita() {
    try {
        const pacienteId = parseInt(document.getElementById('patientSelect').value);
        const especialistaId = parseInt(document.getElementById('doctorSelect').value);
        const fecha = document.getElementById('appointmentDate').value;
        const hora = document.getElementById('appointmentTime').value;
        const tipoCita = document.getElementById('appointmentType').value;
        const notas = document.getElementById('appointmentNotes').value;

        if (!pacienteId || !especialistaId || !fecha || !hora) {
            return alert('Paciente, Especialista, Fecha y Hora son requeridos');
        }

        // Estructura que coincide con CitaModel del backend
        const cita = {
            paciente: {
                id: pacienteId
            },
            especialista: {
                id: especialistaId
            },
            fecha: fecha,
            hora: hora,
            tipoCita: tipoCita || 'Consulta General',
            estado: 'Programada',
            notas: notas || null
        };

        await CitasService.createCita(cita);
        
        bootstrap.Modal.getInstance(document.getElementById('newAppointmentModal')).hide();
        ['patientSelect', 'doctorSelect', 'appointmentDate', 'appointmentTime', 'appointmentType', 'appointmentNotes']
            .forEach(id => document.getElementById(id).value = '');
        
        loadCitas();
        alert('Cita creada exitosamente');
    } catch (error) {
        console.error('Error al crear cita:', error);
        alert('Error al crear la cita: ' + error.message);
    }
}

// Ver detalles de cita
async function viewCita(id) {
    try {
        const cita = await CitasService.getCitaById(id);
        const paciente = cita.paciente || {};
        const especialista = cita.especialista || {};
        
        alert(`Detalles de la Cita:\n\nPaciente: ${paciente.nombre} ${paciente.apellido}\nEspecialista: ${especialista.nombre} ${especialista.apellido}\nFecha: ${cita.fecha}\nHora: ${cita.hora}\nTipo: ${cita.tipoCita}\nEstado: ${cita.estado}\nNotas: ${cita.notas || 'Sin notas'}`);
    } catch (error) {
        alert('Error al obtener detalles de la cita');
    }
}

// Editar cita (placeholder mejorado)
function editCita(id) {
    alert(`Función de edición para cita ${id} - Próximamente implementado`);
}

// Búsqueda simple (sin filtros complejos)
let searchTimeout;
function buscarCitas() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = document.getElementById('searchInput').value.trim().toLowerCase();
        
        if (term === '') {
            displayCitas(todasLasCitas);
            updateEstadisticas(todasLasCitas);
            return;
        }
        
        const citasFiltradas = todasLasCitas.filter(c => {
            const paciente = c.paciente || {};
            const especialista = c.especialista || {};
            
            return (
                (paciente.nombre?.toLowerCase().includes(term)) ||
                (paciente.apellido?.toLowerCase().includes(term)) ||
                (especialista.nombre?.toLowerCase().includes(term)) ||
                (especialista.apellido?.toLowerCase().includes(term)) ||
                (c.tipoCita?.toLowerCase().includes(term)) ||
                (c.estado?.toLowerCase().includes(term))
            );
        });
        
        displayCitas(citasFiltradas);
        updateEstadisticas(citasFiltradas);
    }, 300);
}

// Aplicar filtros desde el modal
async function aplicarFiltrosModal() {
    const estado = document.getElementById('estadoFilterModal').value;
    const fecha = document.getElementById('fechaFilterModal').value;
    const paciente = document.getElementById('pacienteFilterModal').value;
    const especialista = document.getElementById('especialistaFilterModal').value;
    
    try {
        let citas = todasLasCitas;
        
        // Filtrar por estado
        if (estado && estado !== 'todos') {
            citas = await CitasService.getCitasByEstado(estado);
        }
        
        // Filtrar por fecha
        if (fecha) {
            citas = await CitasService.getCitasByFecha(fecha);
        }
        
        // Filtrar por paciente
        if (paciente) {
            citas = await CitasService.getCitasByPaciente(paciente);
        }
        
        // Filtrar por especialista
        if (especialista) {
            citas = await CitasService.getCitasByEspecialista(especialista);
        }
        
        // Filtro combinado: especialista + fecha
        if (especialista && fecha) {
            citas = await CitasService.getCitasByEspecialistaAndFecha(especialista, fecha);
        }
        
        displayCitas(citas);
        updateEstadisticas(citas);
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        alert('Error al filtrar citas');
    }
}

// Limpiar filtros del modal
function limpiarFiltrosModal() {
    if (document.getElementById('estadoFilterModal')) document.getElementById('estadoFilterModal').value = 'todos';
    if (document.getElementById('fechaFilterModal')) document.getElementById('fechaFilterModal').value = '';
    if (document.getElementById('pacienteFilterModal')) document.getElementById('pacienteFilterModal').value = '';
    if (document.getElementById('especialistaFilterModal')) document.getElementById('especialistaFilterModal').value = '';
    
    displayCitas(todasLasCitas);
    updateEstadisticas(todasLasCitas);
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadCitas();
    cargarDatosModal();
});
