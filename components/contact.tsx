"use client"
import { useState } from 'react';

export default function EmailForm() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim email.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="to"
        placeholder="Email Tujuan"
        value={formData.to}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Subjek"
        value={formData.subject}
        onChange={handleChange}
        required
      />
      <textarea
        name="text"
        placeholder="Pesan"
        value={formData.text}
        onChange={handleChange}
        required
      />
      <button type="submit">Kirim Email</button>
    </form>
  );
}
