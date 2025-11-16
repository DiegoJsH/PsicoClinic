// API Configuration
const API_BASE_URL = 'http://localhost:8080';
//const API_BASE_URL = 'https://springbootpsicoclinic.onrender.com';

// API Service para Pacientes
class PacienteService {
    static async request(url, options = {}) {
        const token = sessionStorage.getItem('jwtToken');

        if (!token) {
            alert('Sesión expirada. Inicia sesión nuevamente.');
            window.location.href = 'index.html';
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` // <-- TOKEN JWT
        };

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                headers: headers,
                ...options
            });

            // --- Manejo de errores ---
            if (response.status === 401 || response.status === 403) {
                alert('Sesión expirada o token inválido. Por favor inicie sesión nuevamente.');
                sessionStorage.clear();
                window.location.href = 'index.html';
                return;
            }

            if (!response.ok)
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            // Si no tiene body
            if (response.status === 204) return null;

            // JSON o texto
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json'))
                return await response.json();

            return { message: await response.text() };

        } catch (error) {
            console.error('Error en request:', error);
            throw error;
        }
    }

    static getAllPacientes() { return this.request('/pacientes'); }
    static getPacienteById(id) { return this.request(`/pacientes/${id}`); }
    static createPaciente(data) {
        return this.request('/pacientes', { method: 'POST', body: JSON.stringify(data) });
    }
    static updatePaciente(id, data) {
        return this.request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    static deletePaciente(id) {
        return this.request(`/pacientes/${id}`, { method: 'DELETE' });
    }
    static searchPacientesByNombre(nombre) {
        return this.request(`/pacientes/query?nombre=${encodeURIComponent(nombre)}`);
    }
}

// Utilidades
const calcularEdad = (fecha) => {
    if (!fecha) return 'N/A';
    const hoy = new Date(), nacimiento = new Date(fecha);
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

// Cargar pacientes
async function loadPacientes() {
    try {
        const pacientes = await PacienteService.getAllPacientes();
        displayPacientes(pacientes);
        updateEstadisticas(pacientes);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        alert(`Error al cargar pacientes: ${error.message}`);
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
    if (!confirm('¿Está seguro de eliminar este paciente?')) return;

    try {
        const response = await PacienteService.deletePaciente(id);

        // Manejo flexible: si el backend devuelve texto o JSON
        const mensaje = response?.message || 'Paciente eliminado exitosamente';
        alert(mensaje);

        await loadPacientes();
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        alert('Error al eliminar paciente: ' + error.message);
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

        if (!paciente.nombre || !paciente.apellido) return alert('Nombre y apellido son requeridos');

        await PacienteService.createPaciente(paciente);
        
        bootstrap.Modal.getInstance(document.getElementById('newPatientModal')).hide();
        ['firstName', 'lastName', 'birthDate', 'gender', 'phone', 'email']
            .forEach(id => document.getElementById(id).value = '');
        
        loadPacientes();
        alert('Paciente creado');
    } catch (error) {
        alert('Error al crear paciente');
    }
}

// Editar paciente
async function editPaciente(id) {
    try {
        const paciente = await PacienteService.getPacienteById(id);
        
        const fechaFormateada = paciente.fechaNacimiento ? paciente.fechaNacimiento.split('T')[0] : '';
        
        document.getElementById('editPatientId').value = paciente.id;
        document.getElementById('editFirstName').value = paciente.nombre || '';
        document.getElementById('editLastName').value = paciente.apellido || '';
        document.getElementById('editBirthDate').value = fechaFormateada;
        document.getElementById('editGender').value = paciente.genero || '';
        document.getElementById('editPhone').value = paciente.telefono || '';
        document.getElementById('editEmail').value = paciente.email || '';
        
        new bootstrap.Modal(document.getElementById('editPatientModal')).show();
    } catch (error) {
        console.error('Error al cargar paciente:', error);
        alert('Error al cargar los datos del paciente: ' + error.message);
    }
}

// Guardar edición
async function guardarEdicionPaciente() {
    try {
        const id = document.getElementById('editPatientId').value;
        const paciente = {
            nombre: document.getElementById('editFirstName').value,
            apellido: document.getElementById('editLastName').value,
            fechaNacimiento: document.getElementById('editBirthDate').value,
            genero: document.getElementById('editGender').value,
            telefono: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value
        };

        if (!paciente.nombre || !paciente.apellido) return alert('Nombre y apellido son requeridos');

        await PacienteService.updatePaciente(id, paciente);
        bootstrap.Modal.getInstance(document.getElementById('editPatientModal')).hide();
        await loadPacientes();
        alert('Paciente actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        alert('Error al actualizar paciente: ' + error.message);
    }
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
