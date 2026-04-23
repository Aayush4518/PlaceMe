'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import toast from 'react-hot-toast';
import { Search, MapPin, DollarSign, Clock, Building2, X } from 'lucide-react';

interface Job {
  _id: string;
  companyId: string;
  companyName: string;
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
  studentId: string;
  status: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: ''
  });

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMyApplications = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications?studentId=${user?.profile?._id}`);
      const data = await res.json();
      setMyApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [user?.profile?._id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'student') {
      router.push('/company');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchMyApplications();
    }
  }, [user, fetchJobs, fetchMyApplications]);

  const handleApply = async (job: Job) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          studentId: user?.profile?._id,
          studentName: user?.name,
          studentEmail: user?.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Application submitted!');
      fetchMyApplications();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const hasApplied = (jobId: string) => {
    return myApplications.some(app => app.jobId === jobId);
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Find Your Dream Job</h1>
          <p className="text-slate-600">Browse opportunities from top companies</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              options={[
                { value: '', label: 'All Types' },
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Internship', label: 'Internship' }
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              options={[
                { value: '', label: 'All Locations' },
                { value: 'Remote', label: 'Remote' },
                { value: 'New York', label: 'New York' },
                { value: 'San Francisco', label: 'San Francisco' },
                { value: 'London', label: 'London' }
              ]}
              className="w-full md:w-48"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              All Jobs
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No jobs found matching your criteria</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job._id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedJob(job)}>
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <Building2 className="w-4 h-4" />
                          {job.companyName}
                        </p>
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
                          {job.skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        {hasApplied(job._id) ? (
                          <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
                            Applied
                          </Button>
                        ) : (
                          <Button onClick={() => handleApply(job)}>
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My Applications</h2>
            {myApplications.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-sm text-slate-500">You haven&apos;t applied to any jobs yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => {
                  const job = jobs.find(j => j._id === app.jobId);
                  if (!job) return null;
                  return (
                    <Card key={app._id} className="py-4 cursor-pointer" onClick={() => setSelectedJob(job)}>
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-500">{job.companyName}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-lg text-slate-600 flex items-center gap-2 mt-1">
                    <Building2 className="w-5 h-5" />
                    {selectedJob.companyName}
                  </p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {selectedJob.location}
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  {selectedJob.salary}
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {selectedJob.type}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Job Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-500">
                  Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-4">
                {hasApplied(selectedJob._id) ? (
                  <Button variant="outline" disabled className="flex-1">
                    Already Applied
                  </Button>
                ) : (
                  <Button onClick={() => handleApply(selectedJob)} className="flex-1">
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
