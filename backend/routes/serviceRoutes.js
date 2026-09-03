const r=require('express').Router(),c=require('../controllers/crudController'),auth=require('../middleware/auth'),M=require('../models/Service');
const x=c(M,{publicFilter:()=>({isActive:true})});
r.get('/',x.list);r.get('/admin',auth,async(req,res)=>res.json({success:true,data:await M.find().sort({displayOrder:1,createdAt:-1})}));r.get('/:slug',x.get);
r.post('/',auth,x.create);r.put('/:id',auth,x.update);r.delete('/:id',auth,x.remove);module.exports=r;
