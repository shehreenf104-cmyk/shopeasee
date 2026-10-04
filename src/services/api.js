const BASE_URL = "https://dummyjson.com";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const message = errorText
      ? `${response.status} ${errorText}`
      : "Unable to load data from the API.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const normalizeProduct = (product) => {
  if (!product || typeof product !== "object") {
    return product;
  }

  const rating =
    typeof product.rating === "number"
      ? {
          rate: Number(product.rating),
          count: Number(product.reviews?.length ?? 0),
        }
      : {
          rate: Number(product.rating?.rate ?? 0),
          count: Number(product.rating?.count ?? product.reviews?.length ?? 0),
        };

  return {
    ...product,
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    price: Number(product.price ?? 0),
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? "",
    rating,
  };
};

const normalizeUsers = (users) =>
  users.map((user) => ({
    ...user,
    id: user.id,
    username: user.username ?? user.email?.split("@")[0] ?? "unknown",
    email: user.email,
    phone: user.phone ?? "N/A",
    name: {
      firstname:
        user.firstName ?? user.name?.first ?? user.name?.firstname ?? "",
      lastname: user.lastName ?? user.name?.last ?? user.name?.lastname ?? "",
    },
    address: user.address ?? {
      city: "Unknown",
      street: "Unknown",
      number: 0,
      zipcode: "00000",
      geolocation: { lat: "0", long: "0" },
    },
  }));

const normalizeCategories = (categories) =>
  categories
    .map((category) => {
      if (typeof category === "string") return category.toLowerCase();
      if (category?.slug) return category.slug.toLowerCase();
      if (category?.name) return category.name.toLowerCase();
      return "";
    })
    .filter(Boolean);

export const fetchProducts = async (signal) => {
  const response = await fetch(`${BASE_URL}/products`, { signal });
  const data = await handleResponse(response);
  const products = Array.isArray(data) ? data : (data?.products ?? []);
  return products.map(normalizeProduct);
};

export const fetchProductById = async (id, signal) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, { signal });
  const data = await handleResponse(response);
  return normalizeProduct(data);
};

export const fetchCategories = async (signal) => {
  const response = await fetch(`${BASE_URL}/products/categories`, { signal });
  const data = await handleResponse(response);
  const categories = Array.isArray(data) ? data : (data?.categories ?? []);
  return normalizeCategories(categories);
};

export const fetchProductsByCategory = async (category, signal) => {
  const response = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}`,
    { signal },
  );
  const data = await handleResponse(response);
  const products = Array.isArray(data) ? data : (data?.products ?? []);
  return products.map(normalizeProduct);
};

export const fetchUsers = async (signal) => {
  const response = await fetch(`${BASE_URL}/users`, { signal });
  const data = await handleResponse(response);
  const users = Array.isArray(data) ? data : (data?.users ?? []);
  return normalizeUsers(users);
};

export const loginUser = async ({ username, password }) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const signupUser = async (userData) => {
  const payload = {
    firstName: userData.name?.firstname ?? userData.firstName ?? "",
    lastName: userData.name?.lastname ?? userData.lastName ?? "",
    username: userData.username,
    email: userData.email,
    password: userData.password,
  };

  const response = await fetch(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};
