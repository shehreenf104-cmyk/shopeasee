import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, mb: 4, bgcolor: 'white' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="secondary" fontWeight={700} gutterBottom>
              Responsive shopping experience
            </Typography>
            <Typography variant="h3" component="h1" gutterBottom>
              Discover modern products with a responsive store UI.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              ShopEase connects your customers to live products from Fake Store API, with search, category filters,
              product detail pages, cart management, and a checkout flow.
            </Typography>
            {isAuthenticated ? (
              <Button component={Link} to="/products" variant="contained" size="large" color="secondary">
                Browse Products
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={Link} to="/login" variant="contained" size="large" color="secondary">
                  Login to shop
                </Button>
                <Button component={Link} to="/signup" variant="outlined" size="large" color="secondary">
                  Create account
                </Button>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}> 
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Paper sx={{ p: 3, bgcolor: '#e3f2fd' }}>
                <Typography variant="h6">Live product catalog</Typography>
                <Typography color="text.secondary">Fetches from Fake Store API so your products stay dynamic.</Typography>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: '#fff3e0' }}>
                <Typography variant="h6">Smart cart experience</Typography>
                <Typography color="text.secondary">Add items to cart, adjust quantities, and complete checkout.</Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" mb={2} fontWeight={600}>
        Built for every screen
      </Typography>
      <Grid container spacing={3}>
        {[
          { title: 'Responsive layout', subtitle: 'Works across mobile, tablet, and desktop.' },
          { title: 'Category filters', subtitle: 'Refine results quickly by category.' },
          { title: 'Checkout flow', subtitle: 'A simple review and order summary page.' },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography color="text.secondary">{item.subtitle}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Home
