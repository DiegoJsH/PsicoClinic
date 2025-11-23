// ===============================
// SERVICIOS API
// ===============================
// ✅ Verificación de rol al cargar la página
function checkReportsAccess() {
  const role = sessionStorage.getItem("role");

  if (role !== "ADMIN") {
    alert("⛔ No tienes permisos para acceder a esta página.");
    window.location.href = "dashboard.html";
  }
}

class ServicioCitas {
  static async obtenerTodas() {
    const token = sessionStorage.getItem("jwtToken");
    const respuesta = await fetch(`${API_BASE_URL}/citas`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!respuesta.ok) throw new Error("Error al obtener citas");
    return respuesta.json();
  }
}

class ServicioPacientes {
  static async obtenerTodos() {
    const token = sessionStorage.getItem("jwtToken");
    const respuesta = await fetch(`${API_BASE_URL}/pacientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!respuesta.ok) throw new Error("Error al obtener pacientes");
    return respuesta.json();
  }
}

// ===============================
// VARIABLES GLOBALES
// ===============================
let citasPorMesChart, tiposCitaChart, especialistasChart, horariosChart;
const colores = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#f9ca24",
  "#6c5ce7",
  "#a29bfe",
  "#fd79a8",
  "#fdcb6e",
];
const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ===============================
// FUNCIONES DE REPORTE
// ===============================
async function cargarReporte() {
  try {
    const [citas, pacientes] = await Promise.all([
      ServicioCitas.obtenerTodas(),
      ServicioPacientes.obtenerTodos(),
    ]);

    cargarMetricas(citas, pacientes);
    generarGraficos(citas);
    generarTablaResumen(citas);
  } catch (error) {
    console.error("Error al cargar el reporte:", error);
    alert("Error al cargar los datos. Verifica tu conexión.");
  }
}

function cargarMetricas(citas, pacientes) {
  document.getElementById("totalCitasReporte").textContent = citas.length;
  document.getElementById("ingresosReporte").textContent = `$${(
    citas.length * 50
  ).toLocaleString()}`;
  document.getElementById("totalPacientesReporte").textContent =
    pacientes.length;
  document.getElementById("totalEspecialistasReporte").textContent = new Set(
    citas.map((c) => c.especialista?.id).filter(Boolean)
  ).size;
}

function generarGraficos(citas) {
  graficoMeses(citas);
  graficoTipos(citas);
  graficoEspecialistas(citas);
  graficoHorarios(citas);
}

function graficoMeses(citas) {
  const datos = Array(12).fill(0);
  citas.forEach((c) => {
    if (c.fecha) {
      const mes = new Date(c.fecha + "T00:00:00").getMonth();
      datos[mes]++;
    }
  });

  if (citasPorMesChart) citasPorMesChart.destroy();
  citasPorMesChart = new Chart(document.getElementById("citasPorMesChart"), {
    type: "line",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Citas",
          data: datos,
          borderColor: "#ff6b6b",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#ff6b6b",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function graficoTipos(citas) {
  const tipos = {};
  citas.forEach((c) => {
    const tipo = c.tipoCita || "Sin especificar";
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  if (tiposCitaChart) tiposCitaChart.destroy();
  tiposCitaChart = new Chart(document.getElementById("tiposCitaChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(tipos),
      datasets: [
        {
          data: Object.values(tipos),
          backgroundColor: colores,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function graficoEspecialistas(citas) {
  const esp = {};
  citas.forEach((c) => {
    const nombre = c.especialista?.nombre || "Sin asignar";
    esp[nombre] = (esp[nombre] || 0) + 1;
  });

  const ordenados = Object.entries(esp).sort((a, b) => b[1] - a[1]);

  if (especialistasChart) especialistasChart.destroy();
  especialistasChart = new Chart(
    document.getElementById("especialistasChart"),
    {
      type: "bar",
      data: {
        labels: ordenados.map((e) => e[0]),
        datasets: [
          {
            label: "Citas",
            data: ordenados.map((e) => e[1]),
            backgroundColor: "#4ecdc4",
            borderColor: "#45b7d1",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    }
  );
}

function graficoHorarios(citas) {
  const horarios = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`);
  const datos = horarios.map((h) => {
    const hora = parseInt(h);
    return citas.filter(
      (c) => c.hora && parseInt(c.hora.split(":")[0]) === hora
    ).length;
  });

  if (horariosChart) horariosChart.destroy();
  horariosChart = new Chart(document.getElementById("horariosChart"), {
    type: "bar",
    data: {
      labels: horarios,
      datasets: [
        {
          label: "Citas",
          data: datos,
          backgroundColor: "#6c5ce7",
          borderColor: "#5f59e8",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function generarTablaResumen(citas) {
  const esp = {};
  citas.forEach((c) => {
    const nombre = c.especialista?.nombre || "Sin asignar";
    esp[nombre] = (esp[nombre] || 0) + 1;
  });

  const tbody = document.getElementById("tablaEspecialistas");
  tbody.innerHTML = Object.entries(esp)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, cant]) => {
      const pct = ((cant / citas.length) * 100).toFixed(1);
      return `<tr>
        <td><strong>${nombre}</strong></td>
        <td>${cant}</td>
        <td>
          <div class="d-flex align-items-center">
            <div class="progress flex-grow-1 me-2" style="height: 8px;">
              <div class="progress-bar bg-primary" style="width: ${pct}%"></div>
            </div>
            <span class="text-muted small">${pct}%</span>
          </div>
        </td>
        <td class="text-success"><strong>$${(
          cant * 50
        ).toLocaleString()}</strong></td>
      </tr>`;
    })
    .join("");
}

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  checkReportsAccess();
  cargarReporte();
});
