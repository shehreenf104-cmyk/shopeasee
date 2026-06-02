import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCart } from '../context/CartContext'

function Checkout() {
  const { cart, subtotal, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setOrderPlaced(true)
    clearCart()
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      {cart.length === 0 && !orderPlaced ? (
        <Typography color="text.secondary">Your cart is empty. Add items before checking out.</Typography>
      ) : orderPlaced ? (
        <Card elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Order confirmed!
          </Typography>
          <Typography color="text.secondary" paragraph>
            Thanks for your purchase. We have received your order and will process it shortly.
          </Typography>
          <Typography variant="subtitle1">Order summary</Typography>
          <Typography>${subtotal.toFixed(2)} total</Typography>
        </Card>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <Typography variant="h6">Shipping details</Typography>
              <TextField
                label="Full name"
                value={form.name}
                onChange={handleChange('name')}
                required
                fullWidth
              />
              <TextField
                label="Email address"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                required
                fullWidth
              />
              <TextField
                label="Shipping address"
                value={form.address}
                onChange={handleChange('address')}
                required
                multiline
                rows={4}
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" color="secondary">
                Place order
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card elevation={2} sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order summary
                </Typography>
                <Stack spacing={1}>
                  {cart.map((item) => (
                    <Box key={item.id}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography>{item.title}</Typography>
                        <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                      </Stack>
                      <Typography color="text.secondary" variant="body2">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">${subtotal.toFixed(2)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default Checkout
