export async function listGithubRepositories(ownerOrUrl, page = 1) {
  const ownerInput = ownerOrUrl.trim()
  let owner = ownerInput
  if (ownerInput.includes('://')) {
    try {
      const url = new URL(ownerInput)
      if (url.hostname !== 'github.com') throw new Error()
      owner = url.pathname.split('/').filter(Boolean)[0] || ''
    } catch {
      throw new Error('Enter a GitHub username, organization, or profile URL.')
    }
  }
  if (!/^[a-z\d-]{1,39}$/i.test(owner)) {
    throw new Error('Enter a valid GitHub username or organization.')
  }

  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(owner)}/repos?type=owner&sort=updated&per_page=100&page=${page}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (response.status === 404) throw new Error('That GitHub user or organization could not be found.')
  if (response.status === 403) throw new Error('GitHub API rate limit reached. Try again later.')
  if (!response.ok) throw new Error('GitHub could not load this repository list. Try again.')

  const repositories = await response.json()
  return repositories.map((repo) => ({
    name: repo.name,
    owner: repo.owner?.login || owner,
    description: repo.description || '',
    html_url: repo.html_url,
    homepage: repo.homepage?.trim() || '',
    language: repo.language || '',
    updated_at: repo.updated_at,
  }))
}

export function githubRepositoryToProject(repository) {
  return {
    name: repository.name,
    client: repository.owner,
    description: repository.description,
    github_url: repository.html_url,
    live_site_url: repository.homepage,
  }
}