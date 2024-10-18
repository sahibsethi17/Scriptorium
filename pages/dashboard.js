import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return null;

  return <div>Welcome to the dashboard!</div>;
}
