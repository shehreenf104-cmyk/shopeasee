import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material'
import { fetchUsers } from '../services/api'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetchUsers(controller.signal)
      .then((data) => setUsers(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Typography color="text.secondary" paragraph>
        Fetching all users from Fake Store API. This page is protected and requires login.
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {user.name.firstname} {user.name.lastname}
                  </Typography>
                  <Typography color="text.secondary">Username: {user.username}</Typography>
                  <Typography color="text.secondary">Email: {user.email}</Typography>
                  <Typography color="text.secondary">Phone: {user.phone}</Typography>
                  <Typography color="text.secondary">
                    City: {user.address.city}, {user.address.street}
                  </Typography>
                  <Typography color="text.secondary">Company: {user.company.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Users
