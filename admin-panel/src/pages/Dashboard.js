import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://minhaslock-backend.onrender.com/api';

export default function Dashboard({ token, setToken }) {
  const [customers, setCustomers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', cnic:'', phone:'', device_imei:'', device_model:'', due_date:'', amount:'' });
  const [msg, setMsg] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadCustomers = async () => {
    const res = await axios.get(`${API}/devices/customers`, { headers });
    setCustomers(res.data);
  };

  useEffect(() => { loadCustomers(); }, []);

  const addCustomer = async () => {
    try {
      await axios.post(`${API}/devices/add-customer`, form, { headers });
      setMsg('Customer added!'); setShowAdd(false); loadCustomers();
    } catch(e) { setMsg(e.response?.data?.error || 'Error'); }
  };

  const lockDevice = async (id) => {
    const res = await axios.post(`${API}/devices/lock/${id}`, {}, { headers });
    alert(`Device LOCKED!\nUnlock Code: ${res.data.unlock_code}\nSave this code!`);
    loadCustomers();
  };

  const unlockDevice = async (id) => {
    const code = prompt('Enter unlock code:');
    if (!code) return;
    try {
      await axios.post(`${API}/devices/unlock/${id}`, { code }, { headers });
      alert('Device UNLOCKED!'); loadCustomers();
    } catch(e) { alert('Wrong code!'); }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5'}}>
      <div style={{background:'#1a1a2e',color:'white',padding:'15px 30px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0,color:'#e94560'}}>🔒 Minhas Lock Admin</h2>
        <div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{...btn,marginRight:10}}>+ Add Customer</button>
          <button onClick={()=>{localStorage.clear();setToken(null);}} style={{...btn,background:'#555'}}>Logout</button>
        </div>
      </div>

      {msg && <div style={{background:'#4caf50',color:'white',padding:10,textAlign:'center'}}>{msg}</div>}

      {showAdd && (
        <div style={{background:'white',margin:20,padding:20,borderRadius:8,maxWidth:500}}>
          <h3>Add New Customer</h3>
          {['name','cnic','phone','device_imei','device_model'].map(f=>(
            <input key={f} placeholder={f.replace('_',' ').toUpperCase()} style={inp}
              onChange={e=>setForm({...form,[f]:e.target.value})} />
          ))}
          <input type="date" style={inp} onChange={e=>setForm({...form,due_date:e.target.value})} />
          <input placeholder="Monthly Amount (Rs)" style={inp} onChange={e=>setForm({...form,amount:e.target.value})} />
          <button style={btn} onClick={addCustomer}>Save Customer</button>
        </div>
      )}

      <div style={{padding:20}}>
        <h3>All Customers ({customers.length})</h3>
        {customers.map(c=>(
          <div key={c.id} style={{background:'white',padding:15,marginBottom:10,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <strong>{c.name}</strong> — {c.phone}<br/>
              <small>IMEI: {c.device_imei} | Model: {c.device_model}</small><br/>
              <small>CNIC: {c.cnic}</small>
            </div>
            <div>
              {c.devices?.[0]?.is_locked
                ? <button style={{...btn,background:'#4caf50'}} onClick={()=>unlockDevice(c.id)}>🔓 Unlock</button>
                : <button style={{...btn,background:'#e94560'}} onClick={()=>lockDevice(c.id)}>🔒 Lock</button>
              }
            </div>
          </div>
        ))}
        {customers.length===0 && <p style={{color:'#999'}}>No customers yet. Add your first customer!</p>}
      </div>
    </div>
  );
}

const inp = {width:'100%',padding:10,margin:'6px 0',borderRadius:6,border:'1px solid #ddd',boxSizing:'border-box',display:'block'};
const btn = {padding:'10px 20px',background:'#e94560',color:'white',border:'none',borderRadius:6,cursor:'pointer',fontWeight:'bold'};
