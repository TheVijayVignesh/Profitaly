// Base fetcher that attaches Firebase UID to every request
const apiFetch = async (path: string, options: RequestInit = {}) => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  
  return fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(uid ? { 'x-user-id': uid } : {}),
      ...options.headers,
    },
  });
};

// User functions
export const getUserProfile = async (userId: string) => {
  const response = await apiFetch(`/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }
  return response.json();
};

export const upsertUserProfile = async (userId: string, data: any) => {
  const response = await apiFetch(`/users/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert user profile: ${response.statusText}`);
  }
  return response.json();
};

// Portfolio functions
export const getPortfolios = async (userId: string) => {
  const response = await apiFetch('/portfolios');
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
  }
  return response.json();
};

export const createPortfolio = async (userId: string, data: any) => {
  const response = await apiFetch('/portfolios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create portfolio: ${response.statusText}`);
  }
  return response.json();
};

export const getPortfolio = async (portfolioId: string) => {
  const response = await apiFetch(`/portfolios/${portfolioId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
  }
  return response.json();
};

export const updatePortfolio = async (portfolioId: string, data: any) => {
  const response = await apiFetch(`/portfolios/${portfolioId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update portfolio: ${response.statusText}`);
  }
  return response.json();
};

export const deletePortfolio = async (portfolioId: string) => {
  const response = await apiFetch(`/portfolios/${portfolioId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete portfolio: ${response.statusText}`);
  }
  return response.json();
};

// Holdings functions
export const getHoldings = async (portfolioId?: string) => {
  const url = portfolioId ? `/holdings?portfolioId=${portfolioId}` : '/holdings';
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch holdings: ${response.statusText}`);
  }
  return response.json();
};

export const upsertHolding = async (data: any) => {
  const response = await apiFetch('/holdings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert holding: ${response.statusText}`);
  }
  return response.json();
};

// Transactions functions
export const getTransactions = async (userId: string, portfolioId?: string) => {
  const url = portfolioId ? `/transactions?portfolioId=${portfolioId}` : '/transactions';
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
};

export const addTransaction = async (data: any) => {
  const response = await apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to add transaction: ${response.statusText}`);
  }
  return response.json();
};

// Watchlist functions
export const getWatchlist = async (userId: string) => {
  const response = await apiFetch('/watchlist');
  if (!response.ok) {
    throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
  }
  return response.json();
};

export const addToWatchlist = async (data: any) => {
  const response = await apiFetch('/watchlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to add to watchlist: ${response.statusText}`);
  }
  return response.json();
};

export const removeFromWatchlist = async (userId: string, symbol: string) => {
  const response = await apiFetch(`/watchlist?symbol=${encodeURIComponent(symbol)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to remove from watchlist: ${response.statusText}`);
  }
  return response.json();
};

// Recommendations functions
export const getRecommendations = async (userId: string, isActive?: boolean) => {
  const url = isActive !== undefined ? `/recommendations?isActive=${isActive}` : '/recommendations';
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }
  return response.json();
};

export const saveRecommendation = async (data: any) => {
  const response = await apiFetch('/recommendations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to save recommendation: ${response.statusText}`);
  }
  return response.json();
};
