const r=require('express').Router(),c=require('../controllers/crudController'),auth=require('../middleware/auth'),M=require('../models/Blog');
const x=c(M,{publicFilter:()=>({status:'published'})});
r.get('/',x.list);r.get('/admin',auth,async(req,res)=>res.json({success:true,data:await M.find().sort({createdAt:-1})}));r.get('/:slug',x.get);
r.post('/',auth,x.create);r.put('/:id',auth,x.update);r.delete('/:id',auth,x.remove);module.exports=r;
