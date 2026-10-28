const express=require('express');
const supabase=require('../supabase');
const router=express.Router();
router.get('/',async(req,res)=>{
  const now=new Date(); const today=now.toISOString().slice(0,10);
  const start=new Date(now); start.setUTCDate(start.getUTCDate()-6); const startDate=start.toISOString().slice(0,10);
  const {data,error}=await supabase.from('water_entries').select('litres,entry_date').gte('entry_date',startDate).lte('entry_date',today);
  if(error){console.error('Supabase summary failed:',error.code||'unknown');return res.status(500).json({error:'Could not load the dashboard summary.'});}
  const dailyMap={}; for(let i=6;i>=0;i--){const d=new Date(now);d.setUTCDate(d.getUTCDate()-i);dailyMap[d.toISOString().slice(0,10)]=0;}
  let todayLitres=0,weekLitres=0;
  for(const entry of data){const amount=Number(entry.litres);dailyMap[entry.entry_date]=(dailyMap[entry.entry_date]||0)+amount;weekLitres+=amount;if(entry.entry_date===today)todayLitres+=amount;}
  const {count,countError}= {count:null,countError:null};
  const totalResult=await supabase.from('water_entries').select('id',{count:'exact',head:true});
  if(totalResult.error){console.error('Supabase count failed:',totalResult.error.code||'unknown');return res.status(500).json({error:'Could not load the dashboard count.'});}
  res.json({data:{todayLitres:Number(todayLitres.toFixed(1)),weekLitres:Number(weekLitres.toFixed(1)),totalEntries:totalResult.count||0,daily:Object.entries(dailyMap).map(([date,litres])=>({date,litres:Number(litres.toFixed(1))}))}});
});
module.exports=router;
