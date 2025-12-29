
const INVENTORY_ITEMS = [
    'Espejos', 'Tapas laterales', 'Vías delanteras', 'Vías traseras',
    'Buen estado de pintura', 'Asiento buen estado', 'Guardafango delantero',
    'Guardafango Trasero', 'Luz foco frontal', 'Batería', 'Tanque buen estado',
    'Switch principal', 'Cadena', 'Manecilla', 'Rueda delantera',
    'Rueda trasera', 'Alarma', 'Llaveros', 'Luz stop', 'Corneta',
    'Herramientas', 'Casco'
];

// Estado Global
let orders = JSON.parse(localStorage.getItem('belmotos_v4_storage')) || [];
let currentPreviews = { vehicle: '', chassis: '' };

// Al iniciar
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderInventory();
    renderOrders();
    setupEventListeners();
});

function renderInventory() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = INVENTORY_ITEMS.map(item => `
        <label class="inventory-item">
            <span>${item}</span>
            <input type="checkbox" class="inventory-check" data-item="${item}" checked>
        </label>
    `).join('');
}

function setupEventListeners() {
    // Foto Vehículo
    document.getElementById('preview-v').onclick = () => document.getElementById('input-v').click();
    document.getElementById('input-v').onchange = (e) => handleImage(e, 'vehicle', 'preview-v');

    // Foto Chasis
    document.getElementById('preview-c').onclick = () => document.getElementById('input-c').click();
    document.getElementById('input-c').onchange = (e) => handleImage(e, 'chassis', 'preview-c');

    // Botón Guardar
    document.getElementById('btn-save-reception').onclick = saveReception;

    // Buscador
    document.getElementById('search-input').oninput = (e) => renderOrders(e.target.value);
}

function handleImage(e, type, previewId) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentPreviews[type] = event.target.result;
            document.getElementById(previewId).innerHTML = `<img src="${event.target.result}">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveReception() {
    const ownerName = document.getElementById('owner-name').value;
    const plate = document.getElementById('bike-plate').value.toUpperCase();

    if (!ownerName || !plate) {
        showNotification('Error: Nombre y Placa obligatorios');
        return;
    }

    const checklist = {};
    document.querySelectorAll('.inventory-check').forEach(chk => {
        checklist[chk.dataset.item] = chk.checked;
    });

    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        entryDate: new Date().toISOString(),
        operationType: document.getElementById('operation-type').value,
        owner: {
            name: ownerName,
            idNumber: document.getElementById('owner-id').value,
            phone: document.getElementById('owner-phone').value,
            email: document.getElementById('owner-email').value
        },
        motorcycle: {
            plate: plate,
            model: document.getElementById('bike-model').value,
            year: document.getElementById('bike-year').value,
            mileage: document.getElementById('bike-mileage').value,
            chassisSerial: document.getElementById('bike-chassis').value,
            engineSerial: document.getElementById('bike-engine').value
        },
        clientReport: document.getElementById('client-report').value,
        observations: document.getElementById('observations').value,
        checklist,
        photoVehicle: currentPreviews.vehicle,
        photoChassis: currentPreviews.chassis,
        status: 'Pendiente',
        workHours: 0,
        estimatedCost: 0,
        technicianNotes: ''
    };

    orders.push(newOrder);
    saveToStorage();
    generatePDF(newOrder, 'reception');
    resetForm();
    renderOrders();
    showNotification('¡Recepción guardada con éxito!');
}

function renderOrders(filter = '') {
    const container = document.getElementById('orders-container');
    const filtered = orders.filter(o => 
        o.motorcycle.plate.toLowerCase().includes(filter.toLowerCase()) || 
        o.id.includes(filter) ||
        o.owner.name.toLowerCase().includes(filter.toLowerCase())
    ).reverse();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px; color: #94a3b8; grid-column: 1/-1">
                <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:15px; opacity:0.3"></i>
                <p>No se encontraron órdenes registradas</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(order => {
        const statusClass = order.status === 'Pendiente' ? 'status-pendiente' : (order.status === 'En Proceso' ? 'status-proceso' : 'status-completado');
        
        return `
        <div class="order-card animate-in">
            <div class="status-bar ${statusClass}"></div>
            <div class="order-info">
                <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 800; letter-spacing: 1px">ORDEN #${order.id}</span>
                <h3>${order.motorcycle.plate}</h3>
                <p>${order.motorcycle.model}</p>
                <div class="badge badge-gray">${order.operationType}</div>
                <div style="margin-top: 20px; font-size: 0.8rem; line-height: 1.6">
                    <div style="display:flex; align-items:center; gap:8px"><i data-lucide="user" style="width:14px"></i> <b>${order.owner.name}</b></div>
                    <div style="display:flex; align-items:center; gap:8px; color:#64748b"><i data-lucide="calendar" style="width:14px"></i> ${new Date(order.entryDate).toLocaleDateString()}</div>
                </div>
            </div>

            <div class="order-diagnosis">
                <label>Diagnóstico de Entrada</label>
                <p style="margin-bottom:12px">${order.clientReport || 'Sin reporte de fallas'}</p>
                <label>Observaciones Físicas</label>
                <p>${order.observations || 'Sin observaciones'}</p>
            </div>

            <div class="order-tech-form">
                <div class="input-group">
                    <label>Estado Técnico</label>
                    <select onchange="updateOrder('${order.id}', 'status', this.value)" class="${order.status === 'Completado' ? 'select-main' : ''}">
                        <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En Proceso" ${order.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>Completado</option>
                    </select>
                </div>
                <div class="form-grid" style="gap:10px">
                    <div class="input-group">
                        <label>Horas</label>
                        <input type="number" step="0.5" value="${order.workHours}" onchange="updateOrder('${order.id}', 'workHours', this.value)">
                    </div>
                    <div class="input-group">
                        <label>Costo ($)</label>
                        <input type="number" value="${order.estimatedCost}" onchange="updateOrder('${order.id}', 'estimatedCost', this.value)" style="font-weight:bold; color:var(--primary)">
                    </div>
                </div>
                <div class="input-group span-2">
                    <label>Notas del Mecánico</label>
                    <textarea rows="2" onchange="updateOrder('${order.id}', 'technicianNotes', this.value)" placeholder="Trabajo realizado...">${order.technicianNotes || ''}</textarea>
                </div>
                <div class="tech-actions">
                    <button class="btn btn-outline" onclick="generatePDFById('${order.id}', 'reception')"><i data-lucide="file-down"></i> RECIBO</button>
                    <button class="btn btn-tech" onclick="generatePDFById('${order.id}', 'technical')"><i data-lucide="shield-check"></i> INFORME</button>
                    <button class="btn btn-delete" onclick="deleteOrder('${order.id}')"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        </div>
    `}).join('');
    
    lucide.createIcons();
}

function updateOrder(id, field, value) {
    const order = orders.find(o => o.id === id);
    if (order) {
        if (field === 'workHours' || field === 'estimatedCost') {
            order[field] = parseFloat(value) || 0;
        } else {
            order[field] = value;
        }
        saveToStorage();
        if (field === 'status') renderOrders(document.getElementById('search-input').value);
        showNotification('Datos actualizados');
    }
}

function deleteOrder(id) {
    if (confirm('¿Desea eliminar esta orden permanentemente?')) {
        orders = orders.filter(o => o.id !== id);
        saveToStorage();
        renderOrders();
        showNotification('Orden eliminada');
    }
}

function saveToStorage() {
    localStorage.setItem('belmotos_v4_storage', JSON.stringify(orders));
}

function showNotification(msg) {
    const el = document.getElementById('notification');
    el.innerText = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

function resetForm() {
    document.getElementById('reception-form').reset();
    document.getElementById('preview-v').innerHTML = '<i data-lucide="camera"></i>';
    document.getElementById('preview-c').innerHTML = '<i data-lucide="camera"></i>';
    currentPreviews = { vehicle: '', chassis: '' };
    lucide.createIcons();
}

// PDF ENGINE
function generatePDFById(id, type) {
    const order = orders.find(o => o.id === id);
    if (order) generatePDF(order, type);
}

function generatePDF(order, type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    if (type === 'reception') {
        doc.setFillColor(6, 78, 59); // Emerald Dark
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('BELMOTOS - TALLER', 20, 28);
        doc.setFontSize(10);
        doc.text('COMPROBANTE DE RECEPCIÓN Y DIAGNÓSTICO', 20, 36);
        doc.text(`ORDEN #${order.id}`, 165, 28);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text('DATOS DEL PROPIETARIO', 20, 55);
        doc.setFontSize(9);
        doc.text(`Nombre: ${order.owner.name}`, 20, 62);
        doc.text(`CI/RIF: ${order.owner.idNumber}`, 20, 67);
        doc.text(`Teléfono: ${order.owner.phone}`, 20, 72);

        doc.setFontSize(11);
        doc.text('DATOS DEL VEHÍCULO', 105, 55);
        doc.setFontSize(9);
        doc.text(`Placa: ${order.motorcycle.plate}`, 105, 62);
        doc.text(`Modelo: ${order.motorcycle.model} (${order.motorcycle.year || 'N/A'})`, 105, 67);
        doc.text(`KM: ${order.motorcycle.mileage} | Chasis: ${order.motorcycle.chassisSerial}`, 105, 72);

        doc.setFontSize(11);
        doc.text('INVENTARIO:', 20, 85);
        doc.setFontSize(7);
        const items = Object.entries(order.checklist);
        items.forEach(([item, checked], i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            doc.text(`${checked ? '[X]' : '[ ]'} ${item}`, 20 + (col * 60), 92 + (row * 5));
        });

        doc.setFontSize(11);
        doc.text('DIAGNÓSTICO Y OBSERVACIONES:', 20, 140);
        doc.setFontSize(9);
        const report = doc.splitTextToSize(order.clientReport || 'Sin reporte', 170);
        doc.text(report, 20, 147);
        
        doc.text('ESTADO FÍSICO:', 20, 165);
        const obs = doc.splitTextToSize(order.observations || 'Sin observaciones', 170);
        doc.text(obs, 20, 172);

        if (order.photoVehicle) {
            try { doc.addImage(order.photoVehicle, 'JPEG', 20, 195, 80, 50); } catch(e){}
        }
        if (order.photoChassis) {
            try { doc.addImage(order.photoChassis, 'JPEG', 110, 195, 80, 50); } catch(e){}
        }

        doc.setFontSize(8);
        doc.text('__________________________', 45, 275);
        doc.text('__________________________', 135, 275);
        doc.text('RECIBIDO TALLER', 53, 280);
        doc.text('CONFORMIDAD CLIENTE', 140, 280);

        doc.save(`Recepcion_${order.motorcycle.plate}.pdf`);
    } else {
        // Informe Técnico
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME TÉCNICO', 20, 30);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Vehículo: ${order.motorcycle.model} | Placa: ${order.motorcycle.plate}`, 20, 45);
        doc.setFontSize(10);
        doc.text(`Orden: #${order.id} | Fecha Entrega: ${new Date().toLocaleDateString()}`, 20, 52);
        doc.line(20, 58, 190, 58);

        doc.setFontSize(12);
        doc.text('TRABAJO REALIZADO:', 20, 75);
        doc.setFontSize(10);
        const notes = doc.splitTextToSize(order.technicianNotes || 'Reparaciones estándar efectuadas.', 170);
        doc.text(notes, 20, 85);

        doc.setFontSize(12);
        doc.text('RESUMEN DE CARGOS:', 20, 150);
        doc.setFontSize(10);
        doc.text(`Horas Laboradas: ${order.workHours}`, 20, 160);
        doc.setFontSize(16);
        doc.setTextColor(5, 150, 105);
        doc.text(`TOTAL A PAGAR: $ ${order.estimatedCost.toLocaleString()}`, 20, 175);

        doc.setTextColor(0,0,0);
        doc.setFontSize(9);
        doc.text('Gracias por su confianza en BELMOTOS.', 20, 200);

        doc.save(`Informe_${order.motorcycle.plate}.pdf`);
    }
}
