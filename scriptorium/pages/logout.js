const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        console.log('Logged out successfully');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout', error);
    }
  };
  