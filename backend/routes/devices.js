const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.shop = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};

router.post('/add-customer', auth, async (req, res) => {
  const { name, cnic, phone, device_imei, device_model, due_date, amount } = req.body;
  const { data: customer, error } = await supabase.from('customers')
    .insert([{ shop_id: req.shop.shop_id, name, cnic, phone, device_imei, device_model }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.from('devices').insert([{ customer_id: customer.id }]);
  await supabase.from('instalments').insert([{ customer_id: customer.id, due_date, amount }]);
  res.json({ message: 'Customer added!', customer });
});

router.post('/lock/:customer_id', auth, async (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await supabase.from('devices').update({ is_locked: true, unlock_code: code }).eq('customer_id', req.params.customer_id);
  res.json({ message: 'Device locked!', unlock_code: code });
});

router.post('/unlock/:customer_id', auth, async (req, res) => {
  const { code } = req.body;
  const { data } = await supabase.from('devices').select('unlock_code').eq('customer_id', req.params.customer_id).single();
  if (!data || data.unlock_code !== code) return res.status(400).json({ error: 'Wrong code' });
  await supabase.from('devices').update({ is_locked: false, unlock_code: null }).eq('customer_id', req.params.customer_id);
  res.json({ message: 'Device unlocked!' });
});

router.get('/status/:customer_id', async (req, res) => {
  const { data, error } = await supabase.from('devices').select('is_locked, unlock_code').eq('customer_id', req.params.customer_id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/customers', auth, async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*, devices(*), instalments(*)').eq('shop_id', req.shop.shop_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
