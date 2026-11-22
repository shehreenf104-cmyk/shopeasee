import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront'
import StarIcon from '@mui/icons-material/Star'
import DiamondIcon from '@mui/icons-material/Diamond'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import DevicesIcon from '@mui/icons-material/Devices'
import { useAuth } from '../context/AuthContext'

const categories = [
  {
    label: "Electronics",
    icon: <DevicesIcon sx={{ fontSize: 36, color: '#2563EB' }} />,
    bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    darkBg: 'rgba(37,99,235,0.12)',
    border: 'rgba(37,99,235,0.15)',
    desc: 'Laptops, phones & gadgets',
  },
  {
    label: "Jewelry",
    icon: <DiamondIcon sx={{ fontSize: 36, color: '#7C3AED' }} />,
    bg: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
    darkBg: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.15)',
    desc: 'Rings, necklaces & more',
  },
  {
    label: "Men's Clothing",
    icon: <CheckroomIcon sx={{ fontSize: 36, color: '#059669' }} />,
    bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
    darkBg: 'rgba(5,150,105,0.12)',
    border: 'rgba(5,150,105,0.15)',
    desc: 'Shirts, jackets & casual wear',
  },
  {
    label: "Women's Clothing",
    icon: <StarIcon sx={{ fontSize: 36, color: '#FF6B35' }} />,
    bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    darkBg: 'rgba(255,107,53,0.12)',
    border: 'rgba(255,107,53,0.15)',
    desc: 'Dresses, tops & accessories',
  },
]


function Home() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <Box>
        {/* Authenticated hero — simple welcome back */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #1E3A5F 100%)',
            color: 'white',
            py: { xs: 10, md: 14 },
            px: 2,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2.25,
                py: 0.85,
                borderRadius: 50,
                background: 'rgba(37,99,235,0.18)',
                border: '1px solid rgba(37,99,235,0.4)',
                color: '#93C5FD',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 3.5,
              }}
            >
              ✦ Welcome back to ShopEase
            </Box>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                mb: 2.5,
              }}
            >
              Ready to find your next{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #60A5FA, #FF8C5A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                favourite product?
              </Box>
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.75,
                maxWidth: 480,
                mx: 'auto',
                mb: 5,
                fontSize: { xs: '1rem', md: '1.125rem' },
              }}
            >
              Your cart is waiting. Browse the full catalog and pick up where you left off.
            </Typography>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              size="large"
              color="secondary"
              sx={{ px: 5, py: 1.75, fontSize: '1.0625rem' }}
            >
              Browse Products
            </Button>
          </Container>
        </Box>
      </Box>
    )
  }

  /* ── Unauthenticated landing page ── */
  return (
    <Box>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #1E3A5F 100%)',
          color: 'white',
          py: { xs: 10, md: 18 },
          px: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-30%',
            right: '-5%',
            width: '55%',
            height: '180%',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-15%',
            left: '-5%',
            width: '45%',
            height: '70%',
            background: 'radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2.25,
                py: 0.85,
                borderRadius: 50,
                background: 'rgba(37,99,235,0.18)',
                border: '1px solid rgba(37,99,235,0.4)',
                color: '#93C5FD',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 3.5,
                letterSpacing: '0.01em',
              }}
            >
              <StorefrontIcon sx={{ fontSize: 16 }} />
              Your one-stop online shop
            </Box>

            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontSize: { xs: '2.4rem', sm: '3.25rem', md: '4rem' },
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                mb: 3,
              }}
            >
              Shop smarter with{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #60A5FA, #FF8C5A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ShopEase
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 400,
                lineHeight: 1.8,
                maxWidth: 580,
                mx: 'auto',
                mb: 5,
                fontSize: { xs: '1rem', md: '1.15rem' },
              }}
            >
              Discover thousands of products across electronics, fashion, jewelry and more.
              Sign up free and experience a seamless, modern shopping journey built for you.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                color="secondary"
                sx={{ px: 5, py: 1.75, fontSize: '1.0625rem' }}
              >
                Start Shopping Free
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.4)',
                  borderWidth: '1.5px',
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: '1.5px',
                    background: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Trust line */}
            <Typography
              sx={{ mt: 4, color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}
            >
              No credit card required &nbsp;·&nbsp; Free to join &nbsp;·&nbsp; Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── Stats strip ── */}
      <Box sx={{ background: 'background.paper', borderBottom: '1px solid var(--mui-palette-divider)' }}>
        <Container maxWidth="lg">
          <Grid container>
            {[
              { value: '200+', label: 'Products Available' },
              { value: '4', label: 'Product Categories' },
              { value: 'Free', label: 'Shipping Always' },
              { value: '100%', label: 'Secure Checkout' },
            ].map((stat, i) => (
              <Grid
                key={stat.label}
                item
                xs={6}
                sm={3}
                sx={{
                  py: { xs: 3, md: 4 },
                  px: 3,
                  textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--mui-palette-divider)' : 'none',
                  borderBottom: { xs: i < 2 ? '1px solid var(--mui-palette-divider)' : 'none', sm: 'none' },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    background: 'linear-gradient(135deg, #2563EB, #FF6B35)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Categories ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}
            >
              SHOP BY CATEGORY
            </Typography>
            <Typography
              variant="h3"
              sx={{ mt: 1, mb: 1.5, fontSize: { xs: '1.875rem', md: '2.5rem' } }}
            >
              Everything you love, in one place
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.75, fontSize: '1.0625rem' }}
            >
              From cutting-edge electronics to stylish clothing and sparkling jewelry — ShopEase has it all.
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {categories.map((cat) => (
              <Grid item xs={12} sm={6} md={3} key={cat.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    textAlign: 'center',
                    border: `1px solid ${cat.border}`,
                    borderRadius: 4,
                    background: cat.bg,
                    '.dark &': { background: cat.darkBg },
                    transition: 'all 0.28s ease',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 40px ${cat.border}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 4px 16px ${cat.border}`,
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75, fontSize: '1rem' }}>
                    {cat.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Box>
  )
}

export default Home
