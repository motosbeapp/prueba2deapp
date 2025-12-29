
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReceptionForm from './components/ReceptionForm';
import OrderManagement from './components/OrderManagement';
import Reports from './components/Reports';
import { WorkshopOrder } from './types';
import { getOrders, saveOrders } from './utils/storage';
import { generateOrderPDF } from './utils/pdf';
import { Bell, Wrench, Search, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('service');
  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const notify = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleSaveOrder = (newOrder: WorkshopOrder) => {
    const updated = [...orders, newOrder];
    setOrders(updated);
    saveOrders(updated);
    
    // Generar el PDF automáticamente al guardar recepción
    generateOrderPDF(newOrder);
    
    notify('¡Recepción guardada con éxito! Comprobante generado.');
    // Mantenemos al usuario en la misma página pero actualizamos la lista de abajo
  };

  const handleUpdateOrder = (updatedOrder: WorkshopOrder) => {
    const updated = orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    setOrders(updated);
    saveOrders(updated);
    notify(`Orden #${updatedOrder.id} actualizada correctamente`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la orden #${orderId}? Esta acción no se puede deshacer.`)) {
      const updated = orders.filter(order => order.id !== orderId);
      setOrders(updated);
      saveOrders(updated);
      notify(`Orden #${orderId} eliminada`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'service':
        return (
          <div className="space-y-16 animate-fade-in">
            {/* Sección 1: Recepción */}
            <section className="scroll-mt-8">
              <ReceptionForm onSave={handleSaveOrder} />
            </section>
            
            <hr className="border-gray-200 border-2 rounded-full mx-auto w-1/4" />

            {/* Sección 2: Gestión (Continuación) */}
            <section className="pb-20">
              <div className="mb-8 flex items-center gap-3 text-emerald-800">
                <Wrench size={32} />
                <h2 className="text-3xl font-bold tracking-tight">Gestión Técnica de Órdenes</h2>
              </div>
              <OrderManagement 
                orders={orders} 
                onUpdateOrder={handleUpdateOrder} 
                onDeleteOrder={handleDeleteOrder}
              />
            </section>
          </div>
        );
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'reports':
        return <Reports orders={orders} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Notifications Portal-like */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
          <div className="bg-emerald-800 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border-2 border-emerald-500/50 backdrop-blur-md">
            <Bell size={20} className="text-emerald-400" />
            <span className="font-bold uppercase tracking-tight text-sm">{showNotification}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          60% { transform: translate(-50%, 10%); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Layout>
  );
};

export default App;
