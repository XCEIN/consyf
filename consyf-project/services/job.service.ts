const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface Job {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  company_logo?: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  deadline?: string;
  is_active: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone: string;
  cv_file?: string;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  job_title?: string;
  company_name?: string;
  location?: string;
}

class JobService {
  async getAll(page: number = 1, limit: number = 12, jobType?: string, location?: string) {
    let url = `${API_URL}/api/jobs?page=${page}&limit=${limit}`;
    if (jobType) {
      url += `&job_type=${jobType}`;
    }
    if (location) {
      url += `&location=${location}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get jobs');
    }

    return await response.json();
  }

  async getBySlug(slug: string): Promise<Job> {
    const response = await fetch(`${API_URL}/api/jobs/${slug}`);

    if (!response.ok) {
      throw new Error('Failed to get job');
    }

    const data = await response.json();
    return data.job;
  }

  async apply(jobId: number, applicationData: {
    full_name: string;
    email: string;
    phone: string;
    cv_file?: string;
    cover_letter?: string;
  }): Promise<number> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      throw new Error('Failed to apply for job');
    }

    const result = await response.json();
    return result.applicationId;
  }

  async getMyApplications(): Promise<JobApplication[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/jobs/applications/me`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get applications');
    }

    const data = await response.json();
    return data.applications;
  }

  async create(data: Partial<Job>): Promise<number> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
    }

    const result = await response.json();
    return result.jobId;
  }
}

export default new JobService();
