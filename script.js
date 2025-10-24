// Authentication
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === '123') {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Credenciales incorrectas. Use admin / 123');
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function checkAuth() {
    if (!sessionStorage.getItem('isAuthenticated')) {
        window.location.href = 'index.html';
    }
}

// Calendar
function generateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = currentDate.getDate();
        
        if (currentDate.getMonth() !== currentMonth) dayElement.style.opacity = '0.3';
        if (currentDate.toDateString() === today.toDateString()) dayElement.classList.add('today');
        if (Math.random() > 0.7) dayElement.classList.add('has-appointments');
        
        calendarDays.appendChild(dayElement);
    }
}

// Charts
function initializeCharts() {
    const revenueChart = document.getElementById('revenueChart');
    if (!revenueChart) return;
    
    const ctx = revenueChart.getContext('2d');
    ctx.fillStyle = 'rgba(255, 153, 153, 0.3)';
    ctx.fillRect(0, 0, revenueChart.width, revenueChart.height);
    
    const points = [[50, 200], [150, 150], [250, 180], [350, 120], [450, 100], [550, 140], [650, 90]];
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, i) => i === 0 ? ctx.moveTo(point[0], point[1]) : ctx.lineTo(point[0], point[1]));
    ctx.stroke();
    
    ctx.fillStyle = '#ff6b6b';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => { if (!input.value) input.value = today; });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Buscar"]')?.focus();
    }
    
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) bootstrap.Modal.getInstance(openModal).hide();
    }
});
