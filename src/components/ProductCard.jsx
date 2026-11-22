import {
  Box,
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/products/${product.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* Image area */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <CardMedia
            component="img"
            image={product.image}
            alt={product.title}
            sx={{
              objectFit: 'contain',
              height: '80%',
              width: '80%',
              transition: 'transform 0.35s ease',
              '.MuiCardActionArea-root:hover &': { transform: 'scale(1.07)' },
            }}
          />
          {/* Category badge */}
          <Chip
            label={product.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              border: '1px solid var(--mui-palette-divider)',
              textTransform: 'capitalize',
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Stack spacing={0.75}>
            <Typography
              variant="body2"
              component="h3"
              sx={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.primary',
                minHeight: '2.7em',
              }}
            >
              {product.title}
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ${product.price.toFixed(2)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Rating value={product.rating?.rate ?? 0} precision={0.5} readOnly size="small" />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  ({product.rating?.count ?? 0})
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
        <Button
          component={Link}
          to={`/products/${product.id}`}
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'primary.main',
            px: 1.5,
            '&:hover': { background: 'rgba(37,99,235,0.06)' },
          }}
        >
          View details
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard
