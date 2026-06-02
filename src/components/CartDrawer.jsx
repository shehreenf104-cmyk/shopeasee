import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, subtotal, drawerOpen, closeCart } = useCart()

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={closeCart}>
      <Box sx={{ width: { xs: 300, sm: 420 }, p: 2 }}> 
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h6">Shopping Cart</Typography>
          <IconButton onClick={closeCart} aria-label="Close cart drawer">
            <ArrowForwardIosIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {cart.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Your cart is empty. Add products from the catalog to continue.
          </Typography>
        ) : (
          <List disablePadding>
            {cart.map((item) => (
              <ListItem key={item.id} sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{ width: 64, height: 64, objectFit: 'contain', mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.title}
                  secondary={`$${item.price.toFixed(2)} × ${item.quantity}`}
                  sx={{ mr: 8 }}
                />
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                  <Typography>{item.quantity}</Typography>
                  <Button variant="outlined" size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                  <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Typography variant="subtitle1">Subtotal</Typography>
          <Typography variant="h6">${subtotal.toFixed(2)}</Typography>
          <Button
            component={RouterLink}
            to="/checkout"
            variant="contained"
            color="secondary"
            fullWidth
            onClick={closeCart}
            disabled={cart.length === 0}
          >
            Checkout
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}

export default CartDrawer
