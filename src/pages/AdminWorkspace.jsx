import { useEffect, useRef, useState } from 'react'
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  EyeIcon,
  FolderIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { deleteMessage, listMessages, setMessageRead } from '../data/messages'
import { deleteProject, listProjects, saveProject as saveProjectRecord, updateProject } from '../data/projects'
import { fetchGithubProfile, githubRepositoryToProject, listGithubRepositories } from '../data/github'
import { deleteTeamMember, getGithubAvatarUrl, listTeamMembers, saveTeamMember, uploadTeamMemberAvatar } from '../data/teamMembers'
import { supabase } from '../lib/supabase'

const categories = ['Business strategy', 'Workflow automation', 'Digital product', 'Ongoing support', 'Other']
const visualOptions = [
  { value: 'project-visual-coral', label: 'Coral' },
  { value: 'project-visual-green', label: 'Green' },
  { value: 'project-visual-blue', label: 'Blue' },
  { value: 'project-visual-gold', label: 'Gold' },
  { value: 'project-visual-lilac', label: 'Lilac' },
  { value: 'project-visual-rose', label: 'Rose' },
  { value: 'project-visual-teal', label: 'Teal' },
]

const emptyProject = {
  name: '',
  client: '',
  category: categories[2],
  year: new Date().getFullYear().toString(),
  description: '',
  github_url: '',
  live_site_url: '',
  visual: visualOptions[0].value,
  published: false,
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isGithubRepositoryUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2
  } catch {
    return false
  }
}

function ProjectForm({ project, onClose, onSave, saving, error }) {
  const [values, setValues] = useState(() => {
    const initial = project || emptyProject
    return {
      ...initial,
      github_url: initial.github_url || '',
      live_site_url: initial.live_site_url || '',
      customCategory: categories.includes(initial.category) ? '' : initial.category,
    }
  })
  const [formError, setFormError] = useState('')
  const [githubOwner, setGithubOwner] = useState('nathaniel-ramos-dev')
  const [repositories, setRepositories] = useState([])
  const [repositorySearch, setRepositorySearch] = useState('')
  const [selectedRepositoryUrl, setSelectedRepositoryUrl] = useState('')
  const [nextRepositoryPage, setNextRepositoryPage] = useState(null)
  const [loadingRepositories, setLoadingRepositories] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importMessage, setImportMessage] = useState('')

  const update = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => {
      if (name === 'category') {
        return {
          ...current,
          category: value,
          customCategory: value === 'Other'
            ? categories.includes(current.category) ? current.customCategory : current.category
            : '',
        }
      }
      return { ...current, [name]: type === 'checkbox' ? checked : value }
    })
  }

  const loadRepositories = async (page = 1) => {
    setLoadingRepositories(true)
    setImportError('')
    setImportMessage('')
    if (page === 1) {
      setRepositories([])
      setSelectedRepositoryUrl('')
      setRepositorySearch('')
      setNextRepositoryPage(null)
    }
    try {
      const results = await listGithubRepositories(githubOwner, page)
      setRepositories((current) => page === 1 ? results : [...current, ...results])
      setNextRepositoryPage(results.length === 100 ? page + 1 : null)
      if (page === 1 && results.length === 0) setImportMessage('No public repositories found for this account.')
    } catch (error) {
      setImportError(error.message || 'Could not load repositories.')
    } finally {
      setLoadingRepositories(false)
    }
  }

  const importRepository = async () => {
    const repository = repositories.find((item) => item.html_url === selectedRepositoryUrl)
    if (!repository) {
      setImportError('Select a repository first.')
      return
    }
    setImporting(true)
    setImportError('')
    setImportMessage('')
    try {
      const imported = githubRepositoryToProject(repository)
      setValues((current) => ({
        ...current,
        ...imported,
        description: imported.description || current.description,
      }))
      setImportMessage(imported.live_site_url
        ? 'Repository details and homepage imported.'
        : 'Repository details imported. Add a live site URL before publishing.')
    } catch (error) {
      setImportError(error.message || 'Could not import this repository.')
    } finally {
      setImporting(false)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    const usesCustomCategory = values.category === 'Other' || !categories.includes(values.category)
    if (usesCustomCategory && !values.customCategory.trim()) {
      setFormError('Enter a category name.')
      return
    }
    if (values.published && !isGithubRepositoryUrl(values.github_url.trim())) {
      setFormError('Add a valid GitHub repository URL before publishing.')
      return
    }
    if (values.live_site_url.trim() && !isHttpsUrl(values.live_site_url.trim())) {
      setFormError('Live site URLs must use HTTPS.')
      return
    }
    setFormError('')
    onSave({
      ...values,
      id: project?.id,
      name: values.name.trim(),
      client: values.client.trim(),
      description: values.description.trim(),
      category: usesCustomCategory ? values.customCategory.trim() : values.category,
      github_url: values.github_url.trim(),
      live_site_url: values.live_site_url.trim(),
    })
  }

  const fieldClass = 'mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-ink'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-600'

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="project-form-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto bg-paper shadow-2xl sm:max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Project details</p>
            <h2 id="project-form-title" className="mt-1 text-2xl font-semibold">{project ? 'Edit project' : 'Add project'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close project form" className="flex h-9 w-9 items-center justify-center border border-line transition hover:border-ink">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
          <section className="border border-line bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-700">Choose from GitHub</p>
            <p className="mt-1 text-xs text-neutral-500">Browse public repositories from a GitHub user or organization.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="text" value={githubOwner} onChange={(event) => { setGithubOwner(event.target.value); setRepositories([]); setSelectedRepositoryUrl(''); setNextRepositoryPage(null) }} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), loadRepositories())} className="min-w-0 flex-1 border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Username, organization, or GitHub profile URL" aria-label="GitHub username or organization" />
              <button type="button" onClick={() => loadRepositories()} disabled={loadingRepositories || !githubOwner.trim()} className="inline-flex shrink-0 items-center justify-center gap-2 bg-neutral-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowTopRightOnSquareIcon className="h-4 w-4" /> {loadingRepositories ? 'Loading...' : 'Load repositories'}
              </button>
            </div>
            {repositories.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <input type="search" value={repositorySearch} onChange={(event) => setRepositorySearch(event.target.value)} className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Filter repositories" aria-label="Filter repositories by name or description" />
                  <select size="5" value={selectedRepositoryUrl} onChange={(event) => setSelectedRepositoryUrl(event.target.value)} className="mt-2 w-full border border-line bg-white px-2 py-1 text-sm outline-none focus:border-ink" aria-label="Select a GitHub repository">
                    {repositories
                      .filter((repository) => `${repository.name} ${repository.description}`.toLowerCase().includes(repositorySearch.toLowerCase()))
                      .map((repository) => (
                        <option key={repository.html_url} value={repository.html_url}>
                          {repository.name}{repository.description ? ` — ${repository.description}` : ''}
                        </option>
                      ))}
                  </select>
                  {nextRepositoryPage && <button type="button" onClick={() => loadRepositories(nextRepositoryPage)} disabled={loadingRepositories} className="mt-2 text-xs font-semibold underline underline-offset-4 disabled:opacity-50">Load more repositories</button>}
                </div>
                <button type="button" onClick={importRepository} disabled={importing || !selectedRepositoryUrl} className="inline-flex h-fit items-center justify-center gap-2 bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" /> {importing ? 'Importing...' : 'Import selected'}
                </button>
              </div>
            )}
            {importError && <p role="alert" className="mt-2 text-sm text-red-700">{importError}</p>}
            {importMessage && <p role="status" className="mt-2 text-sm text-emerald-800">{importMessage}</p>}
          </section>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Project name
              <input autoFocus required maxLength={70} name="name" value={values.name} onChange={update} className={fieldClass} placeholder="e.g. Northstar Workflows" />
            </label>
            <label className={labelClass}>
              Client
              <input required maxLength={70} name="client" value={values.client} onChange={update} className={fieldClass} placeholder="Client or organization" />
            </label>
            <label className={labelClass}>
              Category
              <select name="category" value={categories.includes(values.category) ? values.category : 'Other'} onChange={update} className={fieldClass}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            {(values.category === 'Other' || !categories.includes(values.category)) && (
              <label className={labelClass}>
                Custom category
                <input required maxLength={80} name="customCategory" value={values.customCategory || ''} onChange={update} className={fieldClass} placeholder="Enter a category" />
              </label>
            )}
            <label className={labelClass}>
              Year
              <input required type="number" min="2000" max="2100" step="1" name="year" value={values.year} onChange={update} className={fieldClass} />
            </label>
          </div>
          <label className={labelClass}>
            Short description
            <textarea required maxLength={240} rows={3} name="description" value={values.description} onChange={update} className={`${fieldClass} resize-y`} placeholder="What changed for the client?" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              GitHub repository URL
              <input type="url" name="github_url" value={values.github_url || ''} onChange={update} className={fieldClass} placeholder="https://github.com/org/repository" />
            </label>
            <label className={labelClass}>
              Live site URL
              <input type="url" name="live_site_url" value={values.live_site_url || ''} onChange={update} className={fieldClass} placeholder="https://example.com" />
            </label>
          </div>
          <fieldset>
            <legend className={labelClass}>Project color</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {visualOptions.map((option) => (
                <label key={option.value} className={`flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm ${values.visual === option.value ? 'border-ink' : 'border-line'}`}>
                  <input type="radio" name="visual" value={option.value} checked={values.visual === option.value} onChange={update} className="accent-ink" />
                  <span className={`h-4 w-4 ${option.value}`} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-start gap-3 border-y border-line py-4">
            <input type="checkbox" name="published" checked={values.published} onChange={update} className="mt-1 h-4 w-4 accent-ink" />
            <span>
              <span className="block text-sm font-semibold">Publish project</span>
              <span className="mt-1 block text-xs text-neutral-500">Published projects appear on the public Projects page.</span>
            </span>
          </label>
          {(formError || error) && <p role="alert" className="text-sm text-red-700">{formError || error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="border border-line px-5 py-3 text-xs font-semibold uppercase tracking-widest transition hover:border-ink">Cancel</button>
            <button type="submit" disabled={saving} className="bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save project'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

const emptyMember = {
  name: '',
  position: '',
  email: '',
  location: '',
  github_url: '',
  portfolio_url: '',
  avatar_url: '',
  bio: '',
  skills: [],
  education: [],
  sort_order: 100,
  is_published: true,
}

function isGithubProfileUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'github.com' && /^[a-z\d-]+$/i.test(url.pathname.split('/').filter(Boolean)[0] || '') && url.pathname.split('/').filter(Boolean).length === 1
  } catch {
    return false
  }
}
function defaultMemberSortOrder(position) {
  const role = position.trim().toLowerCase()
  if (role.includes('chief executive officer') || /\bceo\b/.test(role)) return 0
  if (role.includes('chief technology officer') || /\bcto\b/.test(role)) return 10
  if (role.includes('chief operating officer') || /\bcoo\b/.test(role)) return 20
  if (role.includes('chief financial officer') || /\bcfo\b/.test(role)) return 30
  if (role.includes('chief marketing officer') || /\bcmo\b/.test(role)) return 40
  if (role.includes('chief') || role.startsWith('president')) return 50
  return 100
}

function MemberForm({ member, onClose, onSave, saving, error }) {
  const [values, setValues] = useState(() => ({
    ...emptyMember,
    ...member,
    github_url: member?.github_url || '',
    email: member?.email || '',
    location: member?.location || '',
    portfolio_url: member?.portfolio_url || '',
    avatar_url: member?.avatar_url || '',
    bio: member?.bio || '',
    skills: Array.isArray(member?.skills) ? member.skills : [],
    education: Array.isArray(member?.education) ? member.education : [],
  }))
  const [formError, setFormError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [importingProfile, setImportingProfile] = useState(false)
  const [profileImportMessage, setProfileImportMessage] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const avatarUrl = (values.avatar_url || '').trim() || getGithubAvatarUrl(values.github_url || '')
  const fieldClass = 'mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-ink'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-600'

  const update = (event) => {
    const { name, value, type, checked } = event.target
    if (name === 'position' && !member) {
      setValues((current) => ({
        ...current,
        position: value,
        sort_order: current.sort_order === defaultMemberSortOrder(current.position)
          ? defaultMemberSortOrder(value)
          : current.sort_order,
      }))
      return
    }
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setFormError('')
    try {
      const avatarUrl = await uploadTeamMemberAvatar(file)
      setValues((current) => ({ ...current, avatar_url: avatarUrl }))
    } catch (uploadError) {
      setFormError(uploadError.message || 'The profile photo could not be uploaded.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const importProfile = async () => {
    setImportingProfile(true)
    setProfileImportMessage('')
    setFormError('')
    try {
      const profile = await fetchGithubProfile(values.github_url || '')
      setValues((current) => ({
        ...current,
        github_url: profile.github_url,
        name: current.name.trim() || profile.name,
        email: current.email.trim() || profile.email,
        location: current.location.trim() || profile.location,
        bio: current.bio.trim() || profile.bio,
        avatar_url: current.avatar_url || profile.avatar_url,
      }))
      setProfileImportMessage(profile.email
        ? 'Public GitHub profile details imported.'
        : 'Profile details imported. Email is private or unavailable; add it manually if appropriate.')
    } catch (importError) {
      setFormError(importError.message || 'Could not import this GitHub profile.')
    } finally {
      setImportingProfile(false)
    }
  }

  const addSkill = () => {
    const skill = skillInput.trim().replace(/,$/, '')
    if (!skill) return
    setValues((current) => current.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
      ? current
      : { ...current, skills: [...current.skills, skill] })
    setSkillInput('')
  }

  const handleSkillKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkill()
    }
  }

  const removeSkill = (skillToRemove) => {
    setValues((current) => ({ ...current, skills: current.skills.filter((skill) => skill !== skillToRemove) }))
  }

  const updateEducation = (index, field, value) => {
    setValues((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  const addEducation = () => {
    setValues((current) => ({
      ...current,
      education: [...current.education, { institution: '', qualification: '', start_year: '', end_year: '' }],
    }))
  }

  const removeEducation = (index) => {
    setValues((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))
  }

  const submit = (event) => {
    event.preventDefault()
    const githubUrl = (values.github_url || '').trim()
    const portfolioUrl = (values.portfolio_url || '').trim()
    const customAvatarUrl = (values.avatar_url || '').trim()
    if (!isGithubProfileUrl(githubUrl)) {
      setFormError('Enter a valid GitHub profile URL.')
      return
    }
    if (portfolioUrl && !isHttpsUrl(portfolioUrl)) {
      setFormError('Portfolio URLs must use HTTPS.')
      return
    }
    if (customAvatarUrl && !isHttpsUrl(customAvatarUrl)) {
      setFormError('Photo URLs must use HTTPS.')
      return
    }
    if (values.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setFormError('Enter a valid email address or leave it blank.')
      return
    }
    setFormError('')
    onSave({
      ...values,
      id: member?.id,
      name: values.name.trim(),
      position: values.position.trim(),
      email: (values.email || '').trim(),
      location: (values.location || '').trim(),
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      avatar_url: customAvatarUrl,
      bio: (values.bio || '').trim(),
      skills: values.skills,
      education: values.education.map((item) => ({
        institution: item.institution.trim(),
        qualification: item.qualification.trim(),
        start_year: item.start_year.trim(),
        end_year: item.end_year.trim(),
      })).filter((item) => item.institution || item.qualification),
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="member-form-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto bg-paper shadow-2xl sm:max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Team directory</p>
            <h2 id="member-form-title" className="mt-1 text-2xl font-semibold">{member ? 'Edit member' : 'Add member'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close member form" className="flex h-9 w-9 items-center justify-center border border-line transition hover:border-ink"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
          <div className="flex flex-col items-center border-b border-line pb-5 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xl font-semibold text-neutral-600">
              <span>{values.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '??'}</span>
              {avatarUrl && <img src={avatarUrl} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} className="absolute inset-0 h-full w-full object-cover" />}
            </div>
            <p className="mt-2 text-xs text-neutral-500">Uses the GitHub photo unless a custom one is uploaded.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <label className={`cursor-pointer border border-line px-3 py-2 text-xs font-semibold uppercase tracking-wider transition hover:border-ink ${uploadingAvatar ? 'pointer-events-none opacity-50' : ''}`}>
                {uploadingAvatar ? 'Uploading...' : 'Upload photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={uploadingAvatar} className="sr-only" />
              </label>
              {values.avatar_url && <button type="button" onClick={() => setValues((current) => ({ ...current, avatar_url: '' }))} className="px-2 py-2 text-xs text-neutral-600 underline underline-offset-4">Use GitHub photo</button>}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>Name<input required maxLength={80} name="name" value={values.name} onChange={update} className={fieldClass} placeholder="Full name" /></label>
            <label className={labelClass}>Position<input required maxLength={100} name="position" value={values.position} onChange={update} className={fieldClass} placeholder="e.g. Product Designer" /></label>
            <label className={labelClass}>Email <span className="font-normal normal-case tracking-normal text-neutral-400">Optional</span><input type="email" name="email" value={values.email || ''} onChange={update} className={fieldClass} placeholder="name@example.com" /></label>
            <label className={labelClass}>Location <span className="font-normal normal-case tracking-normal text-neutral-400">Optional</span><input maxLength={120} name="location" value={values.location || ''} onChange={update} className={fieldClass} placeholder="City, country" /></label>
            <div className="sm:col-span-2">
              <label className={labelClass}>GitHub profile<input required type="url" name="github_url" value={values.github_url} onChange={update} className={fieldClass} placeholder="https://github.com/username" /></label>
              <button type="button" onClick={importProfile} disabled={importingProfile || !values.github_url.trim()} className="mt-2 text-xs font-semibold uppercase tracking-wider underline underline-offset-4 disabled:opacity-50">{importingProfile ? 'Importing profile...' : 'Import public GitHub details'}</button>
              {profileImportMessage && <p role="status" className="mt-2 text-xs text-emerald-800">{profileImportMessage}</p>}
            </div>
            <label className={labelClass}>Portfolio URL <span className="font-normal normal-case tracking-normal text-neutral-400">Optional</span><input type="url" name="portfolio_url" value={values.portfolio_url || ''} onChange={update} className={fieldClass} placeholder="https://your-portfolio.com" /></label>
            <label className={labelClass}>Photo URL <span className="font-normal normal-case tracking-normal text-neutral-400">Optional override</span><input type="url" name="avatar_url" value={values.avatar_url || ''} onChange={update} className={fieldClass} placeholder="https://..." /></label>
            <label className={labelClass}>Display order<input type="number" min="0" step="1" name="sort_order" value={values.sort_order} onChange={update} className={fieldClass} /></label>
          </div>
          <label className={labelClass}>Short bio <span className="font-normal normal-case tracking-normal text-neutral-400">Optional</span><textarea maxLength={500} rows={3} name="bio" value={values.bio || ''} onChange={update} className={`${fieldClass} resize-y`} placeholder="A short introduction" /></label>
          <fieldset>
            <legend className={labelClass}>Education background</legend>
            <div className="mt-2 space-y-3">
              {values.education.map((item, index) => (
                <div key={`education-${index}`} className="border border-line bg-white p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>School / institution<input maxLength={120} value={item.institution} onChange={(event) => updateEducation(index, 'institution', event.target.value)} className={fieldClass} placeholder="School or institution" /></label>
                    <label className={labelClass}>Degree / qualification<input maxLength={120} value={item.qualification} onChange={(event) => updateEducation(index, 'qualification', event.target.value)} className={fieldClass} placeholder="Degree, course, or certificate" /></label>
                    <label className={labelClass}>Start year<input maxLength={20} value={item.start_year} onChange={(event) => updateEducation(index, 'start_year', event.target.value)} className={fieldClass} placeholder="2020" /></label>
                    <label className={labelClass}>End year<input maxLength={20} value={item.end_year} onChange={(event) => updateEducation(index, 'end_year', event.target.value)} className={fieldClass} placeholder="2024 or Present" /></label>
                  </div>
                  <button type="button" onClick={() => removeEducation(index)} className="mt-3 text-xs font-semibold text-red-700 underline underline-offset-4">Remove education</button>
                </div>
              ))}
              <button type="button" onClick={addEducation} className="border border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:border-ink">Add education</button>
            </div>
          </fieldset>
          <fieldset>
            <legend className={labelClass}>Skills</legend>
            <div className="mt-2 flex gap-2">
              <input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} className="min-w-0 flex-1 border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Type a skill and press Enter" aria-label="Add a member skill" />
              <button type="button" onClick={addSkill} disabled={!skillInput.trim()} className="border border-line px-4 text-xs font-semibold uppercase tracking-wider transition hover:border-ink disabled:opacity-40">Add</button>
            </div>
            {values.skills.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{values.skills.map((skill) => <span key={skill} className="inline-flex items-center gap-2 border border-line bg-white px-3 py-1.5 text-xs">{skill}<button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`} className="font-semibold text-neutral-500 hover:text-red-700">×</button></span>)}</div>}
          </fieldset>
          <label className="flex cursor-pointer items-start gap-3 border-y border-line py-4">
            <input type="checkbox" name="is_published" checked={values.is_published} onChange={update} className="mt-1 h-4 w-4 accent-ink" />
            <span><span className="block text-sm font-semibold">Show in footer</span><span className="mt-1 block text-xs text-neutral-500">Visible members appear in the public footer directory.</span></span>
          </label>
          {(formError || error) && <p role="alert" className="text-sm text-red-700">{formError || error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="border border-line px-5 py-3 text-xs font-semibold uppercase tracking-widest transition hover:border-ink">Cancel</button>
            <button type="submit" disabled={saving || uploadingAvatar} className="bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save member'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!supabase) return
    setSubmitting(true)
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError('Sign-in failed. Check your email and password.')
    } catch {
      setError('Could not reach the sign-in service. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pattern-grid flex min-h-screen items-center justify-center bg-[#f3f3ef] px-5 py-12">
      <section className="w-full max-w-md border border-line bg-paper p-7 shadow-[8px_8px_0_0_#0a0a0a] sm:p-10">
        <Link to="/" className="text-sm font-bold tracking-tight">Blank CO<span className="text-neutral-400">.</span></Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-widest text-neutral-500">Admin workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <p className="mt-3 text-sm text-neutral-500">Use an administrator account to continue.</p>
        {!supabase ? (
          <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-800">Supabase is not configured. Set the project URL and anon key in the local environment.</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Email
              <input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-line bg-white px-3 py-3 text-sm outline-none focus:border-ink" />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Password
              <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border border-line bg-white px-3 py-3 text-sm outline-none focus:border-ink" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={submitting} type="submit" className="w-full bg-ink px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700 disabled:opacity-50">
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const adminViewStorageKey = 'blankco-admin-view'
const adminViews = ['projects', 'messages', 'members']

function AdminWorkspace({ onSignOut }) {
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [activeView, setActiveView] = useState(() => {
    try {
      const savedView = window.localStorage.getItem(adminViewStorageKey)
      return adminViews.includes(savedView) ? savedView : 'projects'
    } catch {
      return 'projects'
    }
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All projects')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [memberSaving, setMemberSaving] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [dataError, setDataError] = useState('')

  const changeAdminView = (view) => {
    setActiveView(view)
    try {
      window.localStorage.setItem(adminViewStorageKey, view)
    } catch {
      return
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([listProjects(), listMessages(), listTeamMembers()])
      .then(([projectRows, messageRows, memberRows]) => {
        if (!active) return
        setProjects(projectRows)
        setMessages(messageRows)
        setTeamMembers(memberRows)
      })
      .catch(() => {
        if (active) setDataError('The workspace could not load its data. Check the Supabase schema and access policies.')
      })
      .finally(() => {
        if (active) setLoadingData(false)
      })

    return () => { active = false }
  }, [])

  const saveProject = async (project) => {
    setSaving(true)
    setOperationError('')
    try {
      const saved = await saveProjectRecord(project)
      setProjects((current) => project.id
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current])
      setFormOpen(false)
      setEditingProject(null)
    } catch (error) {
      setOperationError(error.message || 'The project could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const saveMember = async (member) => {
    setMemberSaving(true)
    setOperationError('')
    try {
      const saved = await saveTeamMember(member)
      setTeamMembers((current) => member.id
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved].sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name)))
      setMemberFormOpen(false)
      setEditingMember(null)
    } catch (error) {
      setOperationError(error.message || 'The member could not be saved.')
    } finally {
      setMemberSaving(false)
    }
  }

  const toggleMemberPublished = async (member) => {
    setOperationError('')
    try {
      const updated = await saveTeamMember({ ...member, is_published: !member.is_published })
      setTeamMembers((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch {
      setOperationError('The member visibility could not be updated.')
    }
  }

  const removeMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the team directory? This cannot be undone.`)) return
    try {
      await deleteTeamMember(member.id)
      setTeamMembers((current) => current.filter((item) => item.id !== member.id))
    } catch {
      setOperationError('The member could not be deleted.')
    }
  }

  const togglePublished = async (project) => {
    setOperationError('')
    if (!project.published && !isGithubRepositoryUrl(project.github_url || '')) {
      setOperationError('Add a valid GitHub repository URL before publishing this project.')
      return
    }
    if (!project.published && project.live_site_url && !isHttpsUrl(project.live_site_url)) {
      setOperationError('Live site URLs must use HTTPS.')
      return
    }
    try {
      const updated = await updateProject(project.id, { published: !project.published })
      setProjects((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch {
      setOperationError('The project status could not be updated.')
    }
  }

  const removeProject = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return
    try {
      await deleteProject(project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch {
      setOperationError('The project could not be deleted.')
    }
  }

  const openMessage = async (message) => {
    setSelectedMessage(message)
    if (message.is_read) return
    try {
      const updated = await setMessageRead(message.id, true)
      setMessages((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelectedMessage(updated)
    } catch {
      setOperationError('The message could not be marked as read.')
    }
  }

  const toggleMessageRead = async (message) => {
    try {
      const updated = await setMessageRead(message.id, !message.is_read)
      setMessages((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelectedMessage(updated)
    } catch {
      setOperationError('The message status could not be updated.')
    }
  }

  const removeMessage = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return
    try {
      await deleteMessage(message.id)
      setMessages((current) => current.filter((item) => item.id !== message.id))
      setSelectedMessage((current) => current?.id === message.id ? null : current)
    } catch {
      setOperationError('The message could not be deleted.')
    }
  }

  const openNewProject = () => {
    setOperationError('')
    setEditingProject(null)
    setFormOpen(true)
  }

  const startEditing = (project) => {
    setOperationError('')
    setEditingProject(project)
    setFormOpen(true)
  }

  const openNewMember = () => {
    setOperationError('')
    setEditingMember(null)
    setMemberFormOpen(true)
  }

  const startEditingMember = (member) => {
    setOperationError('')
    setEditingMember(member)
    setMemberFormOpen(true)
  }

  const visibleProjects = projects.filter((project) => {
    const matchesSearch = `${project.name} ${project.client} ${project.category}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All projects' || (statusFilter === 'Published' ? project.published : !project.published)
    return matchesSearch && matchesStatus
  })
  const publishedCount = projects.filter((project) => project.published).length
  const unreadCount = messages.filter((message) => !message.is_read).length

  return (
    <div className="min-h-screen bg-[#f3f3ef] text-ink lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link to="/" className="flex items-center gap-3 border-b border-line px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center bg-ink text-sm font-bold text-paper">B.</span>
          <span>
            <span className="block text-sm font-bold leading-tight">Blank CO</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Admin workspace</span>
          </span>
        </Link>
        <nav className="flex gap-1 px-3 py-3 lg:flex-col lg:py-6" aria-label="Admin navigation">
          <button type="button" onClick={() => changeAdminView('projects')} aria-current={activeView === 'projects' ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium ${activeView === 'projects' ? 'bg-ink text-paper' : 'text-neutral-600 transition hover:bg-neutral-100 hover:text-ink'}`}>
            <Squares2X2Icon className="h-4 w-4" /> Projects
            <span className="ml-auto text-xs opacity-60">{projects.length}</span>
          </button>
          <button type="button" onClick={() => changeAdminView('messages')} aria-current={activeView === 'messages' ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium ${activeView === 'messages' ? 'bg-ink text-paper' : 'text-neutral-600 transition hover:bg-neutral-100 hover:text-ink'}`}>
            <InboxIcon className="h-4 w-4" /> Messages
            {unreadCount > 0 && <span className="ml-auto min-w-5 bg-emerald-100 px-1.5 py-0.5 text-center text-[10px] text-emerald-900">{unreadCount}</span>}
          </button>
          <button type="button" onClick={() => changeAdminView('members')} aria-current={activeView === 'members' ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium ${activeView === 'members' ? 'bg-ink text-paper' : 'text-neutral-600 transition hover:bg-neutral-100 hover:text-ink'}`}>
            <UserGroupIcon className="h-4 w-4" /> Members
            <span className="ml-auto text-xs opacity-60">{teamMembers.length}</span>
          </button>
        </nav>
        <div className="mt-auto hidden border-t border-line p-5 text-xs text-neutral-500 lg:block">
          <p className="font-semibold text-neutral-700">Blank CO PH Solutions</p>
          <p className="mt-1">Content workspace</p>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Content management</p>
            <h1 className="mt-1 text-xl font-semibold">{activeView === 'projects' ? 'Projects' : activeView === 'messages' ? 'Messages' : 'Members'}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/projects" aria-label="View public projects" title="View public site" className="flex h-10 items-center gap-2 border border-line px-3 text-xs font-semibold uppercase tracking-wider transition hover:border-ink sm:px-4">
              <ArrowTopRightOnSquareIcon className="h-4 w-4" /><span className="hidden sm:inline">View site</span>
            </Link>
            {activeView === 'projects' && <button type="button" onClick={openNewProject} className="flex h-10 items-center gap-2 bg-ink px-3 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-neutral-700 sm:px-4"><PlusIcon className="h-4 w-4" /><span className="hidden sm:inline">Add project</span><span className="sm:hidden">Add</span></button>}
            {activeView === 'members' && <button type="button" onClick={openNewMember} className="flex h-10 items-center gap-2 bg-ink px-3 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-neutral-700 sm:px-4"><PlusIcon className="h-4 w-4" /><span className="hidden sm:inline">Add member</span><span className="sm:hidden">Add</span></button>}
            <button type="button" onClick={onSignOut} className="h-10 border border-line px-3 text-xs font-semibold uppercase tracking-wider transition hover:border-ink">Sign out</button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {operationError && <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{operationError}</p>}
          {dataError && <p role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{dataError}</p>}
          {activeView === 'projects' ? (
            <>
              <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
                <div className="bg-white p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Total projects</p><p className="mt-4 text-4xl font-semibold">{projects.length.toString().padStart(2, '0')}</p><p className="mt-2 text-xs text-neutral-500">Across all categories</p></div>
                <div className="bg-white p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Published</p><p className="mt-4 flex items-center gap-2 text-4xl font-semibold">{publishedCount.toString().padStart(2, '0')}<CheckIcon className="h-5 w-5 text-emerald-700" /></p><p className="mt-2 text-xs text-neutral-500">Visible on the public site</p></div>
                <div className="bg-white p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Unread messages</p><p className="mt-4 text-4xl font-semibold">{unreadCount.toString().padStart(2, '0')}</p><p className="mt-2 text-xs text-neutral-500">In the inquiry inbox</p></div>
              </div>
              <section className="mt-10">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div><p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Portfolio content</p><h2 className="mt-1 text-2xl font-semibold">Projects <span className="ml-1 text-base font-normal text-neutral-400">({projects.length})</span></h2></div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="relative block sm:w-64"><span className="sr-only">Search projects</span><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="h-10 w-full border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-ink" /></label>
                    <label><span className="sr-only">Filter by publication status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 w-full border border-line bg-white px-3 text-sm outline-none focus:border-ink sm:w-auto"><option>All projects</option><option>Published</option><option>Drafts</option></select></label>
                  </div>
                </div>
                <div className="mt-5 overflow-hidden border border-line bg-white">
                  <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(130px,1fr)_100px_130px_140px] gap-4 border-b border-line bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 md:grid"><span>Project</span><span>Category</span><span>Year</span><span>Status</span><span className="text-right">Actions</span></div>
                  {loadingData ? <p className="px-5 py-12 text-center text-sm text-neutral-500">Loading projects...</p> : visibleProjects.length ? visibleProjects.map((project) => (
                    <article key={project.id} className="grid gap-4 border-b border-line p-4 last:border-b-0 sm:p-5 md:grid-cols-[minmax(220px,1.5fr)_minmax(130px,1fr)_100px_130px_140px] md:items-center">
                      <div className="flex min-w-0 items-center gap-3"><span className={`hidden h-12 w-12 shrink-0 sm:block ${project.visual || 'project-visual-coral'}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{project.name}</p><p className="mt-1 truncate text-xs text-neutral-500">{project.client}</p></div></div>
                      <p className="text-xs text-neutral-600 md:text-sm">{project.category}</p><p className="text-xs text-neutral-600 md:text-sm">{project.year}</p>
                      <div><button type="button" onClick={() => togglePublished(project)} className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium transition ${project.published ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><span className={`h-1.5 w-1.5 rounded-full ${project.published ? 'bg-emerald-600' : 'bg-neutral-400'}`} />{project.published ? 'Published' : 'Draft'}</button></div>
                      <div className="flex justify-end gap-1 border-t border-line pt-3 md:border-0 md:pt-0">{project.live_site_url && <a href={project.live_site_url} target="_blank" rel="noreferrer" aria-label={`View ${project.name} live site`} title="View live site" className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-ink"><ArrowTopRightOnSquareIcon className="h-4 w-4" /></a>}<button type="button" onClick={() => togglePublished(project)} aria-label={project.published ? `Unpublish ${project.name}` : `Publish ${project.name}`} title={project.published ? 'Unpublish' : 'Publish'} className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-ink"><EyeIcon className="h-4 w-4" /></button><button type="button" onClick={() => startEditing(project)} aria-label={`Edit ${project.name}`} title="Edit project" className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-ink"><PencilSquareIcon className="h-4 w-4" /></button><button type="button" onClick={() => removeProject(project)} aria-label={`Delete ${project.name}`} title="Delete project" className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-red-50 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button></div>
                    </article>
                  )) : <div className="px-5 py-14 text-center"><FolderIcon className="mx-auto h-8 w-8 text-neutral-400" /><p className="mt-3 text-sm font-semibold">No projects found</p><p className="mt-1 text-xs text-neutral-500">Try another search or add a project to get started.</p></div>}
                </div>
              </section>
            </>
          ) : activeView === 'messages' ? (
            <section>
              <div className="mb-5"><p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Client inquiries</p><h2 className="mt-1 text-2xl font-semibold">Inbox <span className="ml-1 text-base font-normal text-neutral-400">({messages.length})</span></h2></div>
              <div className="grid min-h-[480px] border border-line bg-white lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
                <div className="border-b border-line lg:border-b-0 lg:border-r">
                  {loadingData ? <p className="p-6 text-sm text-neutral-500">Loading messages...</p> : messages.length ? messages.map((message) => (
                    <button key={message.id} type="button" onClick={() => openMessage(message)} className={`block w-full border-b border-line px-4 py-4 text-left transition hover:bg-neutral-50 ${selectedMessage?.id === message.id ? 'bg-neutral-100' : ''}`}>
                      <span className="flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold">{message.name}</span><span className="shrink-0 text-[10px] text-neutral-500">{formatDate(message.created_at)}</span></span>
                      <span className="mt-1 block truncate text-xs text-neutral-500">{message.email} · {message.service_interest}</span>
                      <span className="mt-2 flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${message.is_read ? 'bg-neutral-300' : 'bg-emerald-600'}`} /><span className="text-[10px] uppercase tracking-wider text-neutral-500">{message.is_read ? 'Read' : 'New'}</span></span>
                    </button>
                  )) : <div className="p-8 text-center"><InboxIcon className="mx-auto h-7 w-7 text-neutral-400" /><p className="mt-3 text-sm font-semibold">No messages yet</p><p className="mt-1 text-xs text-neutral-500">New contact form submissions will appear here.</p></div>}
                </div>
                <div className="p-5 sm:p-8">
                  {selectedMessage ? (
                    <article>
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{selectedMessage.service_interest}</p><h3 className="mt-2 text-2xl font-semibold">{selectedMessage.name}</h3><a href={`mailto:${selectedMessage.email}`} className="mt-1 block text-sm text-neutral-600 underline underline-offset-4">{selectedMessage.email}</a></div><p className="text-xs text-neutral-500">{formatDate(selectedMessage.created_at)}</p></div>
                      <dl className="grid gap-4 border-b border-line py-5 sm:grid-cols-2"><div><dt className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Company</dt><dd className="mt-1 text-sm">{selectedMessage.company}</dd></div><div><dt className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Consent</dt><dd className="mt-1 text-sm">{selectedMessage.consent ? 'Provided' : 'Not provided'}</dd></div></dl>
                      <div className="py-6"><p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Message</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{selectedMessage.message}</p></div>
                      <div className="flex flex-wrap gap-2 border-t border-line pt-5"><a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.service_interest}`)}`} className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-neutral-700">Reply by email <ArrowTopRightOnSquareIcon className="h-4 w-4" /></a><button type="button" onClick={() => toggleMessageRead(selectedMessage)} className="h-10 border border-line px-4 text-xs font-semibold uppercase tracking-wider transition hover:border-ink">Mark as {selectedMessage.is_read ? 'unread' : 'read'}</button><button type="button" onClick={() => removeMessage(selectedMessage)} className="ml-auto h-10 px-3 text-xs font-semibold uppercase tracking-wider text-red-700 transition hover:bg-red-50">Delete</button></div>
                    </article>
                  ) : <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><InboxIcon className="h-8 w-8 text-neutral-400" /><p className="mt-3 text-sm font-semibold">Select a message</p><p className="mt-1 text-xs text-neutral-500">Read and manage contact inquiries here.</p></div>}
                </div>
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Public profile directory</p>
                <h2 className="mt-1 text-2xl font-semibold">Members <span className="ml-1 text-base font-normal text-neutral-400">({teamMembers.length})</span></h2>
              </div>
              <div className="overflow-hidden border border-line bg-white">
                <div className="hidden grid-cols-[minmax(240px,1.5fr)_minmax(150px,1fr)_130px_180px] gap-4 border-b border-line bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 md:grid">
                  <span>Member</span><span>GitHub</span><span>Footer status</span><span className="text-right">Actions</span>
                </div>
                {loadingData ? <p className="px-5 py-12 text-center text-sm text-neutral-500">Loading members...</p> : teamMembers.length ? teamMembers.map((member) => {
                  const avatarUrl = member.avatar_url || getGithubAvatarUrl(member.github_url)
                  return (
                    <article key={member.id} className="grid gap-4 border-b border-line p-4 last:border-b-0 sm:p-5 md:grid-cols-[minmax(240px,1.5fr)_minmax(150px,1fr)_130px_180px] md:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                          <span>{member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
                          {avatarUrl && <img src={avatarUrl} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} className="absolute inset-0 h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold">{member.name}</p><p className="mt-1 truncate text-xs text-neutral-500">{member.position}</p></div>
                      </div>
                      <a href={member.github_url} target="_blank" rel="noreferrer" className="truncate text-xs text-neutral-600 underline underline-offset-4 hover:text-ink">{member.github_url.replace('https://github.com/', '@')}</a>
                      <button type="button" onClick={() => toggleMemberPublished(member)} className={`w-fit px-2.5 py-1.5 text-xs font-medium ${member.is_published ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>{member.is_published ? 'Visible' : 'Hidden'}</button>
                      <div className="flex justify-end gap-1 border-t border-line pt-3 md:border-0 md:pt-0">
                        <button type="button" onClick={() => startEditingMember(member)} aria-label={`Edit ${member.name}`} title="Edit member" className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-neutral-100 hover:text-ink"><PencilSquareIcon className="h-4 w-4" /></button>
                        <button type="button" onClick={() => removeMember(member)} aria-label={`Delete ${member.name}`} title="Delete member" className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-red-50 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </article>
                  )
                }) : (
                  <div className="px-5 py-14 text-center"><UserGroupIcon className="mx-auto h-8 w-8 text-neutral-400" /><p className="mt-3 text-sm font-semibold">No members added</p><p className="mt-1 text-xs text-neutral-500">Add a member to show their profile in the public footer.</p></div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
      {formOpen && <ProjectForm project={editingProject} onClose={() => setFormOpen(false)} onSave={saveProject} saving={saving} error={operationError} />}
      {memberFormOpen && <MemberForm member={editingMember} onClose={() => setMemberFormOpen(false)} onSave={saveMember} saving={memberSaving} error={operationError} />}
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))
  const [adminChecking, setAdminChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState('')
  const sessionUserIdRef = useRef(null)

  const updateSession = (nextSession) => {
    const nextUserId = nextSession?.user?.id || null
    const identityChanged = sessionUserIdRef.current !== nextUserId
    sessionUserIdRef.current = nextUserId
    setSession(nextSession)

    if (identityChanged) {
      setAdminChecking(Boolean(nextSession))
      if (!nextSession) setIsAdmin(false)
    }
  }

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      updateSession(nextSession)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthError('Could not restore the admin session. Please sign in again.')
      updateSession(data.session)
      setAuthLoading(false)
    }).catch(() => {
      if (!active) return
      setAuthError('Could not restore the admin session. Please sign in again.')
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const sessionUserId = session?.user?.id

  useEffect(() => {
    if (!supabase || !sessionUserId) return undefined
    let active = true
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (!active) return
      setIsAdmin(data === true)
      setAuthError(error ? 'Admin access could not be verified. Apply the Supabase schema and allowlist this account.' : '')
      setAdminChecking(false)
    }).catch(() => {
      if (!active) return
      setAuthError('Admin access could not be verified. Check the Supabase connection and schema.')
      setAdminChecking(false)
    })
    return () => { active = false }
  }, [sessionUserId])

  if (authLoading) return <main className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Checking session...</main>
  if (!session) return <AdminLogin />
  if (adminChecking) return <main className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Verifying administrator access...</main>
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f3ef] px-5">
        <section className="max-w-md border border-line bg-paper p-8 text-center">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="mt-3 text-sm text-neutral-600">{authError || 'This account is not authorized to use the admin workspace.'}</p>
          <button type="button" onClick={() => supabase.auth.signOut()} className="mt-6 bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-paper">Sign out</button>
        </section>
      </main>
    )
  }

  return <AdminWorkspace onSignOut={() => supabase.auth.signOut()} />
}