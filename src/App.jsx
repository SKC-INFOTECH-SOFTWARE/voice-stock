import { useEffect, useReducer, useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Box from '@mui/material/Box'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import AppShell from './components/ui/AppShell'
import { useAuth } from './auth/AuthContext'
import VoiceInputBar from './components/VoiceInputBar'
import ManualItemPicker from './components/ManualItemPicker'
import BillingGrid from './components/BillingGrid'
import CustomerForm from './components/CustomerForm'
import InvoiceView from './components/InvoiceView'
import { billReducer, initialBill } from './state/billReducer'

const STEPS = ['Items', 'Customer', 'Invoice']
const STEP_INDEX = { entry: 0, customer: 1, invoice: 2 }

export default function App() {
  const { logout } = useAuth()
  const [bill, dispatch] = useReducer(billReducer, initialBill)
  const [step, setStep] = useState('entry')
  const [invoiceId, setInvoiceId] = useState(null)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('invoice')
    if (id && /^\d+$/.test(id)) {
      setInvoiceId(Number(id))
      setStep('invoice')
    }
  }, [])

  function goToInvoice(id) {
    setInvoiceId(id)
    setStep('invoice')
    const url = new URL(window.location.href)
    url.searchParams.set('invoice', String(id))
    window.history.replaceState({}, '', url)
  }

  function newBill() {
    dispatch({ type: 'CLEAR' })
    setInvoiceId(null)
    setStep('entry')
    const url = new URL(window.location.href)
    url.searchParams.delete('invoice')
    window.history.replaceState({}, '', url)
  }

  return (
    <AppShell
      title="Voice Billing"
      icon={<PointOfSaleIcon sx={{ mr: 0.5 }} />}
      actions={
        <>
          <Button color="inherit" href="#/admin" startIcon={<SettingsIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Admin
          </Button>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={logout} aria-label="logout"><LogoutIcon /></IconButton>
          </Tooltip>
        </>
      }
    >
      <Box sx={{ mb: 2, displayPrint: 'none' }}>
        <Stepper activeStep={STEP_INDEX[step]} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </Box>

      {step === 'entry' && (
        <>
          <VoiceInputBar onAddLine={(line) => dispatch({ type: 'ADD_LINE', line })} />
          <ManualItemPicker onAddLine={(line) => dispatch({ type: 'ADD_LINE', line })} />
          <BillingGrid
            lines={bill.lines}
            onUpdateQty={(itemId, quantity) => dispatch({ type: 'UPDATE_QTY', itemId, quantity })}
            onRemove={(itemId) => dispatch({ type: 'REMOVE_LINE', itemId })}
            onProceed={() => setStep('customer')}
          />
        </>
      )}

      {step === 'customer' && (
        <CustomerForm lines={bill.lines} onBack={() => setStep('entry')} onSaved={goToInvoice} />
      )}

      {step === 'invoice' && invoiceId && (
        <InvoiceView invoiceId={invoiceId} onNewBill={newBill} />
      )}
    </AppShell>
  )
}
