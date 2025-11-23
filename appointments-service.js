// API Service para Citas
class CitasService {
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

      return response.headers.get("content-type")?.includes("json")
        ? response.json()
        : response.text();
    } catch (error) {
      console.error("Error en request:", error);
      throw error;
    }
  }

  static getAllCitas() {
    return this.request("/citas");
  }
  static createCita(data) {
    return this.request("/citas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  static getCitaById(id) {
    return this.request(`/citas/${id}`);
  }
  static updateCita(id, data) {
    return this.request(`/citas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  static deleteCita(id) {
    return this.request(`/citas/${id}`, { method: "DELETE" });
  }
  static getCitasByPaciente(pacienteId) {
    return this.request(`/citas/paciente/${pacienteId}`);
  }
  static getCitasByEspecialista(especialistaId) {
    return this.request(`/citas/especialista/${especialistaId}`);
  }
  static getCitasByFecha(fecha) {
    return this.request(`/citas/fecha/${fecha}`);
  }
  static getCitasByEstado(estado) {
    return this.request(`/citas/estado/${estado}`);
  }
  static getCitasByEspecialistaAndFecha(especialistaId, fecha) {
    return this.request(`/citas/especialista/${especialistaId}/fecha/${fecha}`);
  }
}

// API Service para Pacientes (para cargar en selects)
class PacienteServiceCitas {
  static async getAllPacientes() {
    const token = sessionStorage.getItem("jwtToken");
    const response = await fetch(`${API_BASE_URL}/pacientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Error al cargar pacientes");
    return response.json();
  }
}

// API Service para Personal (para cargar en selects)
class PersonalServiceCitas {
  static async getAllPersonal() {
    const token = sessionStorage.getItem("jwtToken");
    const response = await fetch(`${API_BASE_URL}/personal`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Error al cargar personal");
    return response.json();
  }
}

// Utilidades
const getEstadoBadgeClass = (estado) => {
  const estados = {
    Completada: "bg-success",
    Pendiente: "bg-warning",
    Programada: "bg-primary",
    Cancelada: "bg-danger",
    Confirmada: "bg-info",
  };
  return estados[estado] || "bg-secondary";
};

// Calcular estadísticas
const calcularEstadisticas = (citas) => {
  const hoy = new Date().toISOString().split("T")[0]; // Formato: "2025-10-24"

  return {
    citasHoy: citas.filter((c) => c.fecha === hoy).length,
    completadas: citas.filter((c) => c.estado === "Completada").length,
    pendientes: citas.filter((c) => c.estado === "Pendiente").length,
    canceladas: citas.filter((c) => c.estado === "Cancelada").length,
  };
};

// Variables globales
let todasLasCitas = [];
let pacientesCache = null;
let personalCache = null;

// Cargar datos para los selects del modal (con cache)
async function cargarDatosModal() {
  try {
    // Solo cargar si no están en cache
    if (!pacientesCache || !personalCache) {
      [pacientesCache, personalCache] = await Promise.all([
        PacienteServiceCitas.getAllPacientes(),
        PersonalServiceCitas.getAllPersonal(),
      ]);
    }

    const pacienteSelect = document.getElementById("patientSelect");
    if (pacienteSelect) {
      pacienteSelect.innerHTML =
        '<option value="">Seleccionar paciente...</option>' +
        pacientesCache
          .map(
            (p) =>
              `<option value="${p.id}">${p.nombre} ${p.apellido} (ID: ${p.id})</option>`
          )
          .join("");
    }

    const doctorSelect = document.getElementById("doctorSelect");
    if (doctorSelect) {
      doctorSelect.innerHTML =
        '<option value="">Seleccionar especialista...</option>' +
        personalCache
          .map(
            (p) =>
              `<option value="${p.id}">${p.nombre} ${p.apellido} - ${
                p.especialidad || "Especialista"
              } (ID: ${p.id})</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("Error al cargar datos del modal:", error);
    alert("Error al cargar pacientes y especialistas");
  }
}

// Cargar citas
async function loadCitas() {
  try {
    todasLasCitas = await CitasService.getAllCitas();
    displayCitas(todasLasCitas);
    updateEstadisticas(todasLasCitas);
  } catch (error) {
    console.error("Error al cargar citas:", error);
    alert(`Error al cargar citas: ${error.message}`);
  }
}

// Actualizar estadísticas
function updateEstadisticas(citas) {
  const stats = calcularEstadisticas(citas);

  document.getElementById("citasHoy").textContent = citas.length;
  document.getElementById("citasCompletadas").textContent = stats.completadas;
  document.getElementById("citasPendientes").textContent = stats.pendientes;
  document.getElementById("citasCanceladas").textContent = stats.canceladas;
}

// Mostrar citas en tabla
function displayCitas(citas) {
  const tbody = document.getElementById("citasTableBody");
  if (!tbody) return;

  if (citas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center">No hay citas para mostrar</td></tr>';
    return;
  }

  tbody.innerHTML = citas
    .map((c) => {
      // Adaptar a la estructura del backend (paciente y especialista son objetos)
      const paciente = c.paciente || {};
      const especialista = c.especialista || {};
      const inicialesPaciente =
        (paciente.nombre?.[0] || "P") + (paciente.apellido?.[0] || "X");
      const inicialesEspecialista =
        (especialista.nombre?.[0] || "E") + (especialista.apellido?.[0] || "S");

      return `
            <tr>
                <td>
                    <div class="fw-semibold">${c.hora || "N/A"}</div>
                    <small class="text-muted">${c.fecha || "N/A"}</small>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-2">${inicialesPaciente}</div>
                        <div>
                            <div class="fw-semibold">${
                              paciente.nombre || "N/A"
                            } ${paciente.apellido || ""}</div>
                            <small class="text-muted">ID: ${
                              paciente.id || "N/A"
                            }</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-2">${inicialesEspecialista}</div>
                        <div>
                            <div class="fw-semibold">${
                              especialista.nombre || "N/A"
                            } ${especialista.apellido || ""}</div>
                            <small class="text-muted">ID: ${
                              especialista.id || "N/A"
                            }</small>
                        </div>
                    </div>
                </td>
                <td>${c.tipoCita || "Consulta General"}</td>
                <td><span class="badge ${getEstadoBadgeClass(c.estado)}">${
        c.estado || "Pendiente"
      }</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button onclick="viewCita(${
                          c.id
                        })" class="btn btn-outline-primary" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button onclick="editCita(${
                          c.id
                        })" class="btn btn-outline-secondary" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteCitaById(${
                          c.id
                        })" class="btn btn-outline-danger" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

// Eliminar cita
async function deleteCitaById(id) {
  if (!confirm("¿Está seguro de eliminar esta cita?")) return;
  try {
    await CitasService.deleteCita(id);
    alert("Cita eliminada exitosamente");
    loadCitas();
  } catch (error) {
    alert("Error al eliminar la cita");
  }
}

// Guardar nueva cita
async function guardarNuevaCita() {
  try {
    const pacienteId = parseInt(document.getElementById("patientSelect").value);
    const especialistaId = parseInt(
      document.getElementById("doctorSelect").value
    );
    const fecha = document.getElementById("appointmentDate").value;
    const hora = document.getElementById("appointmentTime").value;
    const tipoCita = document.getElementById("appointmentType").value;
    const notas = document.getElementById("appointmentNotes").value;

    if (!pacienteId || !especialistaId || !fecha || !hora) {
      return alert("Paciente, Especialista, Fecha y Hora son requeridos");
    }

    // Estructura que coincide con CitaModel del backend
    const cita = {
      paciente: {
        id: pacienteId,
      },
      especialista: {
        id: especialistaId,
      },
      fecha: fecha,
      hora: hora,
      tipoCita: tipoCita || "Consulta General",
      estado: "Programada",
      notas: notas || null,
    };

    await CitasService.createCita(cita);

    bootstrap.Modal.getInstance(
      document.getElementById("newAppointmentModal")
    ).hide();
    [
      "patientSelect",
      "doctorSelect",
      "appointmentDate",
      "appointmentTime",
      "appointmentType",
      "appointmentNotes",
    ].forEach((id) => (document.getElementById(id).value = ""));

    loadCitas();
    alert("Cita creada exitosamente");
  } catch (error) {
    console.error("Error al crear cita:", error);
    alert("Error al crear la cita: " + error.message);
  }
}

// Ver detalles de cita
async function viewCita(id) {
  try {
    const cita = await CitasService.getCitaById(id);
    const paciente = cita.paciente || {};
    const especialista = cita.especialista || {};

    alert(
      `Detalles de la Cita:\n\nPaciente: ${paciente.nombre} ${
        paciente.apellido
      }\nEspecialista: ${especialista.nombre} ${
        especialista.apellido
      }\nFecha: ${cita.fecha}\nHora: ${cita.hora}\nTipo: ${
        cita.tipoCita
      }\nEstado: ${cita.estado}\nNotas: ${cita.notas || "Sin notas"}`
    );
  } catch (error) {
    alert("Error al obtener detalles de la cita");
  }
}

async function editCita(id) {
  try {
    // Cargar combos primero
    await cargarPacientes();
    await cargarEspecialistas();

    const cita = await CitasService.getCitaById(id);
    console.log("Cita recibida:", cita);

    document.getElementById("editCitaId").value = cita.id;
    document.getElementById("editFecha").value = cita.fecha;
    document.getElementById("editHora").value = cita.hora;
    document.getElementById("editTipo").value = cita.tipoCita || "";
    document.getElementById("editEstado").value = cita.estado;

    // Seleccionar los actuales
    if (cita.paciente) {
      document.getElementById("editPaciente").value = cita.paciente.id;
    }

    if (cita.especialista) {
      document.getElementById("editEspecialista").value = cita.especialista.id;
    }

    const modal = new bootstrap.Modal(
      document.getElementById("editAppointmentModal")
    );

    modal.show();
  } catch (error) {
    console.error("Error al cargar la cita:", error);
    alert("No se pudo obtener la cita");
  }
}

async function cargarPacientes() {
  const token = sessionStorage.getItem("jwtToken");
  if (!token) {
    alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    window.location.href = "index.html";
    return;
  }

  const response = await fetch(`${API_BASE_URL}/pacientes`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Error al cargar pacientes");

  const data = await response.json();

  const select = document.getElementById("editPaciente");
  if (!select) return;
  select.innerHTML = `<option value="">Seleccione un paciente</option>`;

  data.forEach((p) => {
    select.innerHTML += `<option value="${p.id}">${p.nombre} ${
      p.apellido || ""
    }</option>`;
  });
}

async function cargarEspecialistas() {
  const token = sessionStorage.getItem("jwtToken");
  if (!token) {
    alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    window.location.href = "index.html";
    return;
  }

  // usar el mismo endpoint que PersonalServiceCitas (/personal)
  const response = await fetch(`${API_BASE_URL}/personal`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Error al cargar especialistas");

  const data = await response.json();

  const select = document.getElementById("editEspecialista");
  if (!select) return;
  select.innerHTML = `<option value="">Seleccione un especialista</option>`;

  data.forEach((e) => {
    select.innerHTML += `<option value="${e.id}">${e.nombre} ${
      e.apellido || ""
    }</option>`;
  });
}

async function guardarEdicionCita() {
  try {
    const id = parseInt(document.getElementById("editCitaId").value);
    const fecha = document.getElementById("editFecha").value;
    const hora = document.getElementById("editHora").value;
    const tipoCita = document.getElementById("editTipo").value;
    const estado = document.getElementById("editEstado").value;
    const pacienteId = parseInt(document.getElementById("editPaciente").value);
    const especialistaId = parseInt(
      document.getElementById("editEspecialista").value
    );

    if (!pacienteId || !especialistaId || !fecha || !hora) {
      return alert("Todos los campos son requeridos");
    }

    const citaActualizada = {
      paciente: { id: pacienteId },
      especialista: { id: especialistaId },
      fecha: fecha,
      hora: hora,
      tipoCita: tipoCita || "Consulta General",
      estado: estado,
      notas: null,
    };

    await CitasService.updateCita(id, citaActualizada);

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editAppointmentModal")
    );
    if (modal) modal.hide();

    loadCitas();
    alert("Cita actualizada exitosamente");
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    alert("Error al actualizar la cita: " + error.message);
  }
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadCitas();
  cargarDatosModal();
});

// Búsqueda simple (sin filtros complejos)
let searchTimeout;
function buscarCitas() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const term = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase();

    if (term === "") {
      displayCitas(todasLasCitas);
      updateEstadisticas(todasLasCitas);
      return;
    }

    const citasFiltradas = todasLasCitas.filter((c) => {
      const paciente = c.paciente || {};
      const especialista = c.especialista || {};

      return (
        paciente.nombre?.toLowerCase().includes(term) ||
        paciente.apellido?.toLowerCase().includes(term) ||
        especialista.nombre?.toLowerCase().includes(term) ||
        especialista.apellido?.toLowerCase().includes(term) ||
        c.tipoCita?.toLowerCase().includes(term) ||
        c.estado?.toLowerCase().includes(term)
      );
    });

    displayCitas(citasFiltradas);
    updateEstadisticas(citasFiltradas);
  }, 300);
}

// Aplicar filtros desde el modal
async function aplicarFiltrosModal() {
  const estado = document.getElementById("estadoFilterModal").value;
  const fecha = document.getElementById("fechaFilterModal").value;
  const paciente = document.getElementById("pacienteFilterModal").value;
  const especialista = document.getElementById("especialistaFilterModal").value;

  try {
    let citas = todasLasCitas;

    // Filtrar por estado
    if (estado && estado !== "todos") {
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
      citas = await CitasService.getCitasByEspecialistaAndFecha(
        especialista,
        fecha
      );
    }

    displayCitas(citas);
    updateEstadisticas(citas);

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("filterModal")
    );
    if (modal) modal.hide();
  } catch (error) {
    console.error("Error al aplicar filtros:", error);
    alert("Error al filtrar citas");
  }
}

// Limpiar filtros del modal
function limpiarFiltrosModal() {
  if (document.getElementById("estadoFilterModal"))
    document.getElementById("estadoFilterModal").value = "todos";
  if (document.getElementById("fechaFilterModal"))
    document.getElementById("fechaFilterModal").value = "";
  if (document.getElementById("pacienteFilterModal"))
    document.getElementById("pacienteFilterModal").value = "";
  if (document.getElementById("especialistaFilterModal"))
    document.getElementById("especialistaFilterModal").value = "";

  displayCitas(todasLasCitas);
  updateEstadisticas(todasLasCitas);
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadCitas();
  cargarDatosModal();
});
