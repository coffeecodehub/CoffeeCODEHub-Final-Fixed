const r=require('express').Router(),c=require('../controllers/reviewController'),auth=require('../middleware/auth'),upload=require('../middleware/upload');
r.post('/',upload.array('proofScreenshots',2),c.create);
r.get('/',async(req,res)=>c.listApproved(req,res));
r.get('/admin',auth,c.list);

r.delete('/:id',auth,c.remove);
module.exports=r;
