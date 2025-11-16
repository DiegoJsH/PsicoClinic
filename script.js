// Asegúrate de que tu backend esté corriendo en la URL y puerto correctos(HOST)
//const API_BASE_URL = 'http://localhost:8080';
// BACKEND ONLINE
const URL_BASE = "https://springbootpsicoclinic.onrender.com";

// ------------------------------------
// 🔐 Authentication (JWT) — ARREGLADO
// ------------------------------------

async function login() {
  // Verificar y decodificar JWT al cargar la página

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log("FETCH STATUS:", response.status, response.statusText);

    const text = await response.text(); // Obtenemos como texto para ver qué devuelve
    console.log("RESPONSE TEXT:", text);

    if (!response.ok) {
      alert(
        response.status === 401
          ? "Credenciales incorrectas."
          : "Error al iniciar sesión."
      );
      return;
    }

    const data = JSON.parse(text); // Parseamos solo si response.ok
    console.log("LOGIN RESPONSE PARSEADO:", data);

    sessionStorage.setItem("username", data.username);
    sessionStorage.setItem("jwtToken", data.token);
    sessionStorage.setItem("role", data.role);

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error login:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// ------------------------------------
// 🔒 Verifica sesión en páginas internas
// ------------------------------------
function checkAuth() {
  const token = sessionStorage.getItem("jwtToken");
  const role = sessionStorage.getItem("role");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay) {
    usernameDisplay.textContent = sessionStorage.getItem("username");
  }

  // Mostrar JWT y payload en la página
  if (token) {
    const payload = decodeJWT(token);
    const display = document.getElementById("jwtPayloadDisplay");
    if (display) {
      display.textContent = `JWT Token:\n${token}\n\nPayload:\n${JSON.stringify(
        payload,
        null,
        2
      )}`;
    }
  }
}

// Decodificar JWT
function decodeJWT(token) {
  try {
    const payloadBase64 = token.split(".")[1]; // Parte del medio
    const decodedPayload = atob(payloadBase64); // Decodifica Base64
    const payloadObj = JSON.parse(decodedPayload);
    return payloadObj;
  } catch (e) {
    console.error("Error decodificando JWT:", e);
    return null;
  }
}

// ------------------------------------
// 🔑 Peticiones protegidas con Bearer Token
// ------------------------------------
async function fetchProtectedData(endpoint, method = "GET", body = null) {
  const token = sessionStorage.getItem("jwtToken");

  if (!token) {
    logout();
    return null;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok) {
      return response.status !== 204 ? await response.json() : null;
    }

    if (response.status === 401 || response.status === 403) {
      alert("Sesión expirada. Vuelva a iniciar sesión.");
      logout();
      return;
    }

    console.error(`Error al cargar ${endpoint}:`, response.statusText);
  } catch (error) {
    console.error("Error de red al acceder a la API:", error);
  }

  return null;
}

// ------------------------------------
// 📅 Calendar
// ------------------------------------
function generateCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  if (!calendarDays) return;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  calendarDays.innerHTML = "";

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.textContent = currentDate.getDate();

    if (currentDate.getMonth() !== currentMonth)
      dayElement.style.opacity = "0.3";
    if (currentDate.toDateString() === today.toDateString())
      dayElement.classList.add("today");
    if (Math.random() > 0.7) dayElement.classList.add("has-appointments");

    calendarDays.appendChild(dayElement);
  }
}

// ------------------------------------
// 📊 Charts
// ------------------------------------
function initializeCharts() {
  const revenueChart = document.getElementById("revenueChart");
  if (!revenueChart) return;

  // (Lógica de charts simplificada)
  const ctx = revenueChart.getContext("2d");
  ctx.fillStyle = "rgba(255, 153, 153, 0.3)";
  ctx.fillRect(0, 0, revenueChart.width, revenueChart.height);

  const points = [
    [50, 200],
    [150, 150],
    [250, 180],
    [350, 120],
    [450, 100],
    [550, 140],
    [650, 90],
  ];

  ctx.strokeStyle = "#ff6b6b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, i) =>
    i === 0 ? ctx.moveTo(point[0], point[1]) : ctx.lineTo(point[0], point[1])
  );
  ctx.stroke();

  ctx.fillStyle = "#ff6b6b";
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

// ------------------------------------
// ✨ Initialize on load & Shortcuts
// ------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Configura la fecha actual en inputs de tipo date
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split("T")[0];
  dateInputs.forEach((input) => {
    if (!input.value) input.value = today;
  });

  // Llama a checkAuth al cargar páginas protegidas (dashboard.html, patients.html, etc.)
  // Si esta línea no está presente en tus archivos HTML, debes llamarla manualmente.
  // if (document.body.classList.contains('protected-page')) { checkAuth(); }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.querySelector('input[placeholder*="Buscar"]')?.focus();
  }

  if (e.key === "Escape") {
    const openModal = document.querySelector(".modal.show");
    // Asumiendo que usas Bootstrap u otro framework con 'Modal'
    if (openModal) bootstrap.Modal.getInstance(openModal).hide();
  }
});
