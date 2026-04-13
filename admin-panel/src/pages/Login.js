import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export default function Login({ setToken }) {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', owner_name: '', phone: '', password: '' });

  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (e) { setError(e.response?.data?.error || 'Login failed'); }
  };

  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, regForm);
      alert('Shop registered! Now login.');
      setIsRegister(false);
    } catch (e) { setError(e.response?.data?.error || 'Register failed'); }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#1a1a2e'}}>
      <div style={{background:'white',padding:40,borderRadius:12,width:350,textAlign:'center'}}>
        <h2 style={{color:'#e94560'}}>🔒 Minhas Lock</h2>
        <h3>{isRegister ? 'Register Shop' : 'Admin Login'}</h3>
        {error && <p style={{color:'red'}}>{error}</p>}
        {isRegister ? (
          <>
            <input placeholder="Shop Name" style={inp} onChange={e=>setRegForm({...regForm,name:e.target.value})} /><br/>
            <input placeholder="Owner Name" style={inp} onChange={e=>setRegForm({...regForm,owner_name:e.target.value})} /><br/>
            <input placeholder="Phone" style={inp} onChange={e=>setRegForm({...regForm,phone:e.target.value})} /><br/>
            <input placeholder="Password" type="password" style={inp} onChange={e=>setRegForm({...regForm,password:e.target.value})} /><br/>
            <button style={btn} onClick={register}>Register</button><br/>
            <button style={link} onClick={()=>setIsRegister(false)}>Already have account? Login</button>
          </>
        ) : (
          <>
            <input placeholder="Phone" style={inp} onChange={e=>setForm({...form,phone:e.target.value})} /><br/>
            <input placeholder="Password" type="password" style={inp} onChange={e=>setForm({...form,password:e.target.value})} /><br/>
            <button style={btn} onClick={login}>Login</button><br/>
            <button style={link} onClick={()=>setIsRegister(true)}>New shop? Register here</button>
          </>
        )}
      </div>
    </div>
  );
}

const inp = {width:'100%',padding:10,margin:'8px 0',borderRadius:6,border:'1px solid #ddd',boxSizing:'border-box'};
const btn = {width:'100%',padding:12,background:'#e94560',color:'white',border:'none',borderRadius:6,cursor:'pointer',fontWeight:'bold',marginTop:8};
const link = {background:'none',border:'none',color:'#666',cursor:'pointer',marginTop:8};
