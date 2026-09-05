const normalizeDesignation = (member) => String(member?.designation || '').trim().toLowerCase();

export const getTeamRolePriority = (member) => {
  const designation = normalizeDesignation(member);

  // 1. Founder / Co-Founder (including legacy "Founder & CEO")
  if (designation.includes('founder') || designation.includes('co-founder') || designation.includes('cofounder')) return 1;

  // 2. CEO
  if (designation === 'ceo' || designation.includes('chief executive') || /\bceo\b/.test(designation)) return 2;

  // 3. Manager
  if (designation === 'manager' || designation.includes('manager') || designation.includes('head of')) return 3;

  // 4. Other leadership
  if (
    designation === 'other leadership' ||
    designation.includes('director') ||
    designation.includes('lead') ||
    designation.includes('chief') ||
    designation.includes('president') ||
    designation.includes('vice president') ||
    designation === 'vp' ||
    designation.includes('supervisor')
  ) return 4;

  // 5. Developers
  if (
    designation.includes('developer') ||
    designation.includes('engineer') ||
    designation.includes('programmer') ||
    designation.includes('frontend') ||
    designation.includes('backend') ||
    designation.includes('full stack') ||
    designation.includes('full-stack') ||
    designation.includes('software')
  ) return 5;

  // 6. Designers
  if (
    designation.includes('designer') ||
    designation === 'design' ||
    designation.includes('ui/ux') ||
    designation.includes('ui ux') ||
    designation.includes('graphic')
  ) return 6;

  // 7. Other team members
  return 7;
};

export const sortTeamMembers = (members = []) => [...members]
  .map((member, index) => ({ member, priority: getTeamRolePriority(member), index }))
  .sort((a, b) => a.priority - b.priority || a.index - b.index)
  .map(({ member }) => member);
