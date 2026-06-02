import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const authNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Checkout', to: '/checkout' },
]

const publicNavItems = [{ label: 'Home', to: '/' }]

function TopBar() {
  const { itemCount, toggleCart } = useCart()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isAuthenticated, signOut } = useAuth()
  const navItems = isAuthenticated ? authNavItems : publicNavItems

  return (
    <AppBar position="sticky" color="primary" elevation={4}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { sm: 'none' } }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component={NavLink}
            to="/"
            variant="h6"
            color="inherit"
            sx={{
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ShopEase
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="inherit"
              sx={{
                '&.active': {
                  borderBottom: `2px solid ${theme.palette.secondary.main}`,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {isAuthenticated ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={signOut}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Logout
          </Button>
        ) : (
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button component={NavLink} to="/login" color="inherit">
              Login
            </Button>
            <Button component={NavLink} to="/signup" color="inherit">
              Signup
            </Button>
          </Box>
        )}

        {isAuthenticated && (
          <IconButton color="inherit" onClick={toggleCart} aria-label="Open cart drawer">
            <Badge badgeContent={itemCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}
      </Toolbar>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setMobileOpen(false)}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Menu
          </Typography>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton component={NavLink} to={item.to}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {!isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={NavLink} to="/login">
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={NavLink} to="/signup">
                    <ListItemText primary="Signup" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton onClick={signOut}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}

export default TopBar
