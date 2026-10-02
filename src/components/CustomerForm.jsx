import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { saveInvoice } from '../api/client'

const PHONE_RE = /^[0-9+\-\s]{7,20}$/

export default function CustomerForm({ lines, onBack, onSaved }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev) {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await saveInvoice({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        items: lines.map((l) => ({ item_id: l.item_id, quantity: l.quantity })),
      })
      onSaved(res.invoice_id)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const adorn = (Icon) => ({
    input: { startAdornment: <InputAdornment position="start"><Icon fontSize="small" /></InputAdornment> },
  })

  return (
    <Card component="form" onSubmit={submit} sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Customer Details</Typography>
        <Stack spacing={2}>
          <TextField label="Customer Name" fullWidth value={form.name} onChange={set('name')}
            error={!!errors.name} helperText={errors.name} slotProps={adorn(PersonIcon)} />
          <TextField label="Phone Number" type="tel" fullWidth value={form.phone} onChange={set('phone')}
            error={!!errors.phone} helperText={errors.phone} slotProps={adorn(PhoneIcon)} />
          <TextField label="Address" fullWidth multiline minRows={2} value={form.address} onChange={set('address')}
            error={!!errors.address} helperText={errors.address} slotProps={adorn(HomeIcon)} />

          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={onBack} disabled={submitting} startIcon={<ArrowBackIcon />} variant="outlined">
              Back to Items
            </Button>
            <Button type="submit" loading={submitting} variant="contained" color="secondary" size="large">
              Submit &amp; Generate Bill
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
