import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { fetchProductById } from '../services/api'
import { useCart } from '../context/CartContext'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" color="error">
          {error || 'Unable to load this product.'}
        </Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back to products
      </Button>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={product.image}
              alt={product.title}
              sx={{ width: '100%', height: 420, objectFit: 'contain', bgcolor: '#f9fafb', p: 4 }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <Typography variant="overline" color="secondary" fontWeight={700}>
                {product.category}
              </Typography>
              <Typography variant="h4" component="h1">
                {product.title}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={product.rating?.rate ?? 0} precision={0.5} readOnly />
                <Typography color="text.secondary">({product.rating?.count ?? 0} reviews)</Typography>
              </Stack>
              <Typography variant="h5" color="primary">
                ${product.price.toFixed(2)}
              </Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>
              <Button variant="contained" size="large" onClick={() => addToCart(product)}>
                Add to Cart
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default ProductDetails
