import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { adminListItems, adminCreateItem, adminUpdateItem, adminDeleteItem } from '../api/client'
import { formatCurrency } from '../utils/format'
import { TableRowsSkeleton, CardListSkeleton } from '../components/ui/Skeletons'

const EMPTY = { code: '', name: '', unit_rate: '' }

export default function ItemsManager() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null) // item pending deletion

  async function load() {
    setLoading(true)
    try {
      const res = await adminListItems()
      setItems(res.items)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function startEdit(it) {
    setEditingId(it.id)
    setForm({ code: it.code, name: it.name, unit_rate: String(it.unit_rate) })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { code: form.code.trim(), name: form.name.trim(), unit_rate: parseFloat(form.unit_rate) }
    try {
      if (editingId) await adminUpdateItem({ id: editingId, ...payload })
      else await adminCreateItem(payload)
      setToast(editingId ? 'Item updated' : 'Item added')
      cancelEdit()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function doDelete() {
    const it = confirm
    setConfirm(null)
    try {
      await adminDeleteItem(it.id)
      setToast('Item deleted')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{editingId ? 'Edit Item' : 'Add Item'}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Code" placeholder="item122" fullWidth value={form.code} onChange={set('code')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Name" fullWidth value={form.name} onChange={set('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Unit rate" type="number" fullWidth value={form.unit_rate} onChange={set('unit_rate')}
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" loading={saving} startIcon={!editingId ? <AddIcon /> : undefined}>
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>}
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        isMobile ? <CardListSkeleton rows={4} /> : (
          <TableContainer component={Card}>
            <Table><TableBody><TableRowsSkeleton rows={5} cols={4} /></TableBody></Table>
          </TableContainer>
        )
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {items.map((it) => (
            <Card key={it.id}>
              <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>{it.name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{it.code}</Typography>
                  </Box>
                  <Typography fontWeight={700}>{formatCurrency(it.unit_rate)}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => startEdit(it)}>Edit</Button>
                  <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setConfirm(it)}>Delete</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Unit Rate</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>No items yet.</TableCell></TableRow>
              ) : items.map((it) => (
                <TableRow key={it.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{it.code}</TableCell>
                  <TableCell>{it.name}</TableCell>
                  <TableCell align="right">{formatCurrency(it.unit_rate)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => startEdit(it)} aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setConfirm(it)} aria-label="delete"><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>Delete item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm && `Delete "${confirm.name}" (${confirm.code})? This cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  )
}
