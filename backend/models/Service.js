const mongoose=require('mongoose');
const fieldSchema=new mongoose.Schema({fieldId:String,label:{type:String,required:true},name:{type:String,required:true},type:{type:String,enum:['text','textarea','email','phone','number','select','multiselect','checkbox','radio','url','budget','date'],default:'text'},placeholder:String,required:{type:Boolean,default:false},options:[String],displayOrder:{type:Number,default:0}},{_id:false});
const faqSchema=new mongoose.Schema({question:String,answer:String},{_id:false});
const processSchema=new mongoose.Schema({title:String,description:String,displayOrder:{type:Number,default:0}},{_id:false});
module.exports=mongoose.model('Service',new mongoose.Schema({
 title:{type:String,required:true,trim:true},slug:{type:String,required:true,unique:true,index:true},shortDescription:{type:String,required:true},fullDescription:String,iconIdentifier:String,category:String,keyFeatures:[String],technologies:[String],deliverables:[String],process:[processSchema],faq:[faqSchema],image:String,isActive:{type:Boolean,default:true,index:true},isFeatured:{type:Boolean,default:false},displayOrder:{type:Number,default:0},formFields:[fieldSchema],seoTitle:String,metaDescription:String
},{timestamps:true}));
