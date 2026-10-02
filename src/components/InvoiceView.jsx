import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import PrintIcon from '@mui/icons-material/Print'
import AddIcon from '@mui/icons-material/Add'
import { getCompanyProfile, getInvoice } from '../api/client'
import { formatCurrency, formatQty, formatDate } from '../utils/format'
import { InvoiceSkeleton } from './ui/Skeletons'

export default function InvoiceView({ invoiceId, onNewBill }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [company, setCompany] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getCompanyProfile(), getInvoice(invoiceId)])
      .then(([c, inv]) => {
        if (!active) return
        setCompany(c.profile)
        setInvoice(inv.invoice)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [invoiceId])

  if (loading) return <Box sx={{ mt: 2 }}><InvoiceSkeleton /></Box>
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
  if (!invoice || !company) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, displayPrint: 'none' }}>
        <Button onClick={onNewBill} startIcon={<AddIcon />} variant="outlined">New Bill</Button>
        <Button onClick={() => window.print()} startIcon={<PrintIcon />} variant="contained">Print Invoice</Button>
      </Stack>

      <Card sx={{ maxWidth: 760, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Company header */}
          <Typography variant="h5">{company.name}</Typography>
          {company.address && <Typography variant="body2" color="text.secondary">{company.address}</Typography>}
          <Typography variant="body2" color="text.secondary">
            {company.phone && <>Phone: {company.phone}</>}
            {company.tax_id && <Box component="span" sx={{ ml: 2 }}>Tax ID: {company.tax_id}</Box>}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Meta */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Billed To</Typography>
              <Typography>{invoice.customer.name}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.customer.address}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.customer.phone}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="body2"><b>Invoice:</b> {invoice.invoice_number}</Typography>
              <Typography variant="body2"><b>Date:</b> {formatDate(invoice.created_at)}</Typography>
            </Grid>
          </Grid>

          {/* Items */}
          {isMobile ? (
            <Stack spacing={1} sx={{ mt: 3 }}>
              {invoice.items.map((it, i) => (
                <Box key={it.item_id}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{i + 1}. {it.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(it.line_total)}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {it.code} · {formatCurrency(it.unit_rate)} × {formatQty(it.quantity)}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          ) : (
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((it, i) => (
                    <TableRow key={it.item_id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{it.code}</TableCell>
                      <TableCell>{it.name}</TableCell>
                      <TableCell align="right">{formatCurrency(it.unit_rate)}</TableCell>
                      <TableCell align="right">{formatQty(it.quantity)}</TableCell>
                      <TableCell align="right">{formatCurrency(it.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Stack direction="row" justifyContent="flex-end" alignItems="baseline" spacing={2} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">Grand Total</Typography>
            <Typography variant="h5">{formatCurrency(invoice.total_amount)}</Typography>
          </Stack>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 4 }}>
            Thank you for your business!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
