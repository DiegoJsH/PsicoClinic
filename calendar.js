// ------------------------------------
// 📅 Calendar - PsicoClinic
// ------------------------------------

let selectedDayElement = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

const monthNames = [
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

/**
 * Genera el calendario para el mes y año actual
 */
function generateCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  if (!calendarDays) {
    console.error("No se encontró el elemento calendarDays");
    return;
  }

  // Actualizar título del mes
  const headerTitle = document.querySelector(".card-header h5");
  if (headerTitle) {
    headerTitle.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
  }

  // Calcular primer día del mes
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Limpiar días previos
  calendarDays.innerHTML = "";

  // Resetear selección al cambiar de mes
  selectedDayElement = null;

  // Generar 42 días (6 semanas)
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const formattedDate = currentDate.toISOString().split("T")[0];

    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = currentDate.getDate();
    dayElement.setAttribute("data-date", formattedDate);

    // Marcar días de otros meses con opacidad
    if (currentDate.getMonth() !== calendarMonth) {
      dayElement.style.opacity = "0.3";
      dayElement.style.cursor = "default";
    } else {
      dayElement.style.cursor = "pointer";
    }

    // Marcar el día actual
    const today = new Date();
    if (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }

    // Evento click para seleccionar día (solo para días del mes actual)
    if (currentDate.getMonth() === calendarMonth) {
      dayElement.onclick = () => {
        console.log("Día seleccionado:", formattedDate);
        cargarCitasDelDia(formattedDate);

        // Remover selección anterior
        if (selectedDayElement) {
          selectedDayElement.classList.remove("selected-day");
        }

        // Agregar selección al nuevo día
        dayElement.classList.add("selected-day");
        selectedDayElement = dayElement;
      };
    }

    calendarDays.appendChild(dayElement);
  }

  // Seleccionar el día actual automáticamente si estamos en el mes actual
  const today = new Date();
  if (
    calendarMonth === today.getMonth() &&
    calendarYear === today.getFullYear()
  ) {
    const todayDate = today.toISOString().split("T")[0];
    const todayElement = calendarDays.querySelector(
      `[data-date="${todayDate}"]`
    );
    if (todayElement && todayElement.style.opacity !== "0.3") {
      todayElement.click();
    }
  }
}

/**
 * Carga las citas de un día específico
 */
async function cargarCitasDelDia(fecha) {
  const contenedor = document.querySelector(".day-appointments");
  if (!contenedor) {
    console.error("No se encontró el contenedor de citas");
    return;
  }

  // Actualizar el título de la tarjeta con la fecha seleccionada
  const cardHeader = document.querySelector(
    ".col-md-6:nth-child(2) .card-header h5"
  );
  if (cardHeader) {
    cardHeader.textContent = `Citas del día - ${formatearFechaCorta(fecha)}`;
  }

  // Mostrar mensaje de carga
  contenedor.innerHTML = `
    <div class="text-center text-muted py-3">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <em>Cargando citas...</em>
    </div>
  `;

  try {
    console.log("Cargando citas para fecha:", fecha);
    const citas = await fetchProtectedData(`citas/fecha/${fecha}`);
    console.log("Citas recibidas:", citas);

    contenedor.innerHTML = "";

    if (!citas || citas.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
          <em>No hay citas programadas para este día</em>
          <p class="small mt-2">Fecha: ${formatearFecha(fecha)}</p>
        </div>
      `;
      return;
    }

    // Ordenar citas por hora
    citas.sort((a, b) => {
      const horaA = a.hora || "00:00";
      const horaB = b.hora || "00:00";
      return horaA.localeCompare(horaB);
    });

    citas.forEach((cita) => {
      const div = document.createElement("div");
      div.classList.add("appointment-slot");

      div.innerHTML = `
        <div class="time-slot">${cita.hora || "Sin hora"}</div>
        <div class="appointment-info">
          <strong>${
            cita.paciente?.nombre || "Paciente desconocido"
          }</strong><br>
          <small class="text-muted">
            <i class="bi bi-person-badge"></i> ${
              cita.especialista?.nombre || "No asignado"
            }
          </small><br>
          <small class="text-muted">
            <i class="bi bi-heart-pulse"></i> ${cita.tipoCita || "Sin tipo"}
          </small><br>
          <small class="text-muted">
            <i class="bi bi-chat-left-text"></i> ${
              cita.motivo || "Sin motivo registrado"
            }
          </small>
        </div>
      `;

      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("Error al cargar citas:", error);
    contenedor.innerHTML = `
      <div class="text-center text-danger py-4">
        <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
        <em>Error al cargar las citas</em>
        <p class="small mt-2">${error.message || "Intente nuevamente"}</p>
      </div>
    `;
  }
}

/**
 * Formatea una fecha ISO a formato legible
 */
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const diaSemana = dias[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = monthNames[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${año}`;
}

/**
 * Formatea una fecha ISO a formato corto
 */
function formatearFechaCorta(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  const dia = fecha.getDate();
  const mes = monthNames[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${dia} de ${mes} de ${año}`;
}

/**
 * Inicializa los controles de navegación del calendario
 */
function initCalendarControls() {
  const prevButton = document.querySelector(".calendar-nav .btn:first-child");
  const nextButton = document.querySelector(".calendar-nav .btn:last-child");

  if (prevButton) {
    prevButton.onclick = (e) => {
      e.preventDefault();
      calendarMonth--;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      }
      console.log("Mes anterior:", monthNames[calendarMonth], calendarYear);
      generateCalendar();
    };
  }

  if (nextButton) {
    nextButton.onclick = (e) => {
      e.preventDefault();
      calendarMonth++;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      console.log("Mes siguiente:", monthNames[calendarMonth], calendarYear);
      generateCalendar();
    };
  }
}

/**
 * Inicializa el calendario cuando el DOM está listo
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando calendario...");

  // Esperar un momento para asegurar que script.js está cargado
  setTimeout(() => {
    initCalendarControls();
    generateCalendar();
  }, 100);
});
