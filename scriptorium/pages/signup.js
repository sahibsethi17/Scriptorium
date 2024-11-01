import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '', firstName: '', lastName: '', phoneNumber: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
