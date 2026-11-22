import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

function NotFound() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        background: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '"404"',
          position: 'absolute',
          fontSize: 'clamp(180px, 35vw, 400px)',
          fontWeight: 900,
          color: 'rgba(37,99,235,0.05)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.05em',
          lineHeight: 1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'inline-flex',
            px: 2.5,
            py: 0.85,
            borderRadius: 50,
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.2)',
            mb: 3,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#2563EB', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.75rem' }}
          >
            PAGE NOT FOUND
          </Typography>
        </Box>

        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, var(--mui-palette-text-primary), var(--mui-palette-text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          Oops, lost in space
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 5, fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: 400, mx: 'auto' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
        </Typography>

        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          sx={{ px: 5, py: 1.75, fontSize: '1.0625rem', fontWeight: 700 }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  )
}

export default NotFound
