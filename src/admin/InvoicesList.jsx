import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { adminListInvoices } from '../api/client'
import { navigate } from '../hooks/useHashRoute'
import { formatCurrency, formatDate } from '../utils/format'
import { TableRowsSkeleton, CardListSkeleton } from '../components/ui/Skeletons'

export default function InvoicesList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const t = setTimeout(() => {
      adminListInvoices({ search, page, perPage: 20 })
        .then((res) => active && setData(res))
        .catch((e) => active && setError(e.message))
        .finally(() => active && setLoading(false))
    }, 250)
    return () => { active = false; clearTimeout(t) }
  }, [search, page])

  const open = (id) => navigate(`/invoice/${id}`)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        placeholder="Search invoice #, customer or phone…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        sx={{ maxWidth: 420 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        isMobile ? <CardListSkeleton rows={5} /> : (
          <TableContainer component={Card}><Table><TableBody><TableRowsSkeleton rows={6} cols={5} /></TableBody></Table></TableContainer>
        )
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {data?.invoices.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>No invoices found.</Typography>
          ) : data?.invoices.map((inv) => (
            <Card key={inv.id} onClick={() => open(inv.id)} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ pb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontFamily="monospace">{inv.invoice_number}</Typography>
                  <Typography fontWeight={700}>{formatCurrency(inv.total_amount)}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Typography>{inv.customer_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {inv.customer_phone} · {formatDate(inv.created_at)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.invoices.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>No invoices found.</TableCell></TableRow>
              ) : data?.invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer_name}</TableCell>
                  <TableCell>{inv.customer_phone}</TableCell>
                  <TableCell>{formatDate(inv.created_at)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(inv.total_amount)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => open(inv.id)} aria-label="open invoice">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.pagination.pages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
          <Pagination
            count={data.pagination.pages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            siblingCount={isMobile ? 0 : 1}
          />
        </Stack>
      )}
    </Box>
  )
}
