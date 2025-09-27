// Authentication functions
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication - in production, this should be more secure
    if (username === 'admin' && password === '123') {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Credenciales incorrectas. Use admin / 123');
    }
}

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}

function checkAuth() {
    if (!sessionStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
    }
}

// Calendar functions
function generateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = currentDate.getDate();
        
        if (currentDate.getMonth() !== currentMonth) {
            dayElement.style.opacity = '0.3';
        }
        
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Add sample appointments to some days
        if (Math.random() > 0.7) {
            dayElement.classList.add('has-appointments');
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// Chart initialization (placeholder)
function initializeCharts() {
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
        const ctx = revenueChart.getContext('2d');
        
        // Simple chart simulation
        ctx.fillStyle = 'rgba(255, 153, 153, 0.3)';
        ctx.fillRect(0, 0, revenueChart.width, revenueChart.height);
        
        // Draw some sample data points
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const points = [
            [50, 200],
            [150, 150],
            [250, 180],
            [350, 120],
            [450, 100],
            [550, 140],
            [650, 90]
        ];
        
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point[0], point[1]);
            } else {
                ctx.lineTo(point[0], point[1]);
            }
        });
        
        ctx.stroke();
        
        // Add some dots
        ctx.fillStyle = '#ff6b6b';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Search functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('input[placeholder*="Buscar"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const targetTable = e.target.closest('.card').querySelector('table tbody');
            
            if (targetTable) {
                const rows = targetTable.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    });
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Modal handlers
function setupModals() {
    // Handle form submissions in modals
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const saveButton = modal.querySelector('.btn-primary-custom');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                const form = modal.querySelector('form');
                if (form && validateForm(form.id || 'currentForm')) {
                    // Simulate save
                    showToast('Datos guardados exitosamente');
                    bootstrap.Modal.getInstance(modal).hide();
                    
                    // Reset form
                    form.reset();
                }
            });
        }
    });
}

// Data loading simulation
function loadData(endpoint, callback) {
    // Simulate API call delay
    setTimeout(() => {
        const sampleData = {
            patients: [
                { id: 1, name: 'María González', age: 31, phone: '+1 234 567 8901', email: 'maria.gonzalez@email.com' },
                { id: 2, name: 'Carlos Martínez', age: 45, phone: '+1 234 567 8902', email: 'carlos.martinez@email.com' },
                { id: 3, name: 'Ana Pérez', age: 28, phone: '+1 234 567 8903', email: 'ana.perez@email.com' }
            ],
            appointments: [
                { id: 1, patient: 'María González', doctor: 'Dr. Rodríguez', type: 'Terapia Individual', date: new Date() },
                { id: 2, patient: 'Carlos Martínez', doctor: 'Dra. López', type: 'Evaluación', date: new Date() }
            ],
            staff: [
                { id: 1, name: 'Dr. Miguel Rodríguez', specialty: 'Psicólogo Clínico', status: 'Disponible' },
                { id: 2, name: 'Dra. Carmen López', specialty: 'Psicóloga Infantil', status: 'Disponible' }
            ]
        };
        
        callback(sampleData[endpoint] || []);
    }, 500);
}

// Export functionality
function exportData(format = 'csv') {
    const data = {
        date: new Date().toLocaleDateString(),
        patients: 156,
        appointments: 324,
        revenue: 45280
    };
    
    if (format === 'csv') {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Fecha,Pacientes,Citas,Ingresos\n"
            + `${data.date},${data.patients},${data.appointments},${data.revenue}`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_psicoclinic.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Reporte exportado exitosamente');
    }
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Update stats randomly
        const statsNumbers = document.querySelectorAll('.stats-number, .metric-value');
        statsNumbers.forEach(stat => {
            if (stat.textContent.includes('$')) {
                // Update revenue
                const currentValue = parseFloat(stat.textContent.replace(/[$,]/g, ''));
                const change = Math.round((Math.random() - 0.5) * 100);
                stat.textContent = formatCurrency(currentValue + change);
            }
        });
    }, 30000); // Update every 30 seconds
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set current date in forms
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Initialize features
    setupSearch();
    setupModals();
    
    // Start real-time updates if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        startRealTimeUpdates();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            bootstrap.Modal.getInstance(openModal).hide();
        }
    }
});

// Performance monitoring
function trackPageLoad() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Página cargada en ${loadTime}ms`);
    }
}

window.addEventListener('load', trackPageLoad);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.error);
    showToast('Ha ocurrido un error. Por favor, recargue la página.', 'danger');
});

// Service worker registration (if needed for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('SW registrado exitosamente:', registration.scope);
        }, function(err) {
            console.log('SW registration failed: ', err);
        });
    });
}