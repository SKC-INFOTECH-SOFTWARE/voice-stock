import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TodayIcon from '@mui/icons-material/Today'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import GroupIcon from '@mui/icons-material/Group'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { adminDashboard } from '../api/client'
import { formatCurrency, formatQty } from '../utils/format'
import { StatCardsSkeleton, TableRowsSkeleton } from '../components/ui/Skeletons'

function Stat({ label, value, icon, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color }}>
          {icon}
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="h5" sx={{ mt: 1 }}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminDashboard().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (error) return <Alert severity="error">{error}</Alert>

  const s = data?.stats
  const tiles = s && [
    { label: 'Total Sales', value: formatCurrency(s.total_sales), icon: <PaymentsIcon />, color: 'primary.main' },
    { label: 'Invoices', value: s.invoice_count, icon: <ReceiptLongIcon />, color: 'primary.main' },
    { label: "Today's Sales", value: formatCurrency(s.today_sales), icon: <TodayIcon />, color: 'secondary.main' },
    { label: "Today's Invoices", value: s.today_count, icon: <TodayIcon />, color: 'secondary.main' },
    { label: 'Items', value: s.item_count, icon: <Inventory2Icon />, color: 'text.secondary' },
    { label: 'Customers', value: s.customer_count, icon: <GroupIcon />, color: 'text.secondary' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {loading ? (
        <StatCardsSkeleton count={6} />
      ) : (
        <Grid container spacing={2}>
          {tiles.map((t) => (
            <Grid key={t.label} size={{ xs: 6, md: 3 }}>
              <Stat {...t} />
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">Top Items by Revenue</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Qty Sold</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton rows={5} cols={4} />
                ) : data.top_items.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>No sales yet.</TableCell></TableRow>
                ) : (
                  data.top_items.map((it) => (
                    <TableRow key={it.code} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{it.code}</TableCell>
                      <TableCell>{it.name}</TableCell>
                      <TableCell align="right">{formatQty(it.qty_sold)}</TableCell>
                      <TableCell align="right">{formatCurrency(it.revenue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
