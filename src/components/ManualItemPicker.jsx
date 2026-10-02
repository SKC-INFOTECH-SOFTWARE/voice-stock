import { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { adminListItems } from '../api/client'
import { formatCurrency } from '../utils/format'

// Search matches both name and code even when the code isn't displayed (small screens).
const filterItems = createFilterOptions({ stringify: (o) => `${o.name} ${o.code}` })

// Dropdown alternative to voice/typing: pick a product, set a qty, Add.
export default function ManualItemPicker({ onAddLine }) {
  const theme = useTheme()
  // Option detail scales with screen size:
  //   xs/sm (<900px): name only · md (900–1200px): name + code · lg (≥1200px): name + code + price
  const showCode = useMediaQuery(theme.breakpoints.up('md'))
  const showPrice = useMediaQuery(theme.breakpoints.up('lg'))
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminListItems()
      .then((res) => setItems(res.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function add() {
    const quantity = parseFloat(qty)
    if (!selected) { setError('Select a product first'); return }
    if (!Number.isFinite(quantity) || quantity <= 0) { setError('Enter a valid quantity'); return }
    setError('')
    onAddLine({
      item_id: selected.id,
      code: selected.code,
      name: selected.name,
      unit_rate: selected.unit_rate,
      quantity,
      line_total: Math.round(selected.unit_rate * quantity * 100) / 100,
    })
    setSelected(null)
    setQty('1')
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mt: 2, displayPrint: 'none' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Or pick from the list
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
        <Autocomplete
          sx={{ flexGrow: 1 }}
          options={items}
          loading={loading}
          value={selected}
          onChange={(_, v) => { setSelected(v); setError('') }}
          getOptionLabel={(o) => (showCode ? `${o.name} (${o.code})` : o.name)}
          filterOptions={filterItems}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderOption={(props, option) => {
            const { key, ...rest } = props
            return (
              <li key={key ?? option.id} {...rest}>
                <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                  <span>
                    {option.name}
                    {showCode && (
                      <Typography component="span" variant="caption" color="text.secondary" fontFamily="monospace"> · {option.code}</Typography>
                    )}
                  </span>
                  {showPrice && <span>{formatCurrency(option.unit_rate)}</span>}
                </Stack>
              </li>
            )
          }}
          renderInput={(params) => <TextField {...params} label="Product" placeholder="Search product…" />}
        />
        <TextField
          label="Qty"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01, inputMode: 'decimal', style: { textAlign: 'center' } } }}
          sx={{ width: { xs: '100%', sm: 110 } }}
        />
        <Button
          variant="contained"
          onClick={add}
          endIcon={<AddIcon />}
          sx={{ px: 3, whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
    </Paper>
  )
}
