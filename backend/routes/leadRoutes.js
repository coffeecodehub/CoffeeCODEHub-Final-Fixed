const r=require('express').Router(),c=require('../controllers/leadController'),auth=require('../middleware/auth');
r.post('/',c.create);
r.get('/export',auth,c.exportExcel);
r.get('/',auth,c.list);
r.get('/:id',auth,c.get);
r.put('/:id',auth,c.update);
r.delete('/:id',auth,c.remove);
module.exports=r;
