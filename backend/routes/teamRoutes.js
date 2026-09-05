const r=require('express').Router(),c=require('../controllers/crudController'),auth=require('../middleware/auth'),M=require('../models/TeamMember');
const {sortTeamMembers}=require('../utils/teamSort');
const x=c(M,{publicFilter:()=>({isActive:true})});

r.get('/',async(req,res)=>{
  const data=await M.find({isActive:true}).sort({createdAt:-1}).lean();
  res.json({success:true,data:sortTeamMembers(data)});
});

r.get('/admin',auth,async(req,res)=>{
  const data=await M.find().sort({createdAt:-1}).lean();
  res.json({success:true,data:sortTeamMembers(data)});
});

r.post('/',auth,x.create);
r.put('/:id',auth,x.update);
r.delete('/:id',auth,x.remove);

module.exports=r;
