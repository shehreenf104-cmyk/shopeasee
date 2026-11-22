import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import { fetchProductById } from '../services/api'
import { useCart } from '../context/CartContext'

function ProductDetailsSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Skeleton width={120} height={36} sx={{ mb: 3, borderRadius: 2 }} />
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 5 }, border: '1px solid var(--mui-palette-divider)' }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <Skeleton width="30%" height={24} />
              <Skeleton width="85%" height={40} />
              <Skeleton width="60%" height={40} />
              <Skeleton width="40%" height={56} />
              <Skeleton height={100} />
              <Skeleton height={56} sx={{ borderRadius: 3 }} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetchProductById(id, controller.signal)
      .then((data) => setProduct(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [id])

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <ProductDetailsSkeleton />

  if (error || !product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" fontWeight={600}>
          {error || 'Unable to load this product.'}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 3 }}
          variant="outlined"
        >
          Go back
        </Button>
      </Container>
    )
  }

  return (
    <Box sx={{ background: 'background.default', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.9rem',
            px: 2,
            py: 0.875,
            background: 'background.paper',
            border: '1px solid var(--mui-palette-divider)',
            borderRadius: 2.5,
            '&:hover': {
              background: 'action.hover',
              color: 'text.primary',
              borderColor: 'divider',
            },
          }}
        >
          Back to products
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            border: '1px solid var(--mui-palette-divider)',
            borderRadius: 4,
          }}
        >
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Product image */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                  borderRadius: 4,
                  p: { xs: 4, md: 5 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1 / 1',
                  border: '1px solid var(--mui-palette-divider)',
                  position: 'sticky',
                  top: 100,
                }}
              >
                <Box
                  component="img"
                  src={product.image}
                  alt={product.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                />
              </Box>
            </Grid>

            {/* Product info */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2.5}>
                {/* Category + rating row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      background: 'rgba(37,99,235,0.1)',
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      border: '1px solid rgba(37,99,235,0.2)',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {product.rating?.rate ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({product.rating?.count ?? 0} reviews)
                    </Typography>
                  </Box>
                </Box>

                {/* Title */}
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em' }}
                >
                  {product.title}
                </Typography>

                {/* Rating stars */}
                <Rating
                  value={product.rating?.rate ?? 0}
                  precision={0.5}
                  readOnly
                  sx={{ '& .MuiRating-icon': { fontSize: 22 } }}
                />

                {/* Price */}
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: '2.25rem',
                      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.1,
                    }}
                  >
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                    ✓ In stock — Ready to ship
                  </Typography>
                </Box>

                {/* Divider */}
                <Box sx={{ borderTop: '1px solid var(--mui-palette-divider)', pt: 0.5 }} />

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.primary">
                    About this product
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.9375rem' }}
                  >
                    {product.description}
                  </Typography>
                </Box>

                {/* Add to cart */}
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAddToCart}
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    sx={{
                      py: 1.75,
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      background: added
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : undefined,
                      boxShadow: added
                        ? '0 4px 14px rgba(16,185,129,0.35)'
                        : undefined,
                    }}
                  >
                    {added ? '✓ Added to cart!' : 'Add to Cart'}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default ProductDetails
