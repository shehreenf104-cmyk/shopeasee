import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShieldIcon from "@mui/icons-material/Shield";
import { useAuth } from "../context/AuthContext";
import { clearOrders, fetchOrders, fetchCartItems, deleteCartItem } from "../services/api";

function Admin() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCartItems(controller.signal)
      .then(setItems)
      .catch(() => setItems([]));
    return () => controller.abort();
  }, []);

  const saveItems = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem("shopEaseAddedProducts", JSON.stringify(nextItems));
  };

  const handleRemoveItem = async (recordKey) => {
    const item = items.find(
      (entry) => `${entry.recordId ?? entry.id}-${entry.addedAt ?? entry.title}` === recordKey,
    );
    if (item?.recordId) {
      try {
        await deleteCartItem(item.recordId);
      } catch {
        return;
      }
    }
    const nextItems = items.filter(
      (entry) => `${entry.recordId ?? entry.id}-${entry.addedAt ?? entry.title}` !== recordKey,
    );
    saveItems(nextItems);
  };

  const handleClearAll = async () => {
    try {
      await clearOrders();
    } finally {
      saveItems([]);
    }
  };

  const totalItems = useMemo(
    () => items.reduce((count, item) => count + Number(item.quantity ?? 1), 0),
    [items],
  );

  if (!isAdmin) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          You do not have permission to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{ background: "background.default", minHeight: "100vh", py: { xs: 4, md: 6 } }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1D4ED8, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 24px rgba(37,99,235,0.25)",
              }}
            >
              <ShieldIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", letterSpacing: "0.12em" }}
              >
                ADMIN PANEL
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ lineHeight: 1.1 }}
              >
                Added products overview
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate("/products")}>
              View catalog
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleClearAll}
              disabled={items.length === 0}
            >
              Clear all
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Total added
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {items.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Units tracked
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {totalItems}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Signed in as
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {user?.email || "Admin"}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {items.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                No products added yet
              </Typography>
              <Typography color="text.secondary">
                Once users add items to their cart, this page will show them
                here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Added by</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Qty.</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const recordKey = `${item.recordId ?? item.id}-${item.addedAt ?? item.title}`;

                  return (
                    <TableRow key={recordKey}>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            component="img"
                            src={item.image || "https://via.placeholder.com/80"}
                            alt={item.title}
                            sx={{
                              width: 48,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 2,
                            }}
                          />
                          <Box>
                            <Typography fontWeight={700}>
                              {item.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              #{item.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category || "Uncategorized"}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.addedBy || item.addedByName || "guest"}
                      </TableCell>
                      <TableCell>
                        {item.userPhone ||
                          item.customerPhone ||
                          item.phone ||
                          "N/A"}
                      </TableCell>
                      <TableCell align="right">{item.quantity ?? 1}</TableCell>
                      <TableCell align="right">
                        ${Number(item.price ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {item.addedAt
                          ? new Date(item.addedAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          aria-label={`Delete ${item.title}`}
                          onClick={() => handleRemoveItem(recordKey)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}

export default Admin
