import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Stack,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { signIn, isAuthenticated, error, loading } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/products'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!identifier || !password) {
      setFormError('Username/email and password are required.')
      return
    }

    setFormError('')
    try {
      await signIn({ identifier, password })
    } catch {
      // Error is handled by auth context
    }
  }

  return (
    <Container sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 480, p: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Login</Typography>
            <Typography color="text.secondary">
              Sign in with your username or the email used during signup.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Username or email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
              />
              {(formError || error) && (
                <Alert severity="error">{formError || error}</Alert>
              )}
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Login
