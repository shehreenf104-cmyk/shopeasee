const BASE_URL = 'https://fakestoreapi.com'

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = new Error('Unable to load data from Fake Store API.')
    error.status = response.status
    throw error
  }
  return response.json()
}

export const fetchProducts = async (signal) => {
  const response = await fetch(`${BASE_URL}/products`, { signal })
  return handleResponse(response)
}

export const fetchProductById = async (id, signal) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, { signal })
  return handleResponse(response)
}

export const fetchCategories = async (signal) => {
  const response = await fetch(`${BASE_URL}/products/categories`, { signal })
  return handleResponse(response)
}

export const fetchProductsByCategory = async (category, signal) => {
  const response = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(category)}`, { signal })
  return handleResponse(response)
}

export const fetchUsers = async (signal) => {
  const response = await fetch(`${BASE_URL}/users`, { signal })
  return handleResponse(response)
}

export const loginUser = async ({ username, password }) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handleResponse(response)
}

export const signupUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  return handleResponse(response)
}
