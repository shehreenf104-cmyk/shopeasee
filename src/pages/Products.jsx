import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { fetchCategories, fetchProducts } from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    Promise.all([fetchProducts(controller.signal), fetchCategories(controller.signal)])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData)
        setCategories(categoriesData)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || product.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Typography color="text.secondary" paragraph>
          Browse the live product catalog from Fake Store API. Use search and category filters to find exactly what you want.
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredProducts.length === 0 ? (
        <Alert severity="info">No products match your search criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Products
