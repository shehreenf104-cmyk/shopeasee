import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import { fetchUsers } from "../services/api";

const avatarGradients = [
  "linear-gradient(135deg, #2563EB, #1D4ED8)",
  "linear-gradient(135deg, #FF6B35, #E55A2B)",
  "linear-gradient(135deg, #059669, #047857)",
  "linear-gradient(135deg, #7C3AED, #6D28D9)",
  "linear-gradient(135deg, #DC2626, #B91C1C)",
  "linear-gradient(135deg, #0891B2, #0E7490)",
  "linear-gradient(135deg, #D97706, #B45309)",
  "linear-gradient(135deg, #DB2777, #BE185D)",
];

function UserCardSkeleton() {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={22} />
            <Skeleton variant="text" width="45%" height={18} />
          </Box>
        </Box>
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="text"
              width={`${55 + i * 8}%`}
              height={18}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
      <Box sx={{ color: "#94A3B8", mt: 0.15, flexShrink: 0 }}>{icon}</Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.5, wordBreak: "break-word" }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal)
      .then((data) => setUsers(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <Box sx={{ background: "#F1F5F9", minHeight: "100vh" }}>
      {/* Page header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          py: { xs: 5, md: 7 },
          px: 2,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: "#93C5FD",
              letterSpacing: "0.15em",
              fontSize: "0.75rem",
              mb: 1,
              display: "block",
            }}
          >
            DIRECTORY
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "1.875rem", md: "2.5rem" },
            }}
          >
            Users
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <UserCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 520 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Showing{" "}
              <Box component="span" fontWeight={700} color="text.primary">
                {users.length}
              </Box>{" "}
              users
            </Typography>
            <Grid container spacing={3}>
              {users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: 3,
                      "&:hover": {
                        boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header: avatar + name */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            background:
                              avatarGradients[user.id % avatarGradients.length],
                            fontSize: "1.0625rem",
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        >
                          {user.name.firstname[0]?.toUpperCase()}
                          {user.name.lastname[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ lineHeight: 1.3, mb: 0.2 }}
                            noWrap
                          >
                            {user.name.firstname} {user.name.lastname}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748B",
                              fontWeight: 600,
                              background: "rgba(37,99,235,0.08)",
                              px: 1,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: "0.7rem",
                            }}
                          >
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Info rows */}
                      <Stack spacing={1.25}>
                        <InfoRow
                          icon={<EmailIcon sx={{ fontSize: 15 }} />}
                          text={user.email}
                        />
                        <InfoRow
                          icon={<PhoneIcon sx={{ fontSize: 15 }} />}
                          text={user.phone}
                        />
                        <InfoRow
                          icon={<LocationOnIcon sx={{ fontSize: 15 }} />}
                          text={`${user.address.street}, ${user.address.city}`}
                        />
                        <InfoRow
                          icon={<BusinessIcon sx={{ fontSize: 15 }} />}
                          text={user.company.name}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Users;
