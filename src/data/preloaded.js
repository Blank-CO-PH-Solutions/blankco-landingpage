// Data fetched at build time and embedded into each prerendered page.
// The client seeds this cache before rendering so the first paint matches
// the static HTML and no extra request is required for above-the-fold content.
let preloaded = {
  projects: null,
  teamMembers: null,
}

export function setPreloadedData(data = {}) {
  if (Array.isArray(data.projects)) preloaded.projects = data.projects
  if (Array.isArray(data.teamMembers)) preloaded.teamMembers = data.teamMembers
}

export function getPreloadedProjects() {
  return preloaded.projects
}

export function getPreloadedTeamMembers() {
  return preloaded.teamMembers
}
