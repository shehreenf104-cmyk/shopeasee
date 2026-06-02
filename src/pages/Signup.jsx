import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Stack,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username || !form.password || !form.email) {
      setError('Username, email, and password are required.')
      return
    }

    setLoading(true)
    try {
      await register({
        username: form.username,
        password: form.password,
        email: form.email,
        name: {
          firstname: form.firstname,
          lastname: form.lastname,
        },
      })
      setSuccess('Account created and signed in successfully.')
      setTimeout(() => navigate('/products'), 1200)
    } catch (err) {
      setError(err.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 520, p: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Create account</Typography>
            <Typography color="text.secondary">
              Sign up to access products, users, and checkout pages.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="First name"
                value={form.firstname}
                onChange={handleChange('firstname')}
                fullWidth
              />
              <TextField
                label="Last name"
                value={form.lastname}
                onChange={handleChange('lastname')}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                fullWidth
                required
              />
              <TextField
                label="Username"
                value={form.username}
                onChange={handleChange('username')}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                fullWidth
                required
              />
              {(error || success) && (
                <Alert severity={error ? 'error' : 'success'}>{error || success}</Alert>
              )}
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Creating account…' : 'Sign up'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Signup
