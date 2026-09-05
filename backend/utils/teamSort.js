function getTeamRolePriority(member) {
  const designation = String(member?.designation || '').trim().toLowerCase();
  if (designation.includes('founder') || designation.includes('co-founder') || designation.includes('cofounder')) return 1;
  if (designation === 'ceo' || designation.includes('chief executive') || /\bceo\b/.test(designation)) return 2;
  if (designation === 'manager' || designation.includes('manager') || designation.includes('head of')) return 3;
  if (
    designation === 'other leadership' || designation.includes('director') || designation.includes('lead') ||
    designation.includes('chief') || designation.includes('president') || designation.includes('vice president') ||
    designation === 'vp' || designation.includes('supervisor')
  ) return 4;
  if (
    designation.includes('developer') || designation.includes('engineer') || designation.includes('programmer') ||
    designation.includes('frontend') || designation.includes('backend') || designation.includes('full stack') ||
    designation.includes('full-stack') || designation.includes('software')
  ) return 5;
  if (designation.includes('designer') || designation === 'design' || designation.includes('ui/ux') || designation.includes('ui ux') || designation.includes('graphic')) return 6;
  return 7;
}

function sortTeamMembers(members = []) {
  return [...members]
    .map((member, index) => ({ member, priority: getTeamRolePriority(member), index }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .map(({ member }) => member);
}

module.exports = { getTeamRolePriority, sortTeamMembers };
