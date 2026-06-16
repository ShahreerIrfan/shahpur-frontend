const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "/login";
    throw new Error("No token");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (browser will set boundary)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let res = await fetch(`${API_URL}${url}`, { ...options, headers });

  // If 401, try refreshing token
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access);
        token = data.access;

        // Retry original request with new token
        headers.Authorization = `Bearer ${token}`;
        res = await fetch(`${API_URL}${url}`, { ...options, headers });
      } else {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    } else {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return res;
}

export { API_URL };
