import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CloseIcon from '@mui/icons-material/Close'
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
  useScrollTrigger,
} from '@mui/material'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const authNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Checkout', to: '/checkout' },
  { label: 'Help', to: '/help' },
];

const adminNavItems = [
  { label: "Admin", to: "/admin" },
  { label: "Help", to: "/help" },
];

const publicNavItems = [
  { label: "Home", to: "/" },
  { label: "Help", to: "/help" },
];

function TopBar() {
  const { itemCount, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const navItems = isAuthenticated
    ? isAdmin
      ? adminNavItems
      : authNavItems
    : publicNavItems;
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  return (
    <AppBar
      position="sticky"
      elevation={scrolled ? 6 : 0}
      sx={{
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        borderBottom: scrolled ? "none" : "1px solid rgba(255,255,255,0.06)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Toolbar
        sx={{ gap: 1, minHeight: { xs: 64, sm: 68 }, px: { xs: 2, sm: 3 } }}
      >
        {/* Brand */}
        <Box
          sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 1.25 }}
        >
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { sm: "none" }, mr: 0.5 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={NavLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              "&:hover .brand-icon": { transform: "rotate(-8deg) scale(1.1)" },
            }}
          >
            <Box
              className="brand-icon"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                transition: "transform 0.25s ease",
                flexShrink: 0,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 18, color: "white" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ShopEase
            </Typography>
          </Box>
        </Box>

        {/* Desktop nav links */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            gap: 0.5,
            alignItems: "center",
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontWeight: 500,
                fontSize: "0.9rem",
                px: 1.75,
                py: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                },
                "&.active": {
                  color: "white",
                  background: "rgba(255,255,255,0.1)",
                  fontWeight: 600,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Auth buttons */}
        {isAuthenticated ? (
          <Button
            variant="outlined"
            onClick={signOut}
            size="small"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              color: "rgba(255,255,255,0.8)",
              borderColor: "rgba(255,255,255,0.25)",
              borderWidth: "1.5px",
              px: 2,
              fontSize: "0.875rem",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                borderWidth: "1.5px",
              },
            }}
          >
            Logout
          </Button>
        ) : (
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            <Button
              component={NavLink}
              to="/login"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                fontSize: "0.875rem",
                px: 2,
                "&:hover": {
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Login
            </Button>
            <Button
              component={NavLink}
              to="/signup"
              variant="contained"
              size="small"
              sx={{
                px: 2.5,
                fontSize: "0.875rem",
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #1E40AF)",
                  boxShadow: "0 6px 16px rgba(37,99,235,0.5)",
                },
              }}
            >
              Sign up
            </Button>
          </Box>
        )}

        {/* Cart button */}
        {isAuthenticated && (
          <IconButton
            onClick={toggleCart}
            aria-label="Open cart drawer"
            sx={{
              color: "rgba(255,255,255,0.85)",
              ml: 0.5,
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              "&:hover": {
                background: "rgba(255,255,255,0.14)",
                color: "white",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <Badge
              badgeContent={itemCount}
              color="secondary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: "linear-gradient(160deg, #1E293B 0%, #0F172A 100%)",
            borderRadius: "0 20px 20px 0",
          },
        }}
      >
        <Box role="presentation">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StorefrontIcon sx={{ fontSize: 17, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: 800, fontSize: "1.1rem" }}
              >
                ShopEase
              </Typography>
            </Box>
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": { color: "white" },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <List sx={{ px: 1.5, pt: 1.5 }}>
            {navItems.map((item) => (
              <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    color: "rgba(255,255,255,0.75)",
                    py: 1.25,
                    "&:hover": {
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                    },
                    "&.active": {
                      background: "rgba(37,99,235,0.25)",
                      color: "white",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { fontWeight: 500, fontSize: "0.95rem" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

            {!isAuthenticated ? (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2,
                      color: "rgba(255,255,255,0.75)",
                      py: 1.25,
                      "&:hover": {
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                      },
                    }}
                  >
                    <ListItemText
                      primary="Login"
                      slotProps={{ primary: { fontWeight: 500 } }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2,
                      background: "rgba(37,99,235,0.2)",
                      color: "rgba(255,255,255,0.9)",
                      py: 1.25,
                      "&:hover": {
                        background: "rgba(37,99,235,0.35)",
                        color: "white",
                      },
                    }}
                  >
                    <ListItemText
                      primary="Sign up"
                      slotProps={{ primary: { fontWeight: 600 } }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  sx={{
                    borderRadius: 2,
                    color: "rgba(255,255,255,0.65)",
                    py: 1.25,
                    "&:hover": {
                      background: "rgba(239,68,68,0.12)",
                      color: "#FCA5A5",
                    },
                  }}
                >
                  <ListItemText
                    primary="Logout"
                    slotProps={{ primary: { fontWeight: 500 } }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default TopBar
