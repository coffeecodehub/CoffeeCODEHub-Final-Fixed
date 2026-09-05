const r=require('express').Router(),c=require('../controllers/crudController'),auth=require('../middleware/auth'),M=require('../models/Project'),mongoose=require('mongoose');
const x=c(M,{publicFilter:()=>({isPublished:true})});

// Public project list: keep it fresh so a newly-created/edited project cannot
// leave the browser with a stale ID that no longer exists.
r.get('/',(req,res,next)=>{res.set('Cache-Control','public, max-age=15, stale-while-revalidate=60');next();},x.list);
r.get('/admin',auth,async(req,res)=>res.json({success:true,data:await M.find().sort({displayOrder:1,createdAt:-1})}));

// Public detail lookup accepts both the normal slug and Mongo _id. It also
// tolerates legacy records where the slug was accidentally saved as a URL.
r.get('/:identifier',async(req,res,next)=>{
  try{
    const raw=decodeURIComponent(String(req.params.identifier||'')).trim();
    if(!raw) return res.status(404).json({success:false,message:'Project not found'});

    let data=null;
    if(mongoose.isValidObjectId(raw)) data=await M.findOne({_id:raw,isPublished:true});

    if(!data){
      const candidates=new Set([raw]);
      // Repair URL-like values such as https:/example.com and encoded URLs.
      if(/^https?:\/[^/]/i.test(raw)) candidates.add(raw.replace(/^https?:\//i, m=>m+'/'));
      if(/^https?:\/\//i.test(raw)) candidates.add(raw.replace(/^https?:\/\//i,''));
      data=await M.findOne({isPublished:true,$or:[
        {slug:{$in:[...candidates]}},
        {liveUrl:{$in:[...candidates]}}
      ]});
    }

    if(!data) return res.status(404).json({success:false,message:'Project not found'});
    res.set('Cache-Control','public, max-age=30, stale-while-revalidate=120');
    return res.json({success:true,data});
  }catch(e){next(e)}
});

r.post('/',auth,x.create);r.put('/:id',auth,x.update);r.delete('/:id',auth,x.remove);
module.exports=r;
