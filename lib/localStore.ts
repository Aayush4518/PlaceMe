import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export type UserRole = 'student' | 'company';
export type JobType = 'Internship' | 'Full-time';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileRecord {
  _id: string;
  userId: string;
  college: string;
  degree: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfileRecord {
  _id: string;
  userId: string;
  companyName: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListingRecord {
  _id: string;
  companyId: string;
  companyName: string;
  title: string;
  location: string;
  salary: string;
  type: JobType;
  description: string;
  skills: string[];
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  _id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDatabase {
  users: UserRecord[];
  studentProfiles: StudentProfileRecord[];
  companyProfiles: CompanyProfileRecord[];
  jobListings: JobListingRecord[];
  applications: ApplicationRecord[];
}

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'local-db.json');

const emptyDatabase = (): LocalDatabase => ({
  users: [],
  studentProfiles: [],
  companyProfiles: [],
  jobListings: [],
  applications: [],
});

let writeQueue = Promise.resolve();

async function readDatabase(): Promise<LocalDatabase> {
  try {
    const contents = await readFile(dataFile, 'utf8');
    return { ...emptyDatabase(), ...JSON.parse(contents) };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return emptyDatabase();
    }

    throw error;
  }
}

async function writeDatabase(database: LocalDatabase) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(database, null, 2));
}

async function withDatabase<T>(operation: (database: LocalDatabase) => T | Promise<T>) {
  const run = writeQueue.then(async () => {
    const database = await readDatabase();
    const result = await operation(database);
    await writeDatabase(database);
    return result;
  });

  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}

function now() {
  return new Date().toISOString();
}

function byNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createRecord<T extends object>(data: T) {
  const timestamp = now();

  return {
    _id: randomUUID(),
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const localStore = {
  findUserByEmail(email: string) {
    return readDatabase().then((database) =>
      database.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null,
    );
  },

  createUser(data: Pick<UserRecord, 'name' | 'email' | 'password' | 'role'>) {
    return withDatabase((database) => {
      const user = createRecord({
        ...data,
        email: data.email.toLowerCase(),
      });

      database.users.push(user);
      return user;
    });
  },

  createStudentProfile(data: Pick<StudentProfileRecord, 'userId' | 'college' | 'degree' | 'skills'>) {
    return withDatabase((database) => {
      const profile = createRecord(data);

      database.studentProfiles.push(profile);
      return profile;
    });
  },

  createCompanyProfile(data: Pick<CompanyProfileRecord, 'userId' | 'companyName' | 'website' | 'description'>) {
    return withDatabase((database) => {
      const profile = createRecord(data);

      database.companyProfiles.push(profile);
      return profile;
    });
  },

  findStudentProfileByUserId(userId: string) {
    return readDatabase().then((database) =>
      database.studentProfiles.find((profile) => profile.userId === userId) ?? null,
    );
  },

  findCompanyProfileByUserId(userId: string) {
    return readDatabase().then((database) =>
      database.companyProfiles.find((profile) => profile.userId === userId) ?? null,
    );
  },

  findJobs(filters: {
    type?: string | null;
    location?: string | null;
    search?: string | null;
    companyId?: string | null;
  }) {
    return readDatabase().then((database) => {
      const search = filters.search?.toLowerCase();
      const location = filters.location?.toLowerCase();

      const jobs = database.jobListings.filter((job) => {
        if (filters.type && job.type !== filters.type) return false;
        if (filters.companyId && job.companyId !== filters.companyId) return false;
        if (location && !job.location.toLowerCase().includes(location)) return false;
        if (
          search &&
          ![job.title, job.companyName, job.description].some((value) => value.toLowerCase().includes(search))
        ) {
          return false;
        }

        return true;
      });

      return byNewest(jobs);
    });
  },

  createJob(data: Pick<
    JobListingRecord,
    'companyId' | 'companyName' | 'title' | 'location' | 'salary' | 'type' | 'description' | 'skills' | 'deadline'
  >) {
    return withDatabase((database) => {
      const job = createRecord(data);

      database.jobListings.push(job);
      return job;
    });
  },

  updateJob(id: string, data: Partial<Omit<JobListingRecord, '_id' | 'createdAt' | 'updatedAt'>>) {
    return withDatabase((database) => {
      const job = database.jobListings.find((item) => item._id === id);

      if (!job) return null;

      Object.assign(job, data, { updatedAt: now() });
      return job;
    });
  },

  deleteJob(id: string) {
    return withDatabase((database) => {
      const jobIndex = database.jobListings.findIndex((job) => job._id === id);

      if (jobIndex === -1) return null;

      const [job] = database.jobListings.splice(jobIndex, 1);
      database.applications = database.applications.filter((application) => application.jobId !== id);
      return job;
    });
  },

  findApplications(filters: {
    jobId?: string | null;
    studentId?: string | null;
    companyId?: string | null;
  }) {
    return readDatabase().then((database) => {
      const companyJobIds = filters.companyId
        ? new Set(
            database.jobListings
              .filter((job) => job.companyId === filters.companyId)
              .map((job) => job._id),
          )
        : null;

      const applications = database.applications.filter((application) => {
        if (filters.jobId && application.jobId !== filters.jobId) return false;
        if (filters.studentId && application.studentId !== filters.studentId) return false;
        if (companyJobIds && !companyJobIds.has(application.jobId)) return false;

        return true;
      });

      return byNewest(applications);
    });
  },

  findApplication(jobId: string, studentId: string) {
    return readDatabase().then((database) =>
      database.applications.find(
        (application) => application.jobId === jobId && application.studentId === studentId,
      ) ?? null,
    );
  },

  createApplication(data: Pick<ApplicationRecord, 'jobId' | 'studentId' | 'studentName' | 'studentEmail'>) {
    return withDatabase((database) => {
      const application = createRecord({
        ...data,
        status: 'pending' as ApplicationStatus,
      });

      database.applications.push(application);
      return application;
    });
  },
};
