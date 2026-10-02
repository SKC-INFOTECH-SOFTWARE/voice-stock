import Skeleton from '@mui/material/Skeleton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Grid from '@mui/material/Grid'

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={40} />
      </CardContent>
    </Card>
  )
}

export function StatCardsSkeleton({ count = 6 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 6, md: 3 }}>
          <StatCardSkeleton />
        </Grid>
      ))}
    </Grid>
  )
}

export function TableRowsSkeleton({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function CardListSkeleton({ rows = 4 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="rounded" height={40} />
        </Box>
      ))}
      <Skeleton variant="rounded" width={140} height={40} />
    </Stack>
  )
}

export function InvoiceSkeleton() {
  return (
    <Card sx={{ maxWidth: 760, mx: 'auto' }}>
      <CardContent>
        <Skeleton variant="text" width="50%" height={40} />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
        <Box sx={{ mt: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" height={32} />
          ))}
        </Box>
        <Skeleton variant="text" width="30%" height={40} sx={{ ml: 'auto', mt: 2 }} />
      </CardContent>
    </Card>
  )
}
