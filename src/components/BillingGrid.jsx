import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { formatCurrency } from '../utils/format'
import { grandTotal } from '../state/billReducer'

function QtyField({ value, onChange, width = 90 }) {
  return (
    <TextField
      type="number"
      size="small"
      value={value}
      onChange={(e) => {
        const q = parseFloat(e.target.value)
        if (Number.isFinite(q) && q > 0) onChange(q)
      }}
      slotProps={{ htmlInput: { min: 0.01, step: 0.01, inputMode: 'decimal', style: { textAlign: 'center' } } }}
      sx={{ width }}
    />
  )
}

export default function BillingGrid({ lines, onUpdateQty, onRemove, onProceed }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const total = grandTotal(lines)

  const empty = (
    <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
      <ReceiptLongIcon sx={{ fontSize: 48, opacity: 0.4 }} />
      <Typography sx={{ mt: 1 }}>No items yet. Speak or type an entry above to begin.</Typography>
    </Box>
  )

  return (
    <Box sx={{ mt: 2 }}>
      {lines.length === 0 ? (
        <Paper variant="outlined">{empty}</Paper>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {lines.map((line, i) => (
            <Card key={line.item_id}>
              <CardContent sx={{ pb: '12px !important' }}>
                {/* Title row: name + code on the left, delete pinned right */}
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>{line.name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      #{i + 1} · {line.code}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => onRemove(line.item_id)} aria-label="remove" sx={{ mt: -0.5, mr: -0.5 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 1 }} />

                {/* Stacked label / value rows — label left, value hard-right */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>Rate</Typography>
                    <Typography variant="body2">{formatCurrency(line.unit_rate)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>Qty</Typography>
                    <QtyField value={line.quantity} onChange={(q) => onUpdateQty(line.item_id, q)} width={88} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>Total</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(line.line_total)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Unit Rate</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Line Total</TableCell>
                <TableCell align="center" sx={{ displayPrint: 'none' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, i) => (
                <TableRow key={line.item_id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{line.code}</TableCell>
                  <TableCell>{line.name}</TableCell>
                  <TableCell align="right">{formatCurrency(line.unit_rate)}</TableCell>
                  <TableCell align="right">
                    <QtyField value={line.quantity} onChange={(q) => onUpdateQty(line.item_id, q)} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(line.line_total)}</TableCell>
                  <TableCell align="center" sx={{ displayPrint: 'none' }}>
                    <IconButton size="small" color="error" onClick={() => onRemove(line.item_id)} aria-label="remove">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grand total + proceed */}
      <Paper
        variant="outlined"
        sx={{
          mt: 2, p: 2, position: 'sticky', bottom: 8, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">Grand Total</Typography>
          <Typography variant="h5">{formatCurrency(total)}</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          disabled={lines.length === 0}
          onClick={onProceed}
          sx={{ displayPrint: 'none', flexShrink: 0 }}
        >
          Proceed to Billing
        </Button>
      </Paper>
    </Box>
  )
}
