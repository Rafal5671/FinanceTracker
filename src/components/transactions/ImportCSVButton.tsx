import { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useImportCSV } from '@/hooks/useImportCSV'
import { useCategoryStore } from '@/store/categoryStore'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ImportCSVButton() {
  const inputRef                    = useRef<HTMLInputElement>(null)
  const [open, setOpen]             = useState(false)
  const [status, setStatus]         = useState<Status>('idle')
  const [result, setResult]         = useState<{ imported: number; skipped: number } | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const { importCSV }               = useImportCSV()
  const { fetch: fetchCategories }  = useCategoryStore()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('loading')
    setOpen(true)

    try {
      await fetchCategories()
      const res = await importCSV(file)
      setResult(res)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleClose() {
    setOpen(false)
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />

      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center gap-3 text-center">
            {status === 'loading' && (
              <>
                <Loader2 size={32} className="animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Importing transactions...</p>
              </>
            )}

            {status === 'success' && result && (
              <>
                <CheckCircle size={32} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Import complete</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.imported} imported · {result.skipped} skipped
                  </p>
                </div>
                {result.skipped > 0 && (
                  <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 w-full text-left">
                    Skipped rows may have invalid type, amount, date, or missing description.
                  </p>
                )}
                <Button className="w-full mt-2" onClick={handleClose}>Done</Button>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle size={32} className="text-red-500" />
                <div>
                  <p className="text-sm font-medium">Import failed</p>
                  <p className="text-xs text-muted-foreground mt-1">{errorMsg}</p>
                </div>
                <Button variant="outline" className="w-full mt-2" onClick={handleClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}