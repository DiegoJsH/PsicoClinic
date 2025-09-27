// API Configuration
const API_BASE_URL = 'http://localhost:8080';

// API Service para Personal
class PersonalService {
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

    static getAllPersonal() { return this.request('/personal'); }
    static getPersonalById(id) { return this.request(`/personal/${id}`); }
    static createPersonal(data) { return this.request('/personal', { method: 'POST', body: JSON.stringify(data) }); }
    static updatePersonal(id, data) { return this.request(`/personal/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    static deletePersonal(id) { return this.request(`/personal/${id}`, { method: 'DELETE' }); }
    static searchPersonalByNombre(nombre) { 
        return this.request(`/personal/query?nombre=${encodeURIComponent(nombre)}`); 
    }
}

// Utilidades
const iniciales = (p) => (p.nombre?.[0] || '') + (p.apellido?.[0] || '');

// Calcular cuántos nuevos personal ingresaron este mes
const calcularNuevosEsteMes = (personalList) => {
    const hoy = new Date();
    return personalList.filter(p => {
        const fecha = new Date(p.fechaCreacion || Date.now()); // si no tienes fechaCreacion, ajusta
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;
};

// Función principal de carga
async function loadPersonal() {
    try {
        const personalList = await PersonalService.getAllPersonal();
        displayPersonal(personalList);
        updateEstadisticasPersonal(personalList);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar personal. Verifique la conexión al servidor.');
    }
}

// Actualizar estadísticas
function updateEstadisticasPersonal(personalList) {
    document.getElementById('totalStaff').textContent = personalList.length;
    document.getElementById('nuevosStaffEsteMes').textContent = calcularNuevosEsteMes(personalList);
}

// Mostrar personal en tabla
function displayPersonal(personalList) {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;

    tbody.innerHTML = personalList.map(p => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar me-3">${iniciales(p)}</div>
                    <div>
                        <div class="fw-semibold">${p.nombre} ${p.apellido}</div>
                        <small class="text-muted">ID: ${p.id}</small>
                    </div>
                </div>
            </td>
            <td>${p.numeroDni || 'N/A'}</td>
            <td>${p.email || 'N/A'}</td>
            <td>${p.telefono || 'N/A'}</td>
            <td>${p.especialidad || 'N/A'}</td>
            <td>${p.genero || 'N/A'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button onclick="editPersonal(${p.id})" class="btn btn-outline-secondary" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deletePersonalById(${p.id})" class="btn btn-outline-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Eliminar personal
async function deletePersonalById(id) {
    if (!confirm('¿Eliminar este personal?')) return;
    try {
        await PersonalService.deletePersonal(id);
        alert('Personal eliminado');
        loadPersonal();
    } catch (error) {
        alert('Error al eliminar');
    }
}

// Guardar nuevo personal
async function guardarNuevoPersonal() {
    try {
        const personal = {
            nombre: document.getElementById('staffFirstName').value,
            apellido: document.getElementById('staffLastName').value,
            numeroDni: document.getElementById('staffDni').value,
            email: document.getElementById('staffEmail').value,
            telefono: document.getElementById('staffPhone').value,
            especialidad: document.getElementById('staffEspecialidad').value,
            genero: document.getElementById('staffGenero').value,
            numeroLicencia: document.getElementById('staffLicencia').value,
            lugarEstudio: document.getElementById('staffLugarEstudio').value
        };

        if (!personal.nombre || !personal.apellido) {
            return alert('Nombre y apellido son requeridos');
        }

        await PersonalService.createPersonal(personal);

        // Cerrar modal y limpiar
        bootstrap.Modal.getInstance(document.getElementById('newStaffModal')).hide();
        [
            'staffFirstName','staffLastName','staffDni','staffEmail',
            'staffPhone','staffEspecialidad','staffGenero',
            'staffLicencia','staffLugarEstudio'
        ].forEach(id => document.getElementById(id).value = '');

        loadPersonal();
        alert('Personal agregado correctamente');
    } catch (error) {
        alert('Error al guardar personal');
    }
}

// Editar personal (placeholder)
function editPersonal(id) {
    alert(`Editar personal ${id} - No implementado aún`);
}

// Búsqueda con debounce
let searchTimeout;
function buscarPersonal() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const term = document.getElementById('searchStaffInput').value.trim();
        try {
            const personalList = term === '' 
                ? await PersonalService.getAllPersonal()
                : await PersonalService.searchPersonalByNombre(term);
            displayPersonal(personalList);
        } catch (error) {
            alert('Error en búsqueda');
        }
    }, 300);
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadPersonal);
