const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/register', async (req, res) => {
  const { name, owner_name, phone, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('shops').insert([{ name, owner_name, phone, password_hash }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Shop registered!', shop: data[0] });
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const { data, error } = await supabase.from('shops').select('*').eq('phone', phone).single();
  if (error || !data) return res.status(400).json({ error: 'Shop not found' });
  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return res.status(400).json({ error: 'Wrong password' });
  const token = jwt.sign({ shop_id: data.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, shop: data });
});

module.exports = router;
