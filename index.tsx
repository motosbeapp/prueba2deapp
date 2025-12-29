
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Wrench, Save, PlusCircle, Search, ClipboardList, 
  User, Bike, FileText, Camera, Trash2, 
  FileDown, Info, ShieldCheck, CameraIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- CONSTANTES ---
const INVENTORY_ITEMS = [
  'Espejos', 'Tapas laterales', 'Vías delanteras', 'Vías traseras',
  'Buen estado de pintura', 'Asiento buen estado', 'Guardafango delantero',
  'Guardafango Trasero', 'Luz foco frontal', 'Batería', 'Tanque buen estado',
  'Switch principal', 'Cadena', 'Manecilla', 'Rueda delantera',
  'Rueda trasera', 'Alarma', 'Llaveros', 'Luz stop', 'Corneta',
  'Herramientas', 'Casco'
];

const STORAGE_KEY = 'belmotos_v5_data';

// --- APP PRINCIPAL ---
const App = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('new'); // 'new' o 'manage'

  // Estado del Formulario
  const [formData, setFormData] = useState({
    owner: { name: '', idNumber: '', phone: '', email: '' },
    motorcycle: { plate: '', model: '', year: '', mileage: '', chassisSerial: '', engineSerial: '' },
    operationType: 'Revisión',
    checklist: INVENTORY_ITEMS.reduce((acc, item) => ({ ...acc, [item]: true }), {}),
    clientReport: '',
    observations: '',
    photoVehicle: '',
    photoChassis: ''
  });

  // Cargar datos
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  // Guardar datos
  const saveToLocalStorage = (newOrders: any[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const handleSaveReception = () => {
    if (!formData.owner.name || !formData.motorcycle.plate) {
      alert("Error: El nombre del cliente y la placa son obligatorios.");
      return;
    }

    const newOrder = {
      ...formData,
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      entryDate: new Date().toISOString(),
      status: 'Pendiente',
      workHours: 0,
      estimatedCost: 0,
      technicianNotes: ''
    };

    const updated = [...orders, newOrder];
    saveToLocalStorage(updated);
    generatePDF(newOrder, 'reception');
    
    // Reset
    setFormData({
      owner: { name: '', idNumber: '', phone: '', email: '' },
      motorcycle: { plate: '', model: '', year: '', mileage: '', chassisSerial: '', engineSerial: '' },
      operationType: 'Revisión',
      checklist: INVENTORY_ITEMS.reduce((acc, item) => ({ ...acc, [item]: true }), {}),
      clientReport: '',
      observations: '',
      photoVehicle: '',
      photoChassis: ''
    });
    alert("¡Recepción guardada! Se ha generado el comprobante PDF.");
  };

  const handleUpdateOrder = (id: string, field: string, value: any) => {
    const updated = orders.map(o => o.id === id ? { ...o, [field]: value } : o);
    saveToLocalStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta orden permanentemente?")) {
      const updated = orders.filter(o => o.id !== id);
      saveToLocalStorage(updated);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.motorcycle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.includes(searchTerm)
    ).reverse();
  }, [orders, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-emerald-900 text-white py-6 px-8 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Wrench size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">BELMOTOS<span className="text-emerald-400">TALLER</span></h1>
          </div>
          <nav className="flex gap-4">
            <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'new' ? 'bg-emerald-700 text-white' : 'text-emerald-200 hover:bg-emerald-800'}`}>RECEPCIÓN</button>
            <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'manage' ? 'bg-emerald-700 text-white' : 'text-emerald-200 hover:bg-emerald-800'}`}>GESTIÓN</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        {activeTab === 'new' ? (
          <div className="animate-fade-in space-y-12">
            <div className="section-header flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100"><PlusCircle className="text-emerald-600" /></div>
                <div><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nueva Recepción</h2></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Datos Cliente */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-6 text-emerald-800 font-bold uppercase text-xs tracking-widest"><User size={16} /> Datos del Propietario</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Nombre Completo" value={formData.owner.name} onChange={v => setFormData({...formData, owner: {...formData.owner, name: v}})} />
                    <Input label="CI / RIF" value={formData.owner.idNumber} onChange={v => setFormData({...formData, owner: {...formData.owner, idNumber: v}})} />
                    <Input label="Teléfono" value={formData.owner.phone} onChange={v => setFormData({...formData, owner: {...formData.owner, phone: v}})} />
                    <Input label="Correo" value={formData.owner.email} onChange={v => setFormData({...formData, owner: {...formData.owner, email: v}})} />
                  </div>
                </div>

                {/* Datos Moto */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-6 text-emerald-800 font-bold uppercase text-xs tracking-widest"><Bike size={16} /> Datos de la Motocicleta</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Input label="Placa" value={formData.motorcycle.plate} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, plate: v.toUpperCase()}})} />
                    <Input label="Modelo" value={formData.motorcycle.model} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, model: v}})} />
                    <Input label="Kilometraje" value={formData.motorcycle.mileage} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, mileage: v}})} />
                    <Input label="Año" value={formData.motorcycle.year} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, year: v}})} />
                    <div className="col-span-2"><Input label="Serial Chasis" value={formData.motorcycle.chassisSerial} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, chassisSerial: v}})} /></div>
                    <div className="col-span-2"><Input label="Serial Motor" value={formData.motorcycle.engineSerial} onChange={v => setFormData({...formData, motorcycle: {...formData.motorcycle, engineSerial: v}})} /></div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase text-xs tracking-widest"><FileText size={16} /> Diagnóstico</div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Reporte Cliente</label>
                    <textarea value={formData.clientReport} onChange={e => setFormData({...formData, clientReport: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none text-sm italic outline-none" placeholder="Lo que el cliente describe..." />
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Observaciones Taller</label>
                    <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-20 resize-none text-sm italic outline-none" placeholder="Rayones, faltantes..." />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Operación</label>
                  <select className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-bold text-emerald-900 outline-none" value={formData.operationType} onChange={e => setFormData({...formData, operationType: e.target.value})}>
                    <option value="Revisión">Revisión</option>
                    <option value="Reparación">Reparación</option>
                    <option value="Garantía">Garantía</option>
                  </select>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold uppercase text-xs tracking-widest"><ClipboardList size={16} /> Inventario (22 Ítems)</div>
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                    {INVENTORY_ITEMS.map(item => (
                      <label key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group cursor-pointer">
                        <span className="text-xs font-semibold text-slate-600">{item}</span>
                        <input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={(formData.checklist as any)[item]} onChange={() => setFormData({...formData, checklist: {...formData.checklist, [item]: !(formData.checklist as any)[item]}})} />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                  <PhotoUploader label="Foto Vehículo" value={formData.photoVehicle} onUpload={v => setFormData({...formData, photoVehicle: v})} />
                  <PhotoUploader label="Serial Chasis" value={formData.photoChassis} onUpload={v => setFormData({...formData, photoChassis: v})} />
                </div>

                <button onClick={handleSaveReception} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                  <Save size={24} /> GUARDAR RECEPCIÓN
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100"><Search className="text-emerald-600" /></div>
                    <div><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión Técnica</h2></div>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Buscar placa, cliente o ID..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="space-y-8">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdate={handleUpdateOrder} onDelete={handleDelete} onPrint={() => generatePDF(order, 'reception')} onPrintTech={() => generatePDF(order, 'technical')} />
              )) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-medium">No se encontraron órdenes activas</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const Input = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const PhotoUploader = ({ label, value, onUpload }: any) => {
  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re: any) => onUpload(re.target.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{label}</label>
      <div className="relative h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden group hover:border-emerald-300 transition-all cursor-pointer">
        {value ? <img src={value} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={24} />}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFile} />
      </div>
    </div>
  );
};

const OrderCard = ({ order, onUpdate, onDelete, onPrint, onPrintTech }: any) => (
  <div className="bg-white rounded-[3rem] p-8 shadow-lg border border-slate-100 relative overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'Pendiente' ? 'bg-slate-300' : (order.status === 'En Proceso' ? 'bg-blue-500' : 'bg-emerald-500')}`} />
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div>
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ORDEN #{order.id}</span>
            <button onClick={() => onDelete(order.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
        </div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{order.motorcycle.plate}</h3>
        <p className="text-slate-500 font-bold mb-4">{order.motorcycle.model}</p>
        <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">{order.operationType}</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase">{order.status}</span>
        </div>
        <div className="mt-6 space-y-1">
            <p className="text-xs font-bold flex items-center gap-2"><User size={14} className="text-slate-400"/> {order.owner.name}</p>
            <p className="text-[10px] text-slate-400">CI/RIF: {order.owner.idNumber}</p>
        </div>
      </div>

      <div className="lg:col-span-1 bg-slate-50/50 p-6 rounded-3xl space-y-4">
          <div className="space-y-1">
              <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Reporte Cliente</label>
              <p className="text-xs text-slate-600 italic leading-relaxed">{order.clientReport || 'Sin reporte'}</p>
          </div>
          <div className="space-y-1">
              <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Observaciones Entrada</label>
              <p className="text-xs text-slate-600 italic leading-relaxed">{order.observations || 'Sin observaciones'}</p>
          </div>
      </div>

      <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Estado</label>
                <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none" value={order.status} onChange={e => onUpdate(order.id, 'status', e.target.value)}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                </select>
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Horas</label>
                    <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none" value={order.workHours} onChange={e => onUpdate(order.id, 'workHours', e.target.value)} />
                </div>
                <div className="flex-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Costo ($)</label>
                    <input type="number" className="w-full p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl text-sm outline-none" value={order.estimatedCost} onChange={e => onUpdate(order.id, 'estimatedCost', e.target.value)} />
                </div>
            </div>
        </div>

        <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Notas Técnicas</label>
            <textarea className="w-full p-4 bg-white border border-slate-200 rounded-2xl h-24 text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Diagnóstico final y trabajo realizado..." value={order.technicianNotes} onChange={e => onUpdate(order.id, 'technicianNotes', e.target.value)} />
        </div>

        <div className="flex gap-3">
            <button onClick={onPrint} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"><FileDown size={14} /> RECEPCIÓN</button>
            <button onClick={onPrintTech} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"><ShieldCheck size={14} /> INFORME TÉCNICO</button>
        </div>
      </div>
    </div>
  </div>
);

// --- PDF ENGINE ---
const generatePDF = (order: any, type: 'reception' | 'technical') => {
  const doc = new jsPDF();
  const margin = 15;
  let y = 15;

  if (type === 'reception') {
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BELMOTOS - TALLER', margin, 25);
    doc.setFontSize(10);
    doc.text('FICHA DE RECEPCIÓN Y DIAGNÓSTICO', margin, 34);
    doc.text(`ORDEN #${order.id}`, 160, 25);

    doc.setTextColor(0, 0, 0);
    y = 60;
    doc.setFontSize(11); doc.text('PROPIETARIO:', margin, y);
    doc.text('MOTOCICLETA:', 105, y);
    y += 7;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${order.owner.name}`, margin, y); doc.text(`Placa: ${order.motorcycle.plate}`, 105, y);
    y += 5;
    doc.text(`CI/RIF: ${order.owner.idNumber}`, margin, y); doc.text(`Modelo: ${order.motorcycle.model}`, 105, y);
    y += 5;
    doc.text(`Teléfono: ${order.owner.phone}`, margin, y); doc.text(`KM: ${order.motorcycle.mileage} | Año: ${order.motorcycle.year}`, 105, y);

    y += 15;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text('INVENTARIO:', margin, y);
    y += 7;
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    const items = Object.entries(order.checklist);
    items.forEach(([item, checked], i) => {
        const col = i % 3; const row = Math.floor(i / 3);
        doc.text(`${checked ? '[X]' : '[ ]'} ${item}`, margin + (col * 60), y + (row * 5));
    });

    y += (Math.ceil(items.length / 3) * 5) + 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('REPORTE CLIENTE:', margin, y);
    y += 6; doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(order.clientReport || 'Sin reporte', 180), margin, y);

    y += 20;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text('OBSERVACIONES GENERALES:', margin, y);
    y += 6; doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(order.observations || 'Sin observaciones', 180), margin, y);

    if (order.photoVehicle || order.photoChassis) {
        y += 25;
        if (order.photoVehicle) try { doc.addImage(order.photoVehicle, 'JPEG', margin, y, 85, 45); } catch(e){}
        if (order.photoChassis) try { doc.addImage(order.photoChassis, 'JPEG', 110, y, 85, 45); } catch(e){}
    }

    doc.setFontSize(7); doc.text('Condiciones: No respondemos por objetos olvidados. Presupuestos validos por 24h.', margin, 280);
  } else {
    doc.setTextColor(5, 150, 105); doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.text('INFORME TÉCNICO', margin, 30);
    doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.text(`Placa: ${order.motorcycle.plate} | Orden: #${order.id}`, margin, 45);
    doc.line(margin, 50, 195, 50);
    doc.text('TRABAJO REALIZADO:', margin, 65);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(order.technicianNotes || 'Trabajos de mantenimiento efectuados.', 170), margin, 75);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL A CANCELAR: $ ${order.estimatedCost}`, margin, 180);
  }

  doc.save(`${type === 'reception' ? 'Recibo' : 'Informe'}_${order.motorcycle.plate}.pdf`);
};

// Montaje Final
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
