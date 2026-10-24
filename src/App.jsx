import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    const unsubDealers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setDealers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.role === 'Dealer'));
    });

    return () => {
      unsubOrders();
      unsubServices();
      unsubDealers();
    };
  }, []);

  const markServiceCompleted = async (id) => {
    try {
      await updateDoc(doc(db, 'services', id), { status: 'Completed' });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: '#F3F4F6', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* --- Top Navbar (Matched App Header Color) --- */}
      <header style={{ backgroundColor: '#3B82F6', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', elevation: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, color: '#FFF', fontSize: '22px', fontWeight: 'bold' }}>
          Califnco <span style={{ fontWeight: '400', opacity: 0.9 }}>Admin Panel</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', marginRight: '8px', boxShadow: '0 0 8px #10B981' }}></span>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>Live Sync 🟢</span>
        </div>
      </header>

      {/* --- Tabs Navigation --- */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '10px', padding: '0 40px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        {['orders', 'dealers', 'services'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '16px 20px', cursor: 'pointer', border: 'none', background: 'none',
              borderBottom: activeTab === tab ? '3px solid #3B82F6' : '3px solid transparent',
              color: activeTab === tab ? '#1D4ED8' : '#6B7280',
              fontWeight: activeTab === tab ? 'bold' : '600',
              fontSize: '15px', textTransform: 'capitalize', transition: '0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Main Dashboard Content --- */}
      <div style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
            <h2 style={sectionTitleStyle}>Recent Orders <span style={badgeStyle}>{orders.length}</span></h2>
            <div style={gridContainerStyle}>
              {orders.map(item => (
                <div key={item.id} style={cardStyle}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 'bold' }}>ID: {item.id.substring(0, 10).toUpperCase()}</span>
                    <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '16px' }}>
                      ₹{item.totalAmount}
                    </span>
                  </div>
                  
                  {/* Data Rows */}
                  <div style={infoRowStyle}><span style={infoLabelStyle}>👤 Customer</span><span style={infoValueStyle}>{item.email}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📞 Phone</span><span style={infoValueStyle}>{item.phone || 'N/A'}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📍 Address</span><span style={infoValueStyle}>{item.address || 'N/A'}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📅 Date</span><span style={infoValueStyle}>{new Date(item.date).toLocaleString()}</span></div>
                  
                  {/* Purchased Items Box */}
                  <div style={{ marginTop: '15px', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', borderWidth: '1px', borderColor: '#E5E7EB', borderStyle: 'solid' }}>
                    <strong style={{ fontSize: '13px', color: '#374151' }}>Purchased Items:</strong>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.items?.map((prod, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563', borderBottom: i !== item.items.length - 1 ? '1px dashed #D1D5DB' : 'none', paddingBottom: i !== item.items.length - 1 ? '6px' : '0' }}>
                          <span>📦 {prod.name}</span>
                          <span style={{ fontWeight: 'bold', color: '#111827' }}>x{prod.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <>
            <h2 style={sectionTitleStyle}>Service Requests <span style={badgeStyle}>{services.length}</span></h2>
            <div style={gridContainerStyle}>
              {services.map(item => (
                <div key={item.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, color: '#1D4ED8', fontSize: '16px', fontWeight: 'bold' }}>🔧 {item.serviceType}</h3>
                    <span style={{ 
                      backgroundColor: item.status === 'Completed' ? '#D1FAE5' : '#FEF3C7', 
                      color: item.status === 'Completed' ? '#065F46' : '#92400E', 
                      padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      {item.status}
                    </span>
                  </div>
                  
                  {/* Data Rows */}
                  <div style={infoRowStyle}><span style={infoLabelStyle}>👤 Customer</span><span style={infoValueStyle}>{item.email}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📞 Phone</span><span style={infoValueStyle}>{item.phone || 'N/A'}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📍 Address</span><span style={infoValueStyle}>{item.address || 'N/A'}</span></div>
                  <div style={infoRowStyle}><span style={infoLabelStyle}>📅 Date</span><span style={infoValueStyle}>{new Date(item.date).toLocaleString()}</span></div>
                  
                  {item.status !== 'Completed' && (
                    <button 
                      onClick={() => markServiceCompleted(item.id)} 
                      style={{ width: '100%', backgroundColor: '#F59E0B', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Mark as Completed ✅
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* DEALERS TAB */}
        {activeTab === 'dealers' && (
          <>
             <h2 style={sectionTitleStyle}>Registered Dealers <span style={badgeStyle}>{dealers.length}</span></h2>
             <div style={{ ...gridContainerStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {dealers.map(item => (
                <div key={item.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#DBEAFE', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
                    🏢
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#1F2937', fontSize: '14px' }}>{item.email}</p>
                    <span style={{ 
                      backgroundColor: item.status === 'Approved' ? '#D1FAE5' : '#FEF3C7', 
                      color: item.status === 'Approved' ? '#065F46' : '#92400E', 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' 
                    }}>
                      {item.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- App-Matched CSS Styles ---
const sectionTitleStyle = { color: '#1D4ED8', fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' };
const badgeStyle = { backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '14px', padding: '2px 10px', borderRadius: '20px', fontWeight: 'bold' };
const gridContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' };

const cardStyle = { 
  backgroundColor: '#FFF', 
  padding: '20px', 
  borderRadius: '10px', 
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
  border: '1px solid #E5E7EB', 
  display: 'flex', 
  flexDirection: 'column'
};

const infoRowStyle = { 
  display: 'flex', 
  alignItems: 'flex-start', 
  margin: '6px 0', 
  fontSize: '14px'
};

const infoLabelStyle = { 
  width: '100px', 
  flexShrink: 0,
  color: '#6B7280', 
  fontWeight: 'bold'
};

const infoValueStyle = { 
  flex: 1, 
  color: '#374151', 
  fontWeight: '500',
  wordBreak: 'break-word' 
};