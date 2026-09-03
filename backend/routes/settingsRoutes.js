const r=require('express').Router();
const auth=require('../middleware/auth');
const Site=require('../models/SiteSettings');
const Home=require('../models/Homepage');

const SOCIAL_KEYS=['facebook','instagram','linkedin','twitter','tiktok','youtube','whatsapp','github','telegram','discord','pinterest','threads','snapchat','reddit'];
const DEFAULT_NAV=[
  {label:'Home',path:'/',displayOrder:0},
  {label:'About',path:'/about',displayOrder:1},
  {label:'Services',path:'/services',displayOrder:2},
  {label:'Projects',path:'/projects',displayOrder:3},
  {label:'Blog',path:'/blog',displayOrder:4},
  {label:'Team',path:'/team',displayOrder:5},
  {label:'Reviews',path:'/review',displayOrder:6},
  {label:'Contact',path:'/contact',displayOrder:7}
];

function normalizeNavigation(input){
  const incoming=Array.isArray(input)?input:[];
  const byPath=new Map(incoming.filter(x=>x&&x.path).map(x=>[x.path,x]));
  return DEFAULT_NAV.map((item,index)=>{
    const current=byPath.get(item.path);
    return current ? {...item,...current,displayOrder:index} : {...item};
  }).filter(x=>x.isActive!==false).sort((a,b)=>(a.displayOrder??0)-(b.displayOrder??0));
}

function sanitizeSocialLinks(input){
  const out={};
  for(const key of SOCIAL_KEYS){
    const value=input?.[key];
    out[key]=typeof value==='string'?value.trim():'';
  }
  return out;
}

r.get('/',async(req,res)=>{
  try{
    const data=await Site.findOne({key:'global'}).lean()||{};
    data.navigation=normalizeNavigation(data.navigation);
    data.socialLinks=sanitizeSocialLinks(data.socialLinks);
    res.json({success:true,data});
  }catch(e){res.status(500).json({success:false,message:'Unable to load site settings'});}
});

r.put('/',auth,async(req,res)=>{
  try{
    const body=req.body||{};
    const allowed=['companyName','logo','favicon','tagline','heroTitle','heroSubtitle','heroDescription','heroImage','phone','whatsapp','email','address','mapUrl','footerDescription','copyrightText','defaultSeoTitle','defaultSeoDescription','defaultOgImage'];
    const set={};
    for(const key of allowed) if(Object.prototype.hasOwnProperty.call(body,key)) set[key]=body[key];
    if(Object.prototype.hasOwnProperty.call(body,'socialLinks')) set.socialLinks=sanitizeSocialLinks(body.socialLinks);
    if(Object.prototype.hasOwnProperty.call(body,'navigation')) set.navigation=normalizeNavigation(body.navigation);
    set.key='global';
    const data=await Site.findOneAndUpdate({key:'global'},{$set:set},{new:true,upsert:true,setDefaultsOnInsert:true}).lean();
    data.navigation=normalizeNavigation(data.navigation);
    data.socialLinks=sanitizeSocialLinks(data.socialLinks);
    res.json({success:true,data});
  }catch(e){console.error('Settings update error:',e);res.status(500).json({success:false,message:e.message||'Unable to save site settings'});}
});

r.get('/homepage',async(req,res)=>res.json({success:true,data:await Home.findOne({key:'home'}).lean()||{}}));
r.put('/homepage',auth,async(req,res)=>res.json({success:true,data:await Home.findOneAndUpdate({key:'home'},{$set:{...(req.body||{}),key:'home'}},{new:true,upsert:true,setDefaultsOnInsert:true})}));

module.exports=r;
