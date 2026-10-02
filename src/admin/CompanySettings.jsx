import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { adminGetCompany, adminSaveCompany } from '../api/client'
import { FormSkeleton } from '../components/ui/Skeletons'

const EMPTY = { name: '', phone: '', address: '', tax_id: '' }

export default function CompanySettings() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)

  useEffect(() => {
    adminGetCompany()
      .then((res) => { if (res.profile) setForm({ ...EMPTY, ...res.profile }) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminSaveCompany({
        name: form.name.trim(), phone: form.phone.trim(),
        address: form.address.trim(), tax_id: form.tax_id.trim(),
      })
      setToast(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Card sx={{ maxWidth: 560 }}>
      <CardContent>
        <Typography variant="h6">Company Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These details print at the top of every invoice.
        </Typography>
        {loading ? (
          <FormSkeleton fields={4} />
        ) : (
          <Stack component="form" onSubmit={submit} spacing={2}>
            <TextField label="Company Name" fullWidth value={form.name} onChange={set('name')} required />
            <TextField label="Phone" fullWidth value={form.phone} onChange={set('phone')} />
            <TextField label="Address" fullWidth multiline minRows={2} value={form.address} onChange={set('address')} />
            <TextField label="Tax / GST ID" fullWidth value={form.tax_id} onChange={set('tax_id')} />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" loading={saving} sx={{ alignSelf: 'flex-start' }}>
              Save Changes
            </Button>
          </Stack>
        )}
      </CardContent>
      <Snackbar open={toast} autoHideDuration={3000} onClose={() => setToast(false)} message="Saved"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Card>
  )
}
