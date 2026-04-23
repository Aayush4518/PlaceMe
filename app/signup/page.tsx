'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [role, setRole] = useState<'student' | 'company'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    degree: '',
    skills: '',
    companyName: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        setUser(loginData.user);
        toast.success('Account created successfully!');
        router.push(role === 'company' ? '/company' : '/student');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>
          <p className="text-slate-600 mt-2">Join PlaceMe today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                role === 'student'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              I&apos;m a Student
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                role === 'company'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              I&apos;m a Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={role === 'student' ? 'Full Name' : 'HR Contact Name'}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />

            {role === 'student' ? (
              <>
                <Input
                  label="College"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Your college name"
                  required
                />
                <Input
                  label="Degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech, BBA, MCA"
                  required
                />
                <Input
                  label="Skills (comma separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python"
                />
              </>
            ) : (
              <>
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name"
                  required
                />
                <Input
                  label="Company Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description about your company"
                    className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
