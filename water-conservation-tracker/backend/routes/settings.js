const express=require('express');
const supabase=require('../supabase');
const router=express.Router();
router.get('/',async(req,res)=>{
 const {data,error}=await supabase.from('app_settings').select('daily_goal_litres').eq('id',1).single();
 if(error){console.error('Settings read failed:',error.code||'unknown');return res.status(500).json({error:'Could not load settings. Run database/schema.sql first.'});}
 res.json({data});
});
router.put('/',async(req,res)=>{
 const goal=req.body?.daily_goal_litres;
 if(typeof goal!=='number'||!Number.isFinite(goal)||goal<1||goal>100000)return res.status(400).json({error:'Daily target must be a number between 1 and 100000 litres.'});
 const {data,error}=await supabase.from('app_settings').update({daily_goal_litres:goal}).eq('id',1).select('daily_goal_litres').single();
 if(error){console.error('Settings update failed:',error.code||'unknown');return res.status(500).json({error:'Could not save the daily target.'});}
 res.json({data});
});
module.exports=router;
