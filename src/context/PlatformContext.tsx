import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, type User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where, type DocumentData, type QueryDocumentSnapshot, type Timestamp } from "firebase/firestore";
import { adminAuth, auth, db } from "@/lib/firebase";
import { sendPlatformEmail } from "@/lib/email";

export type UserRole = "Admin" | "Mentor" | "Intern";

export interface AuthUserProfile {
  id: string;
  uid: string;
  name: string;
  role: UserRole;
  email: string;
  internId?: string;
  mentorId?: string;
  createdAt?: string;
  firstLoginAt?: string;
  lastLoginAt?: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface PerformanceEntry {
  id: string;
  internId: string;
  month: string;
  score: number;
  remark: string;
}

export interface NewPerformanceInput {
  internId: string;
  month: string;
  score: number;
  remark: string;
}

export interface FeeEntry {
  id: string;
  internId: string;
  label: string;
  amount: number;
  paidAmount: number;
  status: "Paid" | "Pending";
  dueDate: string;
}

export interface DailyNoteEntry {
  id: string;
  internId: string;
  internName?: string;
  date: string;
  lectureTime?: string;
  title: string;
  note: string;
  mentorName: string;
  attachments?: FileAttachment[];
}

export interface FeedbackEntry {
  id: string;
  internId: string;
  internName?: string;
  date: string;
  mentorName: string;
  rating: number;
  comment: string;
}

export interface MentorFeedbackEntry {
  id: string;
  internId: string;
  internName?: string;
  mentorId: string;
  mentorName: string;
  date: string;
  rating: number;
  comment: string;
}

export interface DoubtEntry {
  id: string;
  internId: string;
  internName: string;
  topic: string;
  question: string;
  status: "Open" | "Answered";
  answer?: string;
  mentorName?: string;
  createdAt: string;
}

export interface SubmissionEntry {
  id: string;
  internId: string;
  internName: string;
  title: string;
  submissionTitle?: string;
  type: string;
  dueDate: string;
  lectureDate?: string;
  lectureTime?: string;
  generalUrl?: string;
  videoLink?: string;
  githubLink?: string;
  pptLink?: string;
  liveLink?: string;
  description?: string;
  techStack?: string;
  enabledFields?: SubmissionEnabledFields;
  taskCreatedBy?: "Mentor" | "Intern";
  submittedAt?: string;
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  feedback?: string;
  mentorName?: string;
  attachments?: FileAttachment[];
}

export interface SubmissionEnabledFields {
  submissionTitle: boolean;
  generalUrl: boolean;
  videoLink: boolean;
  githubLink: boolean;
  pptLink: boolean;
  liveLink: boolean;
  description: boolean;
  techStack: boolean;
  attachments: boolean;
}

export interface AttendanceRecord {
  internId: string;
  internName: string;
  internEmail: string;
  status: "Present" | "Absent";
  markedAt: string;
}

export interface AttendanceSession {
  id: string;
  mentorId: string;
  mentorName: string;
  title: string;
  date: string;
  startTime: string;
  notes?: string;
  status: "Open" | "Closed";
  createdAt: string;
  updatedAt?: string;
  internIds: string[];
  records: AttendanceRecord[];
}

export interface InternAttendanceEntry {
  sessionId: string;
  sessionTitle: string;
  mentorName: string;
  date: string;
  startTime: string;
  status: "Present" | "Absent";
  markedAt: string;
}

export interface FeedbackFormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "rating" | "checkbox" | "select";
  required: boolean;
  options?: string[];
}

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  fields: FeedbackFormField[];
  createdBy: string;
  createdByName: string;
  status: "Active" | "Closed";
  targetInternIds?: string[];
  createdAt: string;
}

export interface FeedbackFormResponse {
  fieldId: string;
  fieldLabel: string;
  value: string | number | boolean;
}

export interface FeedbackFormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  internId: string;
  internName: string;
  internEmail: string;
  responses: FeedbackFormResponse[];
  status: "Submitted" | "Approved" | "Rejected";
  adminReview?: string;
  approvedBy?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface NewUserInput {
  name: string;
  role: Exclude<UserRole, "Admin">;
  email: string;
  password: string;
  internId?: string;
  mentorId?: string;
  position?: string;
  issueDate?: string;
  validUntil?: string;
}

export interface NewDoubtInput {
  internId: string;
  internName: string;
  topic: string;
  question: string;
}

export interface NewMentorFeedbackInput {
  internId: string;
  internName: string;
  mentorId: string;
  mentorName: string;
  rating: number;
  comment: string;
}

export interface NewFeedbackFormInput {
  title: string;
  description: string;
  fields: FeedbackFormField[];
  targetInternIds?: string[];
}

export interface NewFeedbackFormSubmissionInput {
  formId: string;
  formTitle?: string;
  internId: string;
  internName: string;
  internEmail: string;
  responses: FeedbackFormResponse[];
}

export interface ReviewFeedbackFormSubmissionInput {
  submissionId: string;
  status: "Approved" | "Rejected";
  adminReview: string;
  approvedBy: string;
}

export interface MentorFeedbackForm {
  id: string;
  mentorIds: string[];
  mentorNames: string[];
  targetInternIds: string[];
  status: "Active" | "Closed";
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface MentorFeedbackSubmission {
  id: string;
  formId: string;
  mentorId: string;
  mentorName: string;
  internId: string;
  internName: string;
  internEmail: string;
  rating: number;
  review: string;
  submittedAt: string;
}

export interface NewMentorFeedbackFormInput {
  mentorIds: string[];
  mentorNames: string[];
  targetInternIds?: string[];
}

export interface NewMentorFeedbackSubmissionInput {
  formId: string;
  mentorId: string;
  mentorName: string;
  internId: string;
  internName: string;
  internEmail: string;
  rating: number;
  review: string;
}

export interface NewDailyNoteInput {
  internId: string;
  internName: string;
  date: string;
  lectureTime?: string;
  title: string;
  note: string;
  mentorName: string;
  files?: File[];
}

export interface UpdateAttendanceSessionInput {
  sessionId: string;
  title: string;
  date: string;
  startTime: string;
  notes?: string;
  records?: AttendanceRecord[];
  internIds?: string[];
  status?: "Open" | "Closed";
}

export interface NewSubmissionInput {
  internId: string;
  internName: string;
  title: string;
  submissionTitle?: string;
  type: string;
  dueDate: string;
  lectureDate?: string;
  lectureTime?: string;
  generalUrl?: string;
  videoLink?: string;
  githubLink?: string;
  pptLink?: string;
  liveLink?: string;
  description?: string;
  techStack?: string;
  enabledFields?: Partial<SubmissionEnabledFields>;
  taskCreatedBy?: "Mentor" | "Intern";
  files?: File[];
}

export interface UpdateSubmissionResponseInput {
  submissionId: string;
  submissionTitle?: string;
  lectureDate?: string;
  lectureTime?: string;
  generalUrl?: string;
  videoLink?: string;
  githubLink?: string;
  pptLink?: string;
  liveLink?: string;
  description?: string;
  techStack?: string;
  files?: File[];
}

export interface NewAttendanceSessionInput {
  mentorId: string;
  mentorName: string;
  title: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface MarkAttendanceInput {
  sessionId: string;
  internId: string;
  internName: string;
  internEmail: string;
  status: "Present" | "Absent";
}

export interface UpdateInternFeeInput {
  internId: string;
  label: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
}

interface PlatformContextValue {
  loading: boolean;
  sessionUser: AuthUserProfile | null;
  users: AuthUserProfile[];
  performance: PerformanceEntry[];
  fees: FeeEntry[];
  dailyNotes: DailyNoteEntry[];
  feedback: FeedbackEntry[];
  mentorFeedback: MentorFeedbackEntry[];
  doubts: DoubtEntry[];
  submissions: SubmissionEntry[];
  attendanceSessions: AttendanceSession[];
  feedbackForms: FeedbackForm[];
  feedbackFormSubmissions: FeedbackFormSubmission[];
  mentorFeedbackForms: MentorFeedbackForm[];
  mentorFeedbackSubmissions: MentorFeedbackSubmission[];
  adminStats: { users: number; interns: number; mentors: number; openDoubts: number; pendingSubmissions: number };
  internData: { performance: PerformanceEntry[]; fees: FeeEntry[]; dailyNotes: DailyNoteEntry[]; feedback: FeedbackEntry[]; doubts: DoubtEntry[]; submissions: SubmissionEntry[]; attendance: InternAttendanceEntry[]; feedbackForms: FeedbackForm[]; feedbackFormSubmissions: FeedbackFormSubmission[]; mentorFeedbackForms: MentorFeedbackForm[]; mentorFeedbackSubmissions: MentorFeedbackSubmission[] };
  mentorData: { internCount: number; doubts: DoubtEntry[]; feedback: FeedbackEntry[]; dailyNotes: DailyNoteEntry[]; submissions: SubmissionEntry[]; performance: PerformanceEntry[]; fees: FeeEntry[]; attendanceSessions: AttendanceSession[]; feedbackFormSubmissions: FeedbackFormSubmission[] };
  login: (email: string, password: string) => Promise<AuthUserProfile | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  createUser: (input: NewUserInput) => Promise<AuthUserProfile>;
  deleteUserAccount: (uid: string) => Promise<void>;
  setupAdmin: () => Promise<AuthUserProfile>;
  addDailyNote: (input: NewDailyNoteInput) => Promise<DailyNoteEntry>;
  addFeedback: (entry: Omit<FeedbackEntry, "id">) => Promise<FeedbackEntry>;
  addMentorFeedback: (entry: NewMentorFeedbackInput) => Promise<MentorFeedbackEntry>;
  addPerformance: (entry: NewPerformanceInput) => Promise<PerformanceEntry>;
  addDoubt: (input: NewDoubtInput) => Promise<DoubtEntry>;
  answerDoubt: (doubtId: string, answer: string, mentorName: string) => Promise<void>;
  addSubmission: (input: NewSubmissionInput) => Promise<SubmissionEntry>;
  updateSubmissionResponse: (input: UpdateSubmissionResponseInput) => Promise<void>;
  reviewSubmission: (submissionId: string, feedback: string, status: SubmissionEntry["status"], mentorName: string, internEmail?: string, internName?: string, submissionTitle?: string) => Promise<void>;
  upsertInternFee: (input: UpdateInternFeeInput) => Promise<FeeEntry>;
  createAttendanceSession: (input: NewAttendanceSessionInput) => Promise<AttendanceSession>;
  markAttendance: (input: MarkAttendanceInput) => Promise<void>;
  updateAttendanceSession: (input: UpdateAttendanceSessionInput) => Promise<void>;
  deleteAttendanceSession: (sessionId: string) => Promise<void>;
  createFeedbackForm: (input: NewFeedbackFormInput) => Promise<FeedbackForm>;
  updateFeedbackFormStatus: (formId: string, status: "Active" | "Closed") => Promise<void>;
  submitFeedbackForm: (input: NewFeedbackFormSubmissionInput) => Promise<FeedbackFormSubmission>;
  reviewFeedbackFormSubmission: (input: ReviewFeedbackFormSubmissionInput) => Promise<void>;
  createMentorFeedbackForm: (input: NewMentorFeedbackFormInput) => Promise<MentorFeedbackForm>;
  updateMentorFeedbackFormStatus: (formId: string, status: "Active" | "Closed") => Promise<void>;
  submitMentorFeedbackForm: (input: NewMentorFeedbackSubmissionInput) => Promise<MentorFeedbackSubmission>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

const collections = {
  users: collection(db, "users"),
  performance: collection(db, "performance"),
  fees: collection(db, "fees"),
  dailyNotes: collection(db, "dailyNotes"),
  feedback: collection(db, "feedback"),
  mentorFeedback: collection(db, "mentorFeedback"),
  doubts: collection(db, "doubts"),
  submissions: collection(db, "submissions"),
  attendanceSessions: collection(db, "attendanceSessions"),
  feedbackForms: collection(db, "feedbackForms"),
  feedbackFormSubmissions: collection(db, "feedbackFormSubmissions"),
  mentorFeedbackForms: collection(db, "mentorFeedbackForms"),
  mentorFeedbackSubmissions: collection(db, "mentorFeedbackSubmissions"),
} as const;

function toIsoDate(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }

  return new Date().toISOString();
}

function mapDoc<T>(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...(snapshot.data() as Omit<T, "id">) } as T;
}

function readFileAsDataUrl(file: File) {
  return new Promise<FileAttachment>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: String(reader.result ?? ""),
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

async function encodeAttachments(files?: File[]) {
  if (!files || files.length === 0) {
    return [] as FileAttachment[];
  }
  return Promise.all(files.map((file) => readFileAsDataUrl(file)));
}

function normalizeEnabledFields(fields?: Partial<SubmissionEnabledFields>): SubmissionEnabledFields {
  return {
    submissionTitle: Boolean(fields?.submissionTitle),
    generalUrl: Boolean(fields?.generalUrl),
    videoLink: Boolean(fields?.videoLink),
    githubLink: Boolean(fields?.githubLink),
    pptLink: Boolean(fields?.pptLink),
    liveLink: Boolean(fields?.liveLink),
    description: Boolean(fields?.description),
    techStack: Boolean(fields?.techStack),
    attachments: Boolean(fields?.attachments),
  };
}

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<AuthUserProfile | null>(null);
  const [users, setUsers] = useState<AuthUserProfile[]>([]);
  const [performance, setPerformance] = useState<PerformanceEntry[]>([]);
  const [fees, setFees] = useState<FeeEntry[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNoteEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [mentorFeedback, setMentorFeedback] = useState<MentorFeedbackEntry[]>([]);
  const [doubts, setDoubts] = useState<DoubtEntry[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([]);
  const [feedbackFormSubmissions, setFeedbackFormSubmissions] = useState<FeedbackFormSubmission[]>([]);
  const [mentorFeedbackForms, setMentorFeedbackForms] = useState<MentorFeedbackForm[]>([]);
  const [mentorFeedbackSubmissions, setMentorFeedbackSubmissions] = useState<MentorFeedbackSubmission[]>([]);

  const refresh = useCallback(async () => {
    if (!auth.currentUser) {
      setSessionUser(null);
      return;
    }

    const profileSnapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (profileSnapshot.exists()) {
      setSessionUser({ id: profileSnapshot.id, uid: profileSnapshot.id, ...(profileSnapshot.data() as Omit<AuthUserProfile, "id" | "uid">) });
    }
  }, []);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Failed to set auth persistence:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setSessionUser(null);
          setUsers([]);
          setPerformance([]);
          setFees([]);
          setDailyNotes([]);
          setFeedback([]);
          setDoubts([]);
          setSubmissions([]);
          setAttendanceSessions([]);
          return;
        }

        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        if (profileSnapshot.exists()) {
          setSessionUser({ id: profileSnapshot.id, uid: profileSnapshot.id, ...(profileSnapshot.data() as Omit<AuthUserProfile, "id" | "uid">) });
        } else {
          setSessionUser(null);
        }
      } catch (error) {
        console.error("Failed to restore auth profile:", error);
        setSessionUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    const userUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, uid: docSnapshot.id, ...(docSnapshot.data() as Omit<AuthUserProfile, "id" | "uid">) })));
    });

    const performanceQuery = sessionUser.role === "Intern"
      ? query(collections.performance, where("internId", "==", sessionUser.uid))
      : collections.performance;
    const feesQuery = sessionUser.role === "Intern"
      ? query(collections.fees, where("internId", "==", sessionUser.uid))
      : collections.fees;
    const dailyNotesQuery = sessionUser.role === "Intern"
      ? query(collections.dailyNotes, where("internId", "==", sessionUser.uid))
      : collections.dailyNotes;
    const feedbackQuery = sessionUser.role === "Intern"
      ? query(collections.feedback, where("internId", "==", sessionUser.uid))
      : collections.feedback;
    const mentorFeedbackQuery = sessionUser.role === "Mentor"
      ? query(collections.mentorFeedback, where("mentorId", "==", sessionUser.uid))
      : sessionUser.role === "Intern"
        ? query(collections.mentorFeedback, where("internId", "==", sessionUser.uid))
        : sessionUser.role === "Admin"
          ? collections.mentorFeedback
          : null;
    const doubtsQuery = sessionUser.role === "Intern"
      ? query(collections.doubts, where("internId", "==", sessionUser.uid))
      : collections.doubts;
    const submissionsQuery = sessionUser.role === "Intern"
      ? query(collections.submissions, where("internId", "==", sessionUser.uid))
      : collections.submissions;
    const attendanceQuery = sessionUser.role === "Intern"
      ? query(collections.attendanceSessions, where("internIds", "array-contains", sessionUser.uid))
      : collections.attendanceSessions;

    const unsubscribePerformance = onSnapshot(performanceQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<PerformanceEntry>(docSnapshot));
      setPerformance(sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items);
    });
    const unsubscribeFees = onSnapshot(feesQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<FeeEntry>(docSnapshot));
      setFees(sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items);
    });
    const unsubscribeDailyNotes = onSnapshot(dailyNotesQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...(data as Omit<DailyNoteEntry, "id">),
          date: toIsoDate(data.date),
        };
      });
      const filtered = sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items;
      setDailyNotes(filtered.sort((a, b) => b.date.localeCompare(a.date)));
    });
    const unsubscribeFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<FeedbackEntry>(docSnapshot));
      setFeedback(sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items);
    });
    const unsubscribeMentorFeedback = mentorFeedbackQuery
      ? onSnapshot(mentorFeedbackQuery, (snapshot) => {
        const items = snapshot.docs.map((docSnapshot) => mapDoc<MentorFeedbackEntry>(docSnapshot));
        const filtered = sessionUser.role === "Mentor" 
          ? items.filter((entry) => entry.mentorId === sessionUser.uid)
          : sessionUser.role === "Intern"
            ? items.filter((entry) => entry.internId === sessionUser.uid)
            : items;
        setMentorFeedback(filtered);
      })
      : () => {};
    const unsubscribeDoubts = onSnapshot(doubtsQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...(data as Omit<DoubtEntry, "id">),
          createdAt: toIsoDate(data.createdAt),
        };
      });
      setDoubts(sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items);
    });
    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...(data as Omit<SubmissionEntry, "id">),
          submittedAt: data.submittedAt ? toIsoDate(data.submittedAt) : undefined,
        };
      });
      setSubmissions(sessionUser.role === "Intern" ? items.filter((entry) => entry.internId === sessionUser.uid) : items);
    });
    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        const records = Array.isArray(data.records)
          ? data.records.map((record) => ({
            internId: String(record.internId || ""),
            internName: String(record.internName || ""),
            internEmail: String(record.internEmail || ""),
            status: record.status === "Absent" ? "Absent" : "Present",
            markedAt: toIsoDate(record.markedAt),
          }))
          : [];

        return {
          id: docSnapshot.id,
          mentorId: String(data.mentorId || ""),
          mentorName: String(data.mentorName || ""),
          title: String(data.title || "Session"),
          date: toIsoDate(data.date).slice(0, 10),
          startTime: String(data.startTime || ""),
          notes: data.notes ? String(data.notes) : undefined,
          status: data.status === "Closed" ? "Closed" : "Open",
          createdAt: toIsoDate(data.createdAt),
          updatedAt: data.updatedAt ? toIsoDate(data.updatedAt) : undefined,
          internIds: Array.isArray(data.internIds) ? data.internIds.map((value) => String(value)) : [],
          records,
        } as AttendanceSession;
      });

      const filtered = sessionUser.role === "Intern"
        ? items.filter((session) => session.internIds.includes(sessionUser.uid) || session.internIds.includes(sessionUser.id))
        : items;

      setAttendanceSessions(filtered.sort((a, b) => b.date.localeCompare(a.date)));
    });

    const unsubscribeFeedbackForms = onSnapshot(collections.feedbackForms, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<FeedbackForm>(docSnapshot));
      const filtered = sessionUser.role === "Intern"
        ? items.filter((form) => form.status === "Active" && (!form.targetInternIds || form.targetInternIds.length === 0 || form.targetInternIds.includes(sessionUser.uid)))
        : items;
      setFeedbackForms(filtered);
    });

    const unsubscribeFeedbackFormSubmissions = onSnapshot(collections.feedbackFormSubmissions, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<FeedbackFormSubmission>(docSnapshot));
      const filtered = sessionUser.role === "Intern"
        ? items.filter((submission) => submission.internId === sessionUser.uid)
        : items;
      setFeedbackFormSubmissions(filtered);
    });

    const unsubscribeMentorFeedbackForms = onSnapshot(collections.mentorFeedbackForms, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<MentorFeedbackForm>(docSnapshot));
      const filtered = sessionUser.role === "Intern"
        ? items.filter((form) => form.status === "Active" && (!form.targetInternIds || form.targetInternIds.length === 0 || form.targetInternIds.includes(sessionUser.uid)))
        : items;
      setMentorFeedbackForms(filtered);
    });

    const unsubscribeMentorFeedbackSubmissions = onSnapshot(collections.mentorFeedbackSubmissions, (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDoc<MentorFeedbackSubmission>(docSnapshot));
      const filtered = sessionUser.role === "Intern"
        ? items.filter((submission) => submission.internId === sessionUser.uid)
        : items;
      setMentorFeedbackSubmissions(filtered);
    });

    return () => {
      userUnsubscribe();
      unsubscribePerformance();
      unsubscribeFees();
      unsubscribeDailyNotes();
      unsubscribeFeedback();
      unsubscribeMentorFeedback();
      unsubscribeDoubts();
      unsubscribeSubmissions();
      unsubscribeAttendance();
      unsubscribeFeedbackForms();
      unsubscribeFeedbackFormSubmissions();
      unsubscribeMentorFeedbackForms();
      unsubscribeMentorFeedbackSubmissions();
    };
  }, [sessionUser]);

  const login = useCallback(async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const credentials = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profileSnapshot = await getDoc(doc(db, "users", credentials.user.uid));

    let profile: AuthUserProfile;

    if (!profileSnapshot.exists()) {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      if (adminEmail && normalizedEmail === adminEmail) {
        profile = {
          id: credentials.user.uid,
          uid: credentials.user.uid,
          name: "Admin",
          role: "Admin",
          email: normalizedEmail,
          createdAt: new Date().toISOString(),
          firstLoginAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "users", credentials.user.uid), profile);
      } else {
        await signOut(auth);
        throw new Error("No profile was found for this account. Ask an admin to create your user profile.");
      }
    } else {
      profile = { id: profileSnapshot.id, uid: profileSnapshot.id, ...(profileSnapshot.data() as Omit<AuthUserProfile, "id" | "uid">) };
    }

    const loginStamp = new Date().toISOString();
    await setDoc(doc(db, "users", profile.uid), {
      firstLoginAt: profile.firstLoginAt || loginStamp,
      lastLoginAt: loginStamp,
    }, { merge: true });

    setSessionUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setSessionUser(null);
    setUsers([]);
    setPerformance([]);
    setFees([]);
    setDailyNotes([]);
    setFeedback([]);
    setDoubts([]);
    setSubmissions([]);
    setAttendanceSessions([]);
  }, []);

  const sendWelcomeEmail = useCallback(async (profile: AuthUserProfile, password: string, verificationDetails?: { offerId: string; position: string; issueDate: string; validUntil: string }) => {
    const safeName = profile.name || "there";
    const loginUrl = "https://www.hackmates.tech/login";
    const verifyUrl = "https://www.hackmates.tech/verify";

    const verificationRows = verificationDetails ? `
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Certificate ID</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-family:monospace;font-weight:700;color:#0f766e;">${verificationDetails.offerId}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Position</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${verificationDetails.position}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Issue Date</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${verificationDetails.issueDate}</td></tr>
              ${verificationDetails.validUntil ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Valid Until</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${verificationDetails.validUntil}</td></tr>` : ""}
    ` : "";

    const verificationSection = verificationDetails ? `
            <div style="margin:18px 0;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#166534;">Your Certificate ID</p>
              <p style="margin:0 0 4px;font-size:22px;font-family:monospace;font-weight:700;color:#0f766e;letter-spacing:0.05em;">${verificationDetails.offerId}</p>
              <p style="margin:6px 0 0;font-size:12px;color:#166534;">Use this ID at <a href="${verifyUrl}" style="color:#0f766e;">${verifyUrl}</a> to verify your certificate.</p>
            </div>
    ` : "";

    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
          <div style="padding:20px 24px;background:linear-gradient(135deg,#0f766e,#0f172a);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">HackMates</p>
            <h2 style="margin:8px 0 0;font-size:24px;line-height:1.3;">Welcome to HackMates</h2>
          </div>
          <div style="padding:24px;line-height:1.7;">
            <p style="margin:0 0 10px;">Hi ${safeName},</p>
            <p style="margin:0 0 16px;">Your account has been created for the HackMates platform. Use these credentials to sign in.</p>
            <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Role</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${profile.role}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Email</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${profile.email}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Password</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${password}</td></tr>
              ${verificationRows}
            </table>
            ${verificationSection}
            <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">Open Login Page</a>
            <p style="margin:16px 0 0;font-size:13px;color:#475569;">Security tip: change your password after first sign-in.</p>
            <p style="margin:18px 0 0;">Regards,<br/>HackMates Team</p>
          </div>
        </div>
      </div>
    `;

    await sendPlatformEmail({
      email: profile.email,
      subject: "Welcome to HackMates - Your login credentials",
      message: `Welcome to HackMates. Role: ${profile.role}. Email: ${profile.email}, Password: ${password}${verificationDetails ? `, Certificate ID: ${verificationDetails.offerId}` : ""}, Login URL: ${loginUrl}. Please change your password after first sign-in.`,
      html,
    });
  }, []);

  const createUser = useCallback(async (input: NewUserInput) => {
    const secondaryUser = await createUserWithEmailAndPassword(adminAuth, input.email.trim(), input.password);
    const profile: AuthUserProfile = {
      id: secondaryUser.user.uid,
      uid: secondaryUser.user.uid,
      name: input.name.trim(),
      role: input.role,
      email: input.email.trim().toLowerCase(),
      ...(input.internId?.trim() ? { internId: input.internId.trim().toUpperCase() } : {}),
      ...(input.mentorId?.trim() ? { mentorId: input.mentorId.trim().toUpperCase() } : {}),
      createdAt: new Date().toISOString(),
      firstLoginAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", profile.uid), profile);

    // Auto-create verification record for Intern
    const verificationDetails = (() => {
      const offerId = input.role === "Intern" ? input.internId?.trim().toUpperCase() : input.role === "Mentor" ? input.mentorId?.trim().toUpperCase() : undefined;
      if (!offerId) return undefined;
      return {
        offerId,
        position: input.position?.trim() || (input.role === "Intern" ? "Intern" : "Mentor"),
        issueDate: input.issueDate || new Date().toISOString().slice(0, 10),
        validUntil: input.validUntil || "",
      };
    })();

    if (verificationDetails) {
      await addDoc(collection(db, "verifications"), {
        offerId: verificationDetails.offerId,
        name: profile.name,
        type: input.role === "Mentor" ? "Employee" : "Intern",
        certificateType: "Offer Letter",
        position: verificationDetails.position,
        issueDate: verificationDetails.issueDate,
        validUntil: verificationDetails.validUntil,
        status: "Active",
      });
    }

    let emailFailureReason = "";
    try {
      await sendWelcomeEmail(profile, input.password, verificationDetails);
    } catch (error) {
      emailFailureReason = error instanceof Error ? error.message : "Unknown email service error";
      console.error("Welcome email failed:", error);
    } finally {
      await signOut(adminAuth);
    }

    if (emailFailureReason) {
      throw new Error(`User created, but welcome email failed: ${emailFailureReason}. Check email service config and redeploy Apps Script.`);
    }

    return profile;
  }, [sendWelcomeEmail]);

  const deleteUserAccount = useCallback(async (uid: string) => {
    // Get user profile first to know role and IDs
    const userSnap = await getDoc(doc(db, "users", uid));
    const userData = userSnap.exists() ? userSnap.data() : null;
    const role = userData?.role as string | undefined;
    const internId = userData?.internId as string | undefined;
    const mentorId = userData?.mentorId as string | undefined;

    // Helper: delete all docs matching a query
    const deleteWhere = async (col: string, field: string, value: string) => {
      const snap = await getDocs(query(collection(db, col), where(field, "==", value)));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    };

    if (role === "Intern") {
      await Promise.all([
        deleteWhere("performance", "internId", uid),
        deleteWhere("fees", "internId", uid),
        deleteWhere("dailyNotes", "internId", uid),
        deleteWhere("feedback", "internId", uid),
        deleteWhere("doubts", "internId", uid),
        deleteWhere("submissions", "internId", uid),
        deleteWhere("feedbackFormSubmissions", "internId", uid),
        deleteWhere("mentorFeedbackSubmissions", "internId", uid),
        // Delete verification record by internId
        ...(internId ? [deleteWhere("verifications", "offerId", internId.toUpperCase())] : []),
      ]);
    } else if (role === "Mentor") {
      await Promise.all([
        // Intern ratings submitted about this mentor (by mentorId)
        deleteWhere("mentorFeedbackSubmissions", "mentorId", uid),
        // Mentor's own feedback entries in mentorFeedback collection (by mentorId)
        deleteWhere("mentorFeedback", "mentorId", uid),
        // Attendance sessions created by this mentor (by mentorId)
        deleteWhere("attendanceSessions", "mentorId", uid),
        // Mentor feedback forms created by this mentor (by mentorId)
        deleteWhere("mentorFeedbackForms", "mentorId", uid),
        // Verification record by mentorId
        ...(mentorId ? [deleteWhere("verifications", "offerId", mentorId.toUpperCase())] : []),
      ]);
    }

    // Finally delete the user profile
    await deleteDoc(doc(db, "users", uid));
  }, []);

  const setupAdmin = useCallback(async () => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials not configured in environment.");
    }

    try {
      // Step 1: Create Firebase Auth user
      console.log("Creating Firebase Auth user for admin...");
      const adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✓ Firebase Auth user created:", adminUser.user.uid);

      // Step 2: Create Firestore profile document
      const profile: AuthUserProfile = {
        id: adminUser.user.uid,
        uid: adminUser.user.uid,
        name: "Admin",
        role: "Admin",
        email: adminEmail.toLowerCase(),
        createdAt: new Date().toISOString(),
        firstLoginAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      console.log("Creating Firestore profile document...", profile);
      await setDoc(doc(db, "users", profile.uid), profile);
      console.log("✓ Firestore profile created:", profile.uid);

      // Step 3: Send welcome email (non-blocking)
      try {
        await sendWelcomeEmail(profile, adminPassword);
        console.log("✓ Welcome email sent");
      } catch (error) {
        console.error("Welcome email failed:", error);
      }

      // Step 4: Verify profile exists before returning
      const verifySnapshot = await getDoc(doc(db, "users", profile.uid));
      if (!verifySnapshot.exists()) {
        throw new Error("Profile creation failed: Firestore document not found after creation.");
      }
      console.log("✓ Profile verified in Firestore");

      return profile;
    } catch (error) {
      console.error("setupAdmin error:", error);
      if (error instanceof Error && error.message.includes("auth/email-already-in-use")) {
        throw new Error("Admin account already exists. Try logging in directly.");
      }
      if (error instanceof Error && error.message.includes("permission-denied")) {
        throw new Error("Permission denied. Make sure Firestore rules allow this operation.");
      }
      throw error;
    }
  }, [sendWelcomeEmail]);

  const addDailyNote = useCallback(async (input: NewDailyNoteInput) => {
    const attachments = await encodeAttachments(input.files);
    const payload = {
      internId: input.internId,
      internName: input.internName,
      date: input.date,
      lectureTime: input.lectureTime || "",
      title: input.title.trim(),
      note: input.note.trim(),
      mentorName: input.mentorName,
      attachments,
      createdAt: new Date().toISOString(),
    };

    const result = await addDoc(collections.dailyNotes, payload);
    return { id: result.id, ...payload };
  }, []);

  const addFeedback = useCallback(async (entry: Omit<FeedbackEntry, "id">) => {
    const normalizedRating = Number.isFinite(entry.rating)
      ? Math.max(0, Math.min(10, Number(entry.rating.toFixed(1))))
      : 0;
    const payload = {
      ...entry,
      rating: normalizedRating,
      comment: entry.comment.trim(),
    };

    const result = await addDoc(collections.feedback, payload);
    return { id: result.id, ...payload };
  }, []);

  const addMentorFeedback = useCallback(async (entry: NewMentorFeedbackInput) => {
    const payload = {
      internId: entry.internId,
      internName: entry.internName,
      mentorId: entry.mentorId,
      mentorName: entry.mentorName,
      date: new Date().toISOString().slice(0, 10),
      rating: Number.isFinite(entry.rating) ? Math.max(0, Math.min(10, Number(entry.rating.toFixed(1)))) : 0,
      comment: entry.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const result = await addDoc(collections.mentorFeedback, payload);
    return { id: result.id, ...payload };
  }, []);

  const addPerformance = useCallback(async (entry: NewPerformanceInput) => {
    const payload = {
      internId: entry.internId,
      month: entry.month.trim(),
      score: Math.max(0, Math.min(100, Number(entry.score) || 0)),
      remark: entry.remark.trim(),
    };

    const result = await addDoc(collections.performance, payload);
    return { id: result.id, ...payload };
  }, []);

  const addDoubt = useCallback(async (input: NewDoubtInput) => {
    const payload = {
      internId: input.internId,
      internName: input.internName,
      topic: input.topic.trim(),
      question: input.question.trim(),
      status: "Open" as const,
      createdAt: new Date().toISOString(),
    };

    const result = await addDoc(collections.doubts, payload);
    return { id: result.id, ...payload };
  }, []);

  const answerDoubt = useCallback(async (doubtId: string, answer: string, mentorName: string) => {
    await updateDoc(doc(db, "doubts", doubtId), {
      status: "Answered",
      answer: answer.trim(),
      mentorName,
    });
  }, []);

  const addSubmission = useCallback(async (input: NewSubmissionInput) => {
    const attachments = await encodeAttachments(input.files);
    const enabledFields = normalizeEnabledFields(input.enabledFields);
    const payload = {
      internId: input.internId,
      internName: input.internName,
      title: input.title.trim(),
      submissionTitle: input.submissionTitle?.trim() || "",
      type: input.type.trim(),
      dueDate: input.dueDate,
      lectureDate: input.lectureDate || "",
      lectureTime: input.lectureTime || "",
      generalUrl: input.generalUrl?.trim() || "",
      videoLink: input.videoLink?.trim() || "",
      githubLink: input.githubLink?.trim() || "",
      pptLink: input.pptLink?.trim() || "",
      liveLink: input.liveLink?.trim() || "",
      description: input.description?.trim() || "",
      techStack: input.techStack?.trim() || "",
      enabledFields,
      taskCreatedBy: input.taskCreatedBy || "Intern",
      submittedAt: input.taskCreatedBy === "Mentor" ? "" : new Date().toISOString(),
      status: "Pending" as const,
      attachments,
    };

    const result = await addDoc(collections.submissions, payload);
    return { id: result.id, ...payload };
  }, []);

  const updateSubmissionResponse = useCallback(async (input: UpdateSubmissionResponseInput) => {
    const submissionRef = doc(db, "submissions", input.submissionId);
    const existing = await getDoc(submissionRef);

    if (!existing.exists()) {
      throw new Error("Submission not found.");
    }

    const data = existing.data() as SubmissionEntry;
    const enabled = normalizeEnabledFields(data.enabledFields);
    const attachments = enabled.attachments ? await encodeAttachments(input.files) : [];

    await updateDoc(submissionRef, {
      submissionTitle: enabled.submissionTitle ? (input.submissionTitle?.trim() || "") : "",
      lectureDate: input.lectureDate || "",
      lectureTime: input.lectureTime || "",
      generalUrl: enabled.generalUrl ? (input.generalUrl?.trim() || "") : "",
      videoLink: enabled.videoLink ? (input.videoLink?.trim() || "") : "",
      githubLink: enabled.githubLink ? (input.githubLink?.trim() || "") : "",
      pptLink: enabled.pptLink ? (input.pptLink?.trim() || "") : "",
      liveLink: enabled.liveLink ? (input.liveLink?.trim() || "") : "",
      description: enabled.description ? (input.description?.trim() || "") : "",
      techStack: enabled.techStack ? (input.techStack?.trim() || "") : "",
      attachments,
      submittedAt: new Date().toISOString(),
      status: "Pending",
    });
  }, []);

  const reviewSubmission = useCallback(async (
    submissionId: string,
    feedbackText: string,
    status: SubmissionEntry["status"],
    mentorName: string,
    internEmail?: string,
    internName?: string,
    submissionTitle?: string,
  ) => {
    await updateDoc(doc(db, "submissions", submissionId), {
      feedback: feedbackText.trim(),
      status,
      mentorName,
    });

    // Send email notification to intern
    if (internEmail) {
      const isApproved = status === "Approved";
      try {
        await sendPlatformEmail({
          email: internEmail,
          subject: `Your submission has been ${status} — HackMates`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
              <h2 style="color:${isApproved ? "#4ade80" : "#f87171"};margin-bottom:8px;">
                Submission ${status}
              </h2>
              <p style="color:#94a3b8;margin-bottom:16px;">Hi ${internName || "there"},</p>
              <p>Your submission <strong style="color:#fff;">${submissionTitle || "your task"}</strong> has been <strong style="color:${isApproved ? "#4ade80" : "#f87171"};">${status.toLowerCase()}</strong> by ${mentorName}.</p>
              ${feedbackText ? `<div style="margin-top:16px;padding:12px 16px;background:#1e293b;border-left:3px solid ${isApproved ? "#4ade80" : "#f87171"};border-radius:4px;">
                <p style="margin:0;font-size:14px;color:#cbd5e1;">${feedbackText}</p>
              </div>` : ""}
              <p style="margin-top:24px;font-size:12px;color:#475569;">— HackMates Platform</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Submission review email failed:", emailErr);
      }
    }
  }, []);

  const upsertInternFee = useCallback(async (input: UpdateInternFeeInput) => {
    const normalizedAmount = Math.max(0, Number(input.amount) || 0);
    const normalizedPaid = Math.max(0, Number(input.paidAmount) || 0);
    const payload = {
      internId: input.internId,
      label: input.label.trim() || "Internship Fee",
      amount: normalizedAmount,
      paidAmount: normalizedPaid,
      status: normalizedPaid >= normalizedAmount ? "Paid" as const : "Pending" as const,
      dueDate: input.dueDate || "",
    };

    const existing = fees.find((entry) => entry.internId === input.internId);
    if (existing) {
      await updateDoc(doc(db, "fees", existing.id), payload);
      return { id: existing.id, ...payload };
    }

    const created = await addDoc(collections.fees, payload);
    return { id: created.id, ...payload };
  }, [fees]);

  const createAttendanceSession = useCallback(async (input: NewAttendanceSessionInput) => {
    const payload = {
      mentorId: input.mentorId,
      mentorName: input.mentorName,
      title: input.title.trim(),
      date: input.date,
      startTime: input.startTime,
      notes: input.notes?.trim() || "",
      status: "Open" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internIds: [] as string[],
      records: [] as AttendanceRecord[],
    };

    const result = await addDoc(collections.attendanceSessions, payload);
    return {
      id: result.id,
      ...payload,
    };
  }, []);

  const markAttendance = useCallback(async (input: MarkAttendanceInput) => {
    const sessionRef = doc(db, "attendanceSessions", input.sessionId);
    const sessionSnapshot = await getDoc(sessionRef);

    if (!sessionSnapshot.exists()) {
      throw new Error("Attendance session not found.");
    }

    const data = sessionSnapshot.data() as {
      title?: string;
      date?: string;
      startTime?: string;
      records?: AttendanceRecord[];
      internIds?: string[];
      status?: string;
    };

    if (data.status === "Closed") {
      throw new Error("Attendance session is closed.");
    }

    const records = Array.isArray(data.records) ? [...data.records] : [];
    const recordIndex = records.findIndex((record) => record.internId === input.internId);
    const updatedRecord: AttendanceRecord = {
      internId: input.internId,
      internName: input.internName,
      internEmail: input.internEmail,
      status: input.status,
      markedAt: new Date().toISOString(),
    };

    if (recordIndex === -1) {
      records.push(updatedRecord);
    } else {
      records[recordIndex] = updatedRecord;
    }

    const internIds = Array.isArray(data.internIds)
      ? Array.from(new Set([...data.internIds, input.internId]))
      : [input.internId];

    await updateDoc(sessionRef, {
      records,
      internIds,
      updatedAt: new Date().toISOString(),
    });

    const sessionDate = typeof data.date === "string" ? data.date : new Date().toISOString().slice(0, 10);
    const sessionTime = typeof data.startTime === "string" ? data.startTime : "";
    const sessionTitle = typeof data.title === "string" ? data.title : "Lecture Session";
    const loginUrl = "https://www.hackmates.tech/login";

    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
          <div style="padding:20px 24px;background:linear-gradient(135deg,#0f766e,#1d4ed8);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">HackMates</p>
            <h2 style="margin:8px 0 0;font-size:24px;line-height:1.3;">Attendance Update</h2>
          </div>
          <div style="padding:24px;line-height:1.7;">
            <p style="margin:0 0 10px;">Hi ${input.internName},</p>
            <p style="margin:0 0 16px;">Your attendance has been marked for today&apos;s lecture session.</p>
            <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Session</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionTitle}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Date</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionDate}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Time</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionTime || "-"}</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Status</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${input.status}</td></tr>
            </table>
            <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">Open Dashboard</a>
            <p style="margin:18px 0 0;">Regards,<br/>HackMates Team</p>
          </div>
        </div>
      </div>
    `;

    try {
      await sendPlatformEmail({
        email: input.internEmail,
        subject: `Attendance ${input.status} - ${sessionTitle}`,
        message: `Your attendance is marked as ${input.status} for ${sessionTitle} on ${sessionDate} at ${sessionTime || "-"}. Login URL: ${loginUrl}`,
        html,
      });
    } catch (error) {
      console.error("Attendance email failed:", error);
    }
  }, []);

  const updateAttendanceSession = useCallback(async (input: UpdateAttendanceSessionInput) => {
    await updateDoc(doc(db, "attendanceSessions", input.sessionId), {
      title: input.title.trim(),
      date: input.date,
      startTime: input.startTime,
      notes: input.notes?.trim() || "",
      ...(input.records ? { records: input.records } : {}),
      ...(input.internIds ? { internIds: input.internIds } : {}),
      ...(input.status ? { status: input.status } : {}),
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const deleteAttendanceSession = useCallback(async (sessionId: string) => {
    await deleteDoc(doc(db, "attendanceSessions", sessionId));
  }, []);

  const createFeedbackForm = useCallback(async (input: NewFeedbackFormInput) => {
    if (!sessionUser) throw new Error("Not authenticated");
    const payload = {
      title: input.title.trim(),
      description: input.description.trim(),
      fields: input.fields,
      createdBy: sessionUser.uid,
      createdByName: sessionUser.name,
      status: "Active" as const,
      targetInternIds: input.targetInternIds || [],
      createdAt: new Date().toISOString(),
    };
    const result = await addDoc(collections.feedbackForms, payload);
    return { id: result.id, ...payload } as FeedbackForm;
  }, [sessionUser]);

  const updateFeedbackFormStatus = useCallback(async (formId: string, status: "Active" | "Closed") => {
    await updateDoc(doc(db, "feedbackForms", formId), { status });
  }, []);

  const submitFeedbackForm = useCallback(async (input: NewFeedbackFormSubmissionInput) => {
    const payload = {
      formId: input.formId,
      formTitle: input.formTitle || "",
      internId: input.internId,
      internName: input.internName,
      internEmail: input.internEmail,
      responses: input.responses,
      status: "Submitted" as const,
      submittedAt: new Date().toISOString(),
    };
    const result = await addDoc(collections.feedbackFormSubmissions, payload);
    return { id: result.id, ...payload } as FeedbackFormSubmission;
  }, []);

  const reviewFeedbackFormSubmission = useCallback(async (input: ReviewFeedbackFormSubmissionInput) => {
    // Update submission status in Firestore
    const docRef = doc(db, "feedbackFormSubmissions", input.submissionId);
    await updateDoc(docRef, {
      status: input.status,
      adminReview: input.adminReview,
      approvedBy: input.approvedBy,
      reviewedAt: new Date().toISOString(),
    });

    // Fetch submission details to get intern email and form title
    const submissionDoc = await getDoc(docRef);
    if (submissionDoc.exists()) {
      const submission = submissionDoc.data();
      
      // Send email notification
      try {
        const response = await fetch(
          'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent', // Replace with your Apps Script URL
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'feedback-form-status',
              email: submission.internEmail,
              internName: submission.internName,
              formTitle: submission.formTitle,
              status: input.status,
              adminReview: input.adminReview,
              approvedBy: input.approvedBy,
            }),
          }
        );

        if (!response.ok) {
          console.warn('Email notification failed but submission was updated:', await response.text());
        }
      } catch (emailError) {
        console.warn('Failed to send email notification:', emailError);
        // Don't throw - the main update succeeded
      }
    }
  }, []);

  /**
   * Helper function to send email via Google Apps Script
   */
  const sendEmailNotification = useCallback(async (type: string, data: Record<string, unknown>) => {
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent'; // Replace with your Apps Script URL
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      });
      if (!response.ok) {
        console.warn(`Email notification (${type}) failed:`, await response.text());
      }
      return response.ok;
    } catch (error) {
      console.warn(`Failed to send email notification (${type}):`, error);
      return false;
    }
  }, []);

  /**
   * Send attendance notification email
   */
  const sendAttendanceNotificationEmail = useCallback(async (
    email: string,
    internName: string,
    sessionTitle: string,
    date: string,
    status: "Present" | "Absent"
  ) => {
    return sendEmailNotification("attendance", {
      email,
      internName,
      sessionTitle,
      date,
      status,
    });
  }, [sendEmailNotification]);

  /**
   * Send welcome email
   */
  const sendWelcomeNotificationEmail = useCallback(async (
    email: string,
    internName: string,
    programName?: string
  ) => {
    return sendEmailNotification("welcome", {
      email,
      internName,
      programName,
    });
  }, [sendEmailNotification]);

  /**
   * Create mentor feedback form
   */
  const createMentorFeedbackForm = useCallback(async (input: NewMentorFeedbackFormInput) => {
    const payload = {
      mentorIds: input.mentorIds,
      mentorNames: input.mentorNames,
      status: "Active" as const,
      targetInternIds: input.targetInternIds || [],
      createdBy: sessionUser?.uid || "",
      createdByName: sessionUser?.name || "Admin",
      createdAt: new Date().toISOString(),
    };
    const result = await addDoc(collections.mentorFeedbackForms, payload);
    return { id: result.id, ...payload } as MentorFeedbackForm;
  }, [sessionUser]);

  /**
   * Update mentor feedback form status
   */
  const updateMentorFeedbackFormStatus = useCallback(async (formId: string, status: "Active" | "Closed") => {
    await updateDoc(doc(db, "mentorFeedbackForms", formId), { status });
  }, []);

  /**
   * Submit mentor feedback form
   */
  const submitMentorFeedbackForm = useCallback(async (input: NewMentorFeedbackSubmissionInput) => {
    const payload = {
      formId: input.formId,
      mentorId: input.mentorId,
      mentorName: input.mentorName,
      internId: input.internId,
      internName: input.internName,
      internEmail: input.internEmail,
      rating: input.rating,
      review: input.review,
      submittedAt: new Date().toISOString(),
    };
    const result = await addDoc(collections.mentorFeedbackSubmissions, payload);
    
    // Auto-update performance rating based on mentor feedback
    try {
      const performanceRef = doc(db, "performance", input.internId);
      const performanceDoc = await getDoc(performanceRef);
      
      if (performanceDoc.exists()) {
        const currentData = performanceDoc.data();
        const currentRating = currentData.weeklyAverageRating || 0;
        const newRating = (currentRating + input.rating) / 2; // Average with new rating
        
        await updateDoc(performanceRef, {
          weeklyAverageRating: newRating,
          monthlyAverageRating: currentData.monthlyAverageRating || newRating,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn("Failed to update performance with mentor feedback:", error);
    }

    return { id: result.id, ...payload } as MentorFeedbackSubmission;
  }, []);

  const adminStats = useMemo(() => ({
    users: users.length,
    interns: users.filter((user) => user.role === "Intern").length,
    mentors: users.filter((user) => user.role === "Mentor").length,
    openDoubts: doubts.filter((doubt) => doubt.status === "Open").length,
    pendingSubmissions: submissions.filter((submission) => submission.status === "Pending").length,
  }), [doubts, submissions, users]);

  const internData = useMemo(() => {
    if (!sessionUser) {
      return { performance: [], fees: [], dailyNotes: [], feedback: [], doubts: [], submissions: [], attendance: [], feedbackForms: [], feedbackFormSubmissions: [], mentorFeedbackForms: [], mentorFeedbackSubmissions: [] };
    }

    const attendance = attendanceSessions.flatMap((session) => {
      const record = session.records.find((item) => item.internId === sessionUser.uid || item.internId === sessionUser.id);
      if (!record) {
        return [];
      }

      return [{
        sessionId: session.id,
        sessionTitle: session.title,
        mentorName: session.mentorName,
        date: session.date,
        startTime: session.startTime,
        status: record.status,
        markedAt: record.markedAt,
      }];
    });

    return {
      performance: performance.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      fees: fees.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      dailyNotes: dailyNotes.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      feedback: feedback.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      doubts: doubts.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      submissions: submissions.filter((entry) => entry.internId === sessionUser.uid || entry.internId === sessionUser.id),
      attendance,
      feedbackForms,
      feedbackFormSubmissions,
      mentorFeedbackForms,
      mentorFeedbackSubmissions,
    };
  }, [attendanceSessions, dailyNotes, feedback, fees, performance, sessionUser, doubts, submissions, feedbackForms, feedbackFormSubmissions, mentorFeedbackForms, mentorFeedbackSubmissions]);

  const mentorData = useMemo(() => ({
    internCount: users.filter((user) => user.role === "Intern").length,
    doubts,
    feedback,
    dailyNotes,
    submissions,
    performance,
    fees,
    attendanceSessions,
    feedbackFormSubmissions,
  }), [attendanceSessions, dailyNotes, feedback, fees, performance, doubts, submissions, users, feedbackFormSubmissions]);

  const value = useMemo<PlatformContextValue>(() => ({
    loading,
    sessionUser,
    users,
    performance,
    fees,
    dailyNotes,
    feedback,
    mentorFeedback,
    doubts,
    submissions,
    attendanceSessions,
    feedbackForms,
    feedbackFormSubmissions,
    mentorFeedbackForms,
    mentorFeedbackSubmissions,
    adminStats,
    internData,
    mentorData,
    login,
    logout,
    refresh,
    createUser,
    deleteUserAccount,
    setupAdmin,
    addDailyNote,
    addFeedback,
    addMentorFeedback,
    addPerformance,
    addDoubt,
    answerDoubt,
    addSubmission,
    updateSubmissionResponse,
    reviewSubmission,
    upsertInternFee,
    createAttendanceSession,
    markAttendance,
    updateAttendanceSession,
    deleteAttendanceSession,
    createFeedbackForm,
    updateFeedbackFormStatus,
    submitFeedbackForm,
    reviewFeedbackFormSubmission,
    createMentorFeedbackForm,
    updateMentorFeedbackFormStatus,
    submitMentorFeedbackForm,
  }), [
    addDailyNote,
    addDoubt,
    addFeedback,
    addMentorFeedback,
    addPerformance,
    addSubmission,
    adminStats,
    answerDoubt,
    attendanceSessions,
    createAttendanceSession,
    createUser,
    deleteUserAccount,
    setupAdmin,
    dailyNotes,
    deleteAttendanceSession,
    doubts,
    feedback,
    fees,
    internData,
    loading,
    login,
    createFeedbackForm,
    updateFeedbackFormStatus,
    submitFeedbackForm,
    reviewFeedbackFormSubmission,
    createMentorFeedbackForm,
    updateMentorFeedbackFormStatus,
    submitMentorFeedbackForm,
    logout,
    mentorData,
    mentorFeedback,
    mentorFeedbackForms,
    mentorFeedbackSubmissions,
    performance,
    refresh,
    markAttendance,
    reviewSubmission,
    upsertInternFee,
    updateSubmissionResponse,
    sessionUser,
    submissions,
    updateAttendanceSession,
    users,
    feedbackForms,
    feedbackFormSubmissions,
  ]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }

  return context;
}
