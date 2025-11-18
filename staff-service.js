//const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = "https://springbootpsicoclinic.onrender.com";
// API Service para Personal
class PersonalService {
  static async request(url, options = {}) {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
      alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
      window.location.href = "index.html";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...options,
      });

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      if (response.status === 204 || !response.headers.get("content-type"))
        return null;

      return response.headers.get("content-type")?.includes("json")
        ? response.json()
        : response.text();
    } catch (error) {
      console.error("Error en request:", error);
      throw error;
    }
  }

  static getAllPersonal() {
    return this.request("/personal");
  }
  static getPersonalById(id) {
    return this.request(`/personal/${id}`);
  }
  static createPersonal(data) {
    return this.request("/personal", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  static updatePersonal(id, data) {
    return this.request(`/personal/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  static deletePersonal(id) {
    return this.request(`/personal/${id}`, { method: "DELETE" });
  }
  static searchPersonalByNombre(nombre) {
    return this.request(`/personal/query?nombre=${encodeURIComponent(nombre)}`);
  }
}
// Utilidades
const iniciales = (p) => (p.nombre?.[0] || "") + (p.apellido?.[0] || "");

const calcularNuevosEsteMes = (personalList) => {
  const hoy = new Date();
  return personalList.filter((p) => {
    const fecha = new Date(p.fechaCreacion || Date.now());
    return (
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }).length;
};

// Cargar personal
async function loadPersonal() {
  try {
    const personalList = await PersonalService.getAllPersonal();
    displayPersonal(personalList);
    updateEstadisticasPersonal(personalList);
  } catch (error) {
    console.error("Error al cargar personal:", error);
    alert(`Error al cargar personal: ${error.message}`);
  }
}

// Actualizar estadísticas
function updateEstadisticasPersonal(personalList) {
  document.getElementById("totalStaff").textContent = personalList.length;
  document.getElementById("nuevosStaffEsteMes").textContent =
    calcularNuevosEsteMes(personalList);
}

// Mostrar personal en tabla
function displayPersonal(personalList) {
  const tbody = document.getElementById("staffTableBody");
  if (!tbody) return;

  tbody.innerHTML = personalList
    .map(
      (p) => `
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
            <td>${p.numeroDni || "N/A"}</td>
            <td>${p.email || "N/A"}</td>
            <td>${p.telefono || "N/A"}</td>
            <td>${p.especialidad || "N/A"}</td>
            <td>${p.genero || "N/A"}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button onclick="editPersonal(${
                      p.id
                    })" class="btn btn-outline-secondary" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deletePersonalById(${
                      p.id
                    })" class="btn btn-outline-danger" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

// Eliminar personal
async function deletePersonalById(id) {
  if (!confirm("¿Eliminar este personal?")) return;
  try {
    await PersonalService.deletePersonal(id);
    await loadPersonal();
    alert("Personal eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar personal:", error);
    alert("Error al eliminar personal: " + error.message);
  }
}

// Guardar nuevo personal
async function guardarNuevoPersonal() {
  try {
    const personal = {
      nombre: document.getElementById("staffFirstName").value,
      apellido: document.getElementById("staffLastName").value,
      numeroDni: document.getElementById("staffDni").value,
      email: document.getElementById("staffEmail").value,
      telefono: document.getElementById("staffPhone").value,
      especialidad: document.getElementById("staffEspecialidad").value,
      genero: document.getElementById("staffGenero").value,
      numeroLicencia: document.getElementById("staffLicencia").value,
      lugarEstudio: document.getElementById("staffLugarEstudio").value,
    };

    if (!personal.nombre || !personal.apellido) {
      return alert("Nombre y apellido son requeridos");
    }

    await PersonalService.createPersonal(personal);

    // Cerrar modal y limpiar
    bootstrap.Modal.getInstance(
      document.getElementById("newStaffModal")
    ).hide();
    [
      "staffFirstName",
      "staffLastName",
      "staffDni",
      "staffEmail",
      "staffPhone",
      "staffEspecialidad",
      "staffGenero",
      "staffLicencia",
      "staffLugarEstudio",
    ].forEach((id) => (document.getElementById(id).value = ""));

    loadPersonal();
    alert("Personal agregado correctamente");
  } catch (error) {
    alert("Error al guardar personal");
  }
}

// Editar personal
async function editPersonal(id) {
  try {
    const personal = await PersonalService.getPersonalById(id);

    document.getElementById("editStaffId").value = personal.id;
    document.getElementById("editStaffFirstName").value = personal.nombre || "";
    document.getElementById("editStaffLastName").value =
      personal.apellido || "";
    document.getElementById("editStaffGenero").value = personal.genero || "";
    document.getElementById("editStaffDni").value = personal.numeroDni || "";
    document.getElementById("editStaffEmail").value = personal.email || "";
    document.getElementById("editStaffPhone").value = personal.telefono || "";
    document.getElementById("editStaffEspecialidad").value =
      personal.especialidad || "";
    document.getElementById("editStaffLicencia").value =
      personal.numeroLicencia || "";
    document.getElementById("editStaffLugarEstudio").value =
      personal.lugarEstudio || "";

    new bootstrap.Modal(document.getElementById("editStaffModal")).show();
  } catch (error) {
    console.error("Error al cargar personal:", error);
    alert("Error al cargar los datos del personal: " + error.message);
  }
}

// Guardar edición
async function guardarEdicionPersonal() {
  try {
    const id = document.getElementById("editStaffId").value;
    const personal = {
      nombre: document.getElementById("editStaffFirstName").value,
      apellido: document.getElementById("editStaffLastName").value,
      numeroDni: document.getElementById("editStaffDni").value,
      email: document.getElementById("editStaffEmail").value,
      telefono: document.getElementById("editStaffPhone").value,
      especialidad: document.getElementById("editStaffEspecialidad").value,
      genero: document.getElementById("editStaffGenero").value,
      numeroLicencia: document.getElementById("editStaffLicencia").value,
      lugarEstudio: document.getElementById("editStaffLugarEstudio").value,
    };

    if (!personal.nombre || !personal.apellido)
      return alert("Nombre y apellido son requeridos");

    await PersonalService.updatePersonal(id, personal);
    bootstrap.Modal.getInstance(
      document.getElementById("editStaffModal")
    ).hide();
    await loadPersonal();
    alert("Personal actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar personal:", error);
    alert("Error al actualizar personal: " + error.message);
  }
}

// Búsqueda con debounce
let searchTimeout;
function buscarPersonal() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const term = document.getElementById("searchStaffInput").value.trim();
    try {
      const personalList =
        term === ""
          ? await PersonalService.getAllPersonal()
          : await PersonalService.searchPersonalByNombre(term);
      displayPersonal(personalList);
    } catch (error) {
      alert("Error en búsqueda");
    }
  }, 300);
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", loadPersonal);
