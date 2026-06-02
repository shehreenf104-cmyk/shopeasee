import { Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function NotFound() {
  return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h3">404</Typography>
        <Typography variant="h6" color="text.secondary">
          The page you are looking for could not be found.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" color="secondary">
          Back to Home
        </Button>
      </Stack>
    </Container>
  )
}

export default NotFound
