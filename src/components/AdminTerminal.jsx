import { useEffect, useRef, useState } from 'react'
import { CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

export default function AdminTerminal() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState(['Blank CO access console.', 'Type "help" to list available commands.'])
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        setOpen((current) => !current)
      }
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const submitCommand = (event) => {
    event.preventDefault()
    const entered = command.trim()
    const normalized = entered.toLowerCase()
    if (!entered) return

    if (normalized === 'admin' || normalized === 'open admin') {
      setOpen(false)
      setCommand('')
      navigate('/admin')
      return
    }
    if (normalized === 'exit' || normalized === 'close') {
      setOpen(false)
      setCommand('')
      return
    }
    if (normalized === 'clear') {
      setOutput([])
      setCommand('')
      return
    }

    setOutput((current) => [
      ...current,
      `visitor@blankco:~$ ${entered}`,
      normalized === 'help' ? 'Available commands: admin, clear, exit' : `command not found: ${entered}`,
    ].slice(-8))
    setCommand('')
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open admin console" title="Open admin console" className="flex h-8 w-8 items-center justify-center text-paper/40 transition hover:text-paper/80">
        <CommandLineIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-terminal-title" className="w-full max-w-2xl overflow-hidden border border-emerald-900 bg-[#07100c] font-mono text-emerald-300 shadow-2xl">
            <header className="flex items-center justify-between border-b border-emerald-950 bg-[#0b1711] px-4 py-3">
              <p id="admin-terminal-title" className="text-xs"><span className="text-emerald-500">●</span> blankco://access</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close admin console" className="text-emerald-500 transition hover:text-emerald-200"><XMarkIcon className="h-5 w-5" /></button>
            </header>
            <div className="min-h-48 space-y-1 px-4 py-5 text-xs sm:min-h-56 sm:text-sm">
              {output.map((line, index) => <p key={`${index}-${line}`} className={line.startsWith('visitor@') ? 'text-emerald-500' : ''}>{line}</p>)}
              <form onSubmit={submitCommand} className="flex items-center gap-2 pt-2">
                <label htmlFor="admin-terminal-command" className="shrink-0 text-emerald-500">visitor@blankco:~$</label>
                <input ref={inputRef} id="admin-terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} autoComplete="off" spellCheck="false" className="min-w-0 flex-1 bg-transparent text-emerald-200 outline-none caret-emerald-400" />
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  )
}