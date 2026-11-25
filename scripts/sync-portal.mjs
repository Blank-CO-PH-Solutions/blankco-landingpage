import { cpSync, existsSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const portalSource = resolve(root, '../CPL')
const destination = join(root, 'public/portal')

if (!existsSync(join(portalSource, 'package.json'))) {
  // CI/deploy checkouts often contain only this repository. The committed
  // public/portal build is used in that case so the contact-page button works.
  console.log('[portal] ../CPL not found; using the committed public/portal build.')
  process.exit(0)
}

console.log('[portal] Building the customer portal from ../CPL...')
execSync('npm run build', {
  cwd: portalSource,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: '/portal/' },
})
rmSync(destination, { recursive: true, force: true })
cpSync(join(portalSource, 'dist'), destination, { recursive: true })
console.log('[portal] Copied the customer portal build to public/portal.')
