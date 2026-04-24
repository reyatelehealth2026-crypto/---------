import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const run = (command, args, name, env = {}) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
    cwd: root,
  })
  child.on('exit', (code) => {
    if (code && !shuttingDown) process.exit(code)
  })
  processes.push({ child, name })
}

const processes = []
let shuttingDown = false

process.on('SIGINT', () => {
  shuttingDown = true
  for (const { child } of processes) child.kill('SIGINT')
  process.exit(0)
})

run(process.execPath, ['--no-warnings=ExperimentalWarning', 'server/server.mjs'], 'api')
run(process.execPath, [viteBin, '--host', '127.0.0.1'], 'client', {
  VITE_API_PROXY_TARGET: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8787',
})
