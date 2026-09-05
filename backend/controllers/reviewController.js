const Review=require('../models/Review');
const {uploadBuffer,deleteMedia}=require('../services/mediaService');
exports.create=async(req,res)=>{try{const rating=Number(req.body.rating);if(!req.body.clientName||!req.body.feedbackText||rating<1||rating>5)return res.status(400).json({success:false,message:'Name, rating and feedback are required.'});const body={...req.body,rating,status:'approved',verifiedClient:false};if(req.file){const up=await uploadBuffer(req.file,'coffeecodehub/reviews');if(up){body.proofScreenshot=up.secure_url;body.proofScreenshotPublicId=up.public_id}}const data=await Review.create(body);res.status(201).json({success:true,message:'Review published successfully',data})}catch(e){res.status(400).json({success:false,message:e.message})}};
exports.list=async(req,res)=>{const data=await Review.find({status:{$ne:'rejected'}}).sort({createdAt:-1});res.json({success:true,data})};
exports.listApproved=async(req,res)=>res.json({success:true,data:await Review.find({status:{$ne:'rejected'}}).sort({createdAt:-1})});
exports.update=async(req,res)=>{const allowed=['status','verifiedClient','clientName','companyName','clientWebsiteUrl','projectLink','rating','feedbackText'];const update={};allowed.forEach(k=>{if(req.body[k]!==undefined)update[k]=req.body[k]});const data=await Review.findByIdAndUpdate(req.params.id,update,{new:true,runValidators:true});res.json({success:true,data})};
exports.remove=async(req,res)=>{
  try {
    const review=await Review.findById(req.params.id);
    if(!review)return res.status(404).json({success:false,message:'Review not found.'});

    if(review.proofScreenshotPublicId){
      try{await deleteMedia(review.proofScreenshotPublicId)}catch(e){console.error('Review proof cleanup failed:',e.message)}
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({success:true,message:'Review deleted successfully.'});
  }catch(e){
    res.status(400).json({success:false,message:e.message||'Unable to delete review.'});
  }
};
