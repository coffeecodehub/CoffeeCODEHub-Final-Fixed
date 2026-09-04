const bcrypt=require('bcryptjs');
const fs=require('fs');
const path=require('path');
const {v2:cloudinary}=require('cloudinary');

const Admin=require('../models/Admin'),
Service=require('../models/Service'),
Project=require('../models/Project'),
Site=require('../models/SiteSettings'),
Home=require('../models/Homepage'),
Blog=require('../models/Blog');

const services=[
  ['Web Development','web-development','Fast, responsive and conversion-focused websites and web applications.'],
  ['Software Development','software-development','Custom business software built around your real workflows.'],
  ['Mobile App Development','mobile-app-development','Cross-platform mobile apps with polished UX and reliable backends.'],
  ['UI/UX Design','ui-ux-design','Clear product experiences that look premium and are easy to use.'],
  ['WordPress Development','wordpress-development','Professional WordPress websites that are easy to manage and grow.'],
  ['E-commerce Development','ecommerce-development','Online stores designed to turn browsing into measurable sales.'],
  ['Digital Marketing','digital-marketing','Content and campaigns designed around measurable business goals.'],
  ['Branding & Strategy','branding-strategy','A coherent visual identity and digital positioning for your business.']
];

exports.seed=async()=>{

  if(process.env.SEED_DEFAULTS!=='true')return;

  const adminEmail=process.env.ADMIN_EMAIL.trim().toLowerCase();
  const password=process.env.ADMIN_PASSWORD;

  let existing=await Admin.findOne({email:adminEmail});

  /*
   * ADMIN AUTH FIX
   *
   * If the admin already exists in MongoDB but ADMIN_PASSWORD
   * was changed on Render, the old bcrypt hash would remain.
   *
   * We now compare the Render environment password with the
   * existing hash and update the hash when required.
   */

  if(!existing){

    existing=await Admin.create({
      name:'CoffeeCODEHub Admin',
      email:adminEmail,
      passwordHash:await bcrypt.hash(password,12),
      role:'admin'
    });

    console.log(`Seeded admin: ${adminEmail}`);

  }else{

    const passwordMatches=await bcrypt.compare(
      password,
      existing.passwordHash||''
    );

    if(!passwordMatches){

      existing.passwordHash=await bcrypt.hash(password,12);
      existing.isActive=true;

      await existing.save();

      console.log(
        `Updated admin password from environment: ${adminEmail}`
      );

    }else if(!existing.isActive){

      existing.isActive=true;

      await existing.save();

    }

  }

  for(const [title,slug,shortDescription] of services){

    const i=services.findIndex(x=>x[1]===slug);

    const defaults={
      title,
      slug,
      shortDescription,

      fullDescription:
        `${shortDescription} CoffeeCODEHub combines strategy, design and engineering to deliver practical digital solutions.`,

      category:'IT Services',

      iconIdentifier:[
        'globe',
        'code',
        'mobile',
        'palette',
        'globe',
        'cart',
        'bullhorn',
        'rocket'
      ][i],

      keyFeatures:[
        'Responsive experience',
        'Business-focused implementation',
        'Maintainable architecture',
        'Clear delivery milestones'
      ],

      technologies:[
        'React',
        'Node.js',
        'MongoDB'
      ],

      deliverables:[
        'Responsive production-ready experience',
        'Clean maintainable implementation',
        'Deployment-ready handover',
        'Post-launch improvement path'
      ],

      process:[
        {
          title:'Discover',
          description:'Understand goals, users, scope and priorities',
          displayOrder:0
        },
        {
          title:'Plan',
          description:'Define milestones, architecture and delivery plan',
          displayOrder:1
        },
        {
          title:'Build',
          description:'Design and develop the agreed solution',
          displayOrder:2
        },
        {
          title:'Test & Launch',
          description:'Validate, optimize and prepare the release',
          displayOrder:3
        }
      ],

      faq:[
        {
          question:'How does a project start?',
          answer:
            'Submit the service request with your requirements. CoffeeCODEHub reviews the brief and contacts you for the next discussion.'
        },
        {
          question:'Can the scope change later?',
          answer:
            'Yes. Scope changes are reviewed with the team and reflected in the project plan before implementation.'
        }
      ],

      formFields:[
        {
          fieldId:'scope',
          label:'Project requirements',
          name:'projectRequirements',
          type:'textarea',
          required:true,
          placeholder:'Tell us what you need to build.'
        }
      ]
    };

    let existing=await Service.findOne({slug});

    if(!existing){

      await Service.create({
        ...defaults,
        displayOrder:i,
        isActive:true,
        isFeatured:i<6
      });

    }else{

      const patch={};

      for(
        const k of [
          'fullDescription',
          'category',
          'iconIdentifier',
          'keyFeatures',
          'technologies',
          'deliverables',
          'process',
          'faq',
          'formFields'
        ]
      ){

        if(
          existing[k]===undefined||
          existing[k]===null||
          (Array.isArray(existing[k])&&existing[k].length===0)
        ){

          patch[k]=defaults[k];

        }

      }

      if(Object.keys(patch).length){

        await Service.updateOne(
          {_id:existing._id},
          {$set:patch}
        );

      }

    }

  }

  const projects=[
    {
      title:'Library Management System',
      slug:'library-management-system',
      category:'Software',
      shortDescription:
        'A structured management solution focused on records, workflows and usability.',
      techStack:['C++'],
      isFeatured:true,
      isPublished:true,
      displayOrder:0
    },

    {
      title:'Smart Home Management',
      slug:'smart-home-management',
      category:'IoT / Software',
      shortDescription:
        'An interactive smart-home control concept for connected environments.',
      techStack:['Java'],
      isFeatured:true,
      isPublished:true,
      displayOrder:1
    },

    {
      title:'E-commerce Platform',
      slug:'ecommerce-platform',
      category:'Web Development',
      shortDescription:
        'A storefront experience with shopping, product and checkout flows.',
      techStack:['HTML','CSS','JavaScript'],
      isFeatured:true,
      isPublished:true,
      displayOrder:2
    },

    {
      title:'Fitness Tracker App',
      slug:'fitness-tracker-app',
      category:'Mobile / Web',
      shortDescription:
        'A modern interface concept for tracking activity and progress.',
      techStack:['React'],
      isFeatured:true,
      isPublished:true,
      displayOrder:3
    },

    {
      title:'Educational Platform',
      slug:'educational-platform',
      category:'EdTech',
      shortDescription:
        'An LMS-style experience for courses, quizzes and learning content.',
      techStack:['WordPress'],
      isFeatured:false,
      isPublished:true,
      displayOrder:4
    },

    {
      title:'Business Branding',
      slug:'business-branding',
      category:'Branding',
      shortDescription:
        'A cohesive identity direction for a modern digital-first business.',
      techStack:['Figma'],
      isFeatured:false,
      isPublished:true,
      displayOrder:5
    }
  ];

  const assetDir=path.join(
    __dirname,
    '..',
    '..',
    'frontend',
    'src',
    'assets'
  );

  const uploadDir=path.join(
    __dirname,
    '..',
    'uploads'
  );

  fs.mkdirSync(
    uploadDir,
    {recursive:true}
  );

  const cloudinaryReady=Boolean(
    process.env.CLOUDINARY_CLOUD_NAME&&
    process.env.CLOUDINARY_API_KEY&&
    process.env.CLOUDINARY_API_SECRET
  );

  if(cloudinaryReady){

    cloudinary.config({
      cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
      api_key:process.env.CLOUDINARY_API_KEY,
      api_secret:process.env.CLOUDINARY_API_SECRET
    });

  }

  async function seedImageUrl(source,index){

    if(!fs.existsSync(source))return '';

    if(cloudinaryReady){

      const result=await cloudinary.uploader.upload(
        source,
        {
          folder:'coffeecodehub/projects',
          public_id:`seed-project-${index}`,
          resource_type:'image',
          overwrite:true
        }
      );

      return result.secure_url;

    }

    const dest=path.join(
      uploadDir,
      `seed-project-${index}.png`
    );

    if(!fs.existsSync(dest)){

      fs.copyFileSync(
        source,
        dest
      );

    }

    return `${
      (
        process.env.API_PUBLIC_URL||
        process.env.RENDER_EXTERNAL_URL||
        `http://localhost:${process.env.PORT||5000}`
      ).replace(/\/$/,'')
    }/uploads/seed-project-${index}.png`;

  }

  for(let i=0;i<projects.length;i++){

    const project=projects[i];

    const existingProject=await Project.findOne({
      slug:project.slug
    });

    const source=path.join(
      assetDir,
      `pic${i+1}.png`
    );

    if(!existingProject){

      const coverImage=await seedImageUrl(
        source,
        i+1
      );

      await Project.create({
        ...project,
        coverImage,
        fullDescription:project.shortDescription,

        caseStudy:
          `Project overview\n\n${project.shortDescription}\n\nCoffeeCODEHub project record. Add the complete client-approved case study from the Admin Panel.`
      });

    }else if(
      cloudinaryReady&&
      /localhost|127\.0\.0\.1|\/uploads\//i.test(
        String(existingProject.coverImage||'')
      )
    ){

      const coverImage=await seedImageUrl(
        source,
        i+1
      );

      if(coverImage){

        await Project.updateOne(
          {_id:existingProject._id},
          {$set:{coverImage}}
        );

      }

    }

  }

  /*
   * IMPORTANT:
   *
   * Keep the rest of your existing seed.js code below this point
   * exactly as it was in your project.
   *
   * The only authentication change required in this file is the
   * admin block at the beginning.
   */
}