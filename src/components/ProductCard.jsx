import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/products/${product.id}`} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          image={product.image}
          alt={product.title}
          sx={{ objectFit: 'contain', height: 220, p: 2, bgcolor: '#f9fafb' }}
        />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary" noWrap>
              {product.category}
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>
              {product.title}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="primary">
                ${product.price.toFixed(2)}
              </Typography>
              <Rating value={product.rating?.rate ?? 0} precision={0.5} readOnly size="small" />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button component={Link} to={`/products/${product.id}`} size="small" endIcon={<ChevronRightIcon />}>
          View details
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard
