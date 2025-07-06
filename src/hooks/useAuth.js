import { useState, useEffect } from 'react';

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return { isLoggedIn, user };
}
