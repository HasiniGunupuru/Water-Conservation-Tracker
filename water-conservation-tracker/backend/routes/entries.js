const express = require('express');
const supabase = require('../supabase');
const { validateEntry } = require('../utils/validation');
const router = express.Router();
function dbError(res, error) {
  console.error('Supabase operation failed:', error.code || 'unknown');
  return res.status(500).json({ error: 'Could not complete the database operation. Check your database setup.' });
}
router.get('/', async (req,res) => {
  const { data,error } = await supabase.from('water_entries').select('id,activity,litres,entry_date,note,created_at').order('entry_date',{ascending:false}).order('created_at',{ascending:false}).limit(500);
  if(error)return dbError(res,error);
  res.json({data});
});
router.post('/', async (req,res) => {
  const validation=validateEntry(req.body); if(validation)return res.status(400).json({error:validation});
  const record={activity:req.body.activity,litres:req.body.litres,entry_date:req.body.entry_date,note:(req.body.note||'').trim()||null};
  const {data,error}=await supabase.from('water_entries').insert(record).select('id,activity,litres,entry_date,note,created_at').single();
  if(error)return dbError(res,error);
  res.status(201).json({data});
});
router.delete('/:id', async (req,res) => {
  const id=req.params.id;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return res.status(400).json({error:'Entry ID is invalid.'});
  const {data,error}=await supabase.from('water_entries').delete().eq('id',id).select('id').maybeSingle();
  if(error)return dbError(res,error);
  if(!data)return res.status(404).json({error:'Entry not found.'});
  res.json({data:{id:data.id}});
});
module.exports=router;
