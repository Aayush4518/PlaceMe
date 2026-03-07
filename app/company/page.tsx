'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Button from '@/components/Button';
import Card from '@/components/Card';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, MapPin, DollarSign, Clock, Users, Building2 } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  skills: string[];
  deadline: string;
  createdAt: string;
}

interface Application {
  _id: string;
  jobId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  createdAt: string;
}

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    skills: '',
    deadline: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'company') {
      router.push('/student');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?companyId=${user?.profile?._id}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications?companyId=${user?.profile?._id}`);
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        companyId: user?.profile?._id,
        companyName: user?.profile?.companyName
      };

      const url = editingJob ? `/api/jobs/${editingJob._id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success(editingJob ? 'Job updated!' : 'Job posted!');
      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: '',
        location: '',
        salary: '',
        type: 'Full-time',
        description: '',
        skills: '',
        deadline: ''
      });
      fetchJobs();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      location: job.location,
      salary: job.salary,
      type: job.type,
      description: job.description,
      skills: job.skills.join(', '),
      deadline: new Date(job.deadline).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Job deleted');
        fetchJobs();
      }
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Company Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user.profile?.companyName}</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingJob(null); setFormData({ title: '', location: '', salary: '', type: 'Full-time', description: '', skills: '', deadline: '' }); }}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button onClick={() => { setShowForm(false); setEditingJob(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                required
              />
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Remote, New York"
                required
              />
              <Input
                label="Salary / Stipend"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., $80,000 - $120,000"
                required
              />
              <Select
                label="Job Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Internship', label: 'Internship' }
                ]}
              />
              <Input
                label="Application Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
              <Input
                label="Required Skills (comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, Node.js, Python"
              />
              <Textarea
                label="Job Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role and responsibilities..."
                className="md:col-span-2"
                required
              />
              <div className="md:col-span-2">
                <Button type="submit" loading={loading}>
                  {editingJob ? 'Update Job' : 'Post Job'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Job Listings</h2>
            {jobs.length === 0 ? (
              <Card className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No job listings yet. Post your first job!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job._id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleEdit(job)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Applications</h2>
            {applications.length === 0 ? (
              <Card className="text-center py-8">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No applications yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 10).map((app) => (
                  <Card key={app._id} className="py-4">
                    <p className="font-medium text-slate-900">{app.studentName}</p>
                    <p className="text-sm text-slate-500">{app.studentEmail}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
