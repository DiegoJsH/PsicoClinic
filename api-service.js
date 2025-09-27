// API Configuration
const API_BASE_URL = 'https://springbootpsicoclinic.onrender.com';

// API Service simplificado para Pacientes
class PacienteService {
    static async request(url, options = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.headers.get('content-type')?.includes('json') 
            ? response.json() 
            : response.text();
    }

    static getAllPacientes() { return this.request('/pacientes'); }
    static getPacienteById(id) { return this.request(`/pacientes/${id}`); }
    static createPaciente(data) { return this.request('/pacientes', { method: 'POST', body: JSON.stringify(data) }); }
    static updatePaciente(id, data) { return this.request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    static deletePaciente(id) { return this.request(`/pacientes/${id}`, { method: 'DELETE' }); }
    static searchPacientesByNombre(nombre) { return this.request(`/pacientes/query?nombre=${encodeURIComponent(nombre)}`); }
}

// Utilidades
const calcularEdad = (fecha) => {
    if (!fecha) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
};

const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'N/A';

const calcularNuevosEsteMes = (pacientes) => {
    const hoy = new Date();
    return pacientes.filter(p => {
        const fecha = new Date(p.fechaCreacion || p.fechaNacimiento);
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;
};

// Función principal de carga
async function loadPacientes() {
    try {
        const pacientes = await PacienteService.getAllPacientes();
        displayPacientes(pacientes);
        updateEstadisticas(pacientes);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar pacientes. Verifique la conexión al servidor.');
    }
}

// Actualizar estadísticas
function updateEstadisticas(pacientes) {
    document.getElementById('totalPacientes').textContent = pacientes.length;
    document.getElementById('nuevosEsteMes').textContent = calcularNuevosEsteMes(pacientes);
}

// Mostrar pacientes en tabla
function displayPacientes(pacientes) {
    const tbody = document.getElementById('pacientesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = pacientes.map(p => {
        const iniciales = (p.nombre?.[0] || '') + (p.apellido?.[0] || '');
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-3">${iniciales}</div>
                        <div>
                            <div class="fw-semibold">${p.nombre} ${p.apellido}</div>
                            <small class="text-muted">ID: ${p.id}</small>
                        </div>
                    </div>
                </td>
                <td>${calcularEdad(p.fechaNacimiento)} años</td>
                <td>${p.telefono || 'N/A'}</td>
                <td>${p.email || 'N/A'}</td>
                <td>${formatearFecha(p.fechaNacimiento)}</td>
                <td>${p.genero || 'N/A'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button onclick="editPaciente(${p.id})" class="btn btn-outline-secondary" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deletePacienteById(${p.id})" class="btn btn-outline-danger" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Eliminar paciente
async function deletePacienteById(id) {
    if (!confirm('¿Eliminar este paciente?')) return;
    try {
        await PacienteService.deletePaciente(id);
        alert('Paciente eliminado');
        loadPacientes();
    } catch (error) {
        alert('Error al eliminar');
    }
}

// Guardar nuevo paciente
async function guardarNuevoPaciente() {
    try {
        const paciente = {
            nombre: document.getElementById('firstName').value,
            apellido: document.getElementById('lastName').value,
            fechaNacimiento: document.getElementById('birthDate').value,
            genero: document.getElementById('gender').value,
            telefono: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };

        if (!paciente.nombre || !paciente.apellido) {
            return alert('Nombre y apellido son requeridos');
        }

        await PacienteService.createPaciente(paciente);
        
        // Cerrar modal y limpiar
        bootstrap.Modal.getInstance(document.getElementById('newPatientModal')).hide();
        ['firstName', 'lastName', 'birthDate', 'gender', 'phone', 'email']
            .forEach(id => document.getElementById(id).value = '');
        
        loadPacientes();
        alert('Paciente creado');
    } catch (error) {
        alert('Error al crear paciente');
    }
}

// Editar paciente (placeholder)
function editPaciente(id) {
    alert(`Editar paciente ${id} - No implementado`);
}

// Búsqueda con debounce
let searchTimeout;
function buscarPacientes() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const term = document.getElementById('searchInput').value.trim();
        try {
            const pacientes = term === '' 
                ? await PacienteService.getAllPacientes()
                : await PacienteService.searchPacientesByNombre(term);
            displayPacientes(pacientes);
        } catch (error) {
            alert('Error en búsqueda');
        }
    }, 300);
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadPacientes);