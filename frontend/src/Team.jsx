import BackButton from './components/BackButton';
import { useEffect, useState } from 'react';
import SEO from './components/SEO';
import SectionTitle from './components/SectionTitle';
import { api } from './lib/api';
import SocialLinks from './components/SocialLinks';
import { mediaUrl } from './lib/media';
import { sortTeamMembers } from './lib/teamSort';

export default function Team(){
  const [team,setTeam]=useState([]);

  useEffect(()=>{
    api('/team?active=true')
      .then(r => setTeam(sortTeamMembers(r.data || [])))
      .catch(() => {});
  },[]);

  return (
    <>
      <SEO
        title="CoffeeCODEHub Team"
        description="Meet the CoffeeCODEHub team working across software development, design and digital solutions."
        path="/team"
      />

      <main className="pt-20 min-h-screen">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6">
          <BackButton fallback="/"/>
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24">

          <SectionTitle
            eyebrow="Our team"
            title="The people behind the work."
            text="Meet the talented team behind CoffeeCODEHub, dedicated to turning ideas into innovative digital solutions."
          />

          {team.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {team.map(m => (
                <article
                  key={m._id}
                  className="rounded-3xl border overflow-hidden bg-white"
                >

                  <div className="aspect-[4/5] bg-slate-100 overflow-hidden">

                    {m.avatarUrl ? (
                      <img
                        src={mediaUrl(m.avatarUrl)}
                        alt={m.name}
                        className="block w-full h-full object-cover object-center bg-slate-100" decoding="async" loading="lazy"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-6xl font-black text-slate-300">
                        {m.name?.[0]}
                      </div>
                    )}

                  </div>

                  <div className="p-6">

                    <h2 className="text-xl font-black">
                      {m.name}
                    </h2>

                    <p className="text-[#b77900] font-bold text-sm mt-1">
                      {m.designation}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {m.bio}
                    </p>

                    <SocialLinks
                      socialLinks={m.socialLinks}
                      className="mt-5"
                      itemClassName="w-9 h-9 rounded-lg"
                    />

                  </div>

                </article>
              ))}

            </div>
          ) : (
            <div className="border border-dashed rounded-3xl p-10 text-center text-slate-500">
              Meet the talented team behind CoffeeCODEHub, dedicated to turning ideas into innovative digital solutions.
            </div>
          )}

        </div>

      </main>
    </>
  );
}