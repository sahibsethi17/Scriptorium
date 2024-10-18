// Example client-side logout function using fetch
const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        // Handle successful logout (e.g., redirect to login page)
        console.log('Logged out successfully');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout', error);
    }
  };
  