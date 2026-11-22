import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Skeleton,
  Typography,
} from "@mui/material";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { fetchCategories, fetchProducts } from "../services/api";

function ProductSkeleton() {
  return (
    <Card sx={{ height: "100%" }}>
      <Skeleton
        variant="rectangular"
        height={220}
        sx={{ borderRadius: "16px 16px 0 0" }}
      />
      <CardContent>
        <Skeleton variant="text" width="55%" height={18} sx={{ mb: 0.75 }} />
        <Skeleton variant="text" width="90%" height={22} />
        <Skeleton variant="text" width="75%" height={22} sx={{ mb: 1.5 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="35%" height={28} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </CardContent>
    </Card>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      fetchProducts(controller.signal),
      fetchCategories(controller.signal),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <Box sx={{ background: "background.default", minHeight: "100vh" }}>
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
            CATALOG
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
            All Products
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Search & filter panel */}
        <Box
          sx={{
            background: "background.paper",
            borderRadius: 3,
            p: { xs: 2.5, md: 3 },
            mb: 4,
            border: "1px solid var(--mui-palette-divider)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "grid", gap: 2 }}>
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter
              categories={categories}
              selected={category}
              onSelect={setCategory}
            />
          </Box>
        </Box>

        {/* Results count */}
        {!loading && !error && (
          <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing{" "}
              <Box component="span" fontWeight={700} color="text.primary">
                {filteredProducts.length}
              </Box>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {category !== "all" && (
                <Box component="span">
                  {" "}
                  in{" "}
                  <Box component="span" fontWeight={600} color="primary.main">
                    {category}
                  </Box>
                </Box>
              )}
            </Typography>
          </Box>
        )}

        {/* Product grid */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 520 }}>
            {error}
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12, px: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No products found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search or filters.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Products;
