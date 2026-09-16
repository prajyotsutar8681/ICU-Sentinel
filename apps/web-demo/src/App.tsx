import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bed,
  Bell,
  ChevronRight,
  Clock3,
  Droplets,
  HeartPulse,
  LogOut,
  Menu,
  Thermometer,
  UserRound,
  Wind,
  X,
} from 'lucide-react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import './index.css';
import {
  API_BASE_URL,
  getLatestVital,
  getVitalHistory,
  type Vital,
} from './services/api';
import socketService from './services/socket';

/* =========================================================
   LOGIN
========================================================= */

function LoginScreen() {
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!API_BASE_URL) return;

    fetch(`${API_BASE_URL}/hospitals`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('✅ ICU Sentinel backend connected:', data);
      })
      .catch(error => {
        console.warn(
          'ℹ️ Backend unavailable — Demo Mode will be used.',
          error,
        );
      });
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="app-shell">
      <div className="login-container">

        <div className="brand-section">
          <div className="brand-logo">
            <Activity size={32} strokeWidth={2.5} />
          </div>

          <h1>ICU Sentinel</h1>

          <p>Real-time ICU patient monitoring</p>
        </div>

        <div className="login-card">

          <div className="login-heading">
            <h2>Doctor Sign In</h2>
            <p>Access your ICU monitoring dashboard</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label htmlFor="doctorId">
                Doctor ID
              </label>

              <div className="input-wrapper">
                <UserRound size={19} />

                <input
                  id="doctorId"
                  type="text"
                  placeholder="Enter your Doctor ID"
                  value={doctorId}
                  onChange={(event) =>
                    setDoctorId(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <UserRound size={19} />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="forgot-password">
              <button type="button">
                Forgot password?
              </button>
            </div>

            <button
              className="sign-in-button"
              type="submit"
            >
              Sign In
            </button>

          </form>

          <div className="demo-notice">
            <span className="demo-dot" />
            <span>Demo Environment</span>
          </div>

        </div>

        <div className="login-footer">
          <p>Authorized hospital personnel only</p>
          <span>ICU Sentinel • Demo</span>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   VITAL CARD
========================================================= */

type VitalCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
};

function VitalCard({
  icon,
  label,
  value,
  unit,
}: VitalCardProps) {
  return (
    <div className="vital-card">

      <div className="vital-icon">
        {icon}
      </div>

      <div className="vital-info">
        <span className="vital-label">
          {label}
        </span>

        <div className="vital-value-row">
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>
      </div>

    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function DashboardScreen() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const openPatient = () => {
    navigate('/patient/P0001');
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="header-left">

          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="mini-logo">
            <Activity size={20} />
          </div>

          <div>
            <h1>ICU Sentinel</h1>
            <span>Doctor Dashboard</span>
          </div>

        </div>

        <div className="header-right">

          <button className="notification-button">
            <Bell size={20} />

            <span className="notification-badge">
              1
            </span>
          </button>

          <div className="doctor-avatar">
            DR
          </div>

        </div>

      </header>


      {/* SIDE DRAWER */}

      {menuOpen && (
        <>

          <div
            className="drawer-overlay"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="side-drawer">

            <div className="drawer-header">

              <div>
                <strong>ICU Sentinel</strong>
                <span>Demo Hospital</span>
              </div>

              <button
                className="icon-button"
                onClick={() => setMenuOpen(false)}
              >
                <X size={21} />
              </button>

            </div>

            <div className="drawer-links">

              <button className="drawer-link active">
                <Activity size={19} />
                Dashboard
              </button>

              <button className="drawer-link">
                <Bell size={19} />
                Alerts
                <span className="drawer-count">
                  1
                </span>
              </button>

              <button className="drawer-link">
                <UserRound size={19} />
                Patients
              </button>

              <button className="drawer-link">
                <Bed size={19} />
                ICU Beds
              </button>

            </div>

            <button
              className="drawer-logout"
              onClick={() => navigate('/')}
            >
              <LogOut size={18} />
              Sign Out
            </button>

          </aside>

        </>
      )}


      {/* MAIN */}

      <main className="dashboard-main">

        {/* PAGE TITLE */}

        <section className="dashboard-intro">

          <div>
            <span className="eyebrow">
              DEMO HOSPITAL
            </span>

            <h2>ICU Overview</h2>

            <p>
              Main Intensive Care Unit
            </p>
          </div>

          <div className="live-indicator">
            <span />
            LIVE
          </div>

        </section>


        {/* ICU SUMMARY */}

        <section className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">
              <Bed size={20} />
            </div>

            <div>
              <span>Occupied Beds</span>
              <strong>1 / 3</strong>
            </div>

          </div>


          <div className="summary-card alert-summary">

            <div className="summary-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Active Alerts</span>
              <strong>1</strong>
            </div>

          </div>

        </section>


        {/* ICU SECTION */}

        <section className="icu-section">

          <div className="section-heading">

            <div>
              <h3>Main Intensive Care Unit</h3>
              <span>ICU-01</span>
            </div>

            <span className="bed-status">
              1 Active Patient
            </span>

          </div>


          {/* PATIENT CARD */}

          <button
            className="patient-card"
            onClick={openPatient}
          >

            <div className="patient-top">

              <div className="patient-identity">

                <div className="patient-avatar">
                  DP
                </div>

                <div>
                  <strong>
                    Demo Patient
                  </strong>

                  <span>
                    Patient ID: P0001
                  </span>
                </div>

              </div>

              <div className="bed-label">
                <Bed size={16} />
                B01
              </div>

            </div>


            <div className="patient-live-row">

              <span className="patient-live-dot" />

              <span>
                Monitoring active
              </span>

              <ChevronRight size={18} />

            </div>


            {/* VITALS */}

            <div className="vitals-grid">

              <VitalCard
                icon={
                  <HeartPulse size={19} />
                }
                label="Heart Rate"
                value="85"
                unit="bpm"
              />

              <VitalCard
                icon={
                  <Activity size={19} />
                }
                label="SpO₂"
                value="100"
                unit="%"
              />

              <VitalCard
                icon={
                  <HeartPulse size={19} />
                }
                label="Blood Pressure"
                value="121/70"
                unit="mmHg"
              />

              <VitalCard
                icon={
                  <Thermometer size={19} />
                }
                label="Temperature"
                value="37.1"
                unit="°C"
              />

            </div>

          </button>


          {/* AVAILABLE BED */}

          <div className="available-bed">

            <div className="available-bed-icon">
              <Bed size={19} />
            </div>

            <div>
              <strong>B02</strong>
              <span>Available</span>
            </div>

            <span className="available-status">
              AVAILABLE
            </span>

          </div>


          <div className="available-bed">

            <div className="available-bed-icon">
              <Bed size={19} />
            </div>

            <div>
              <strong>B03</strong>
              <span>Available</span>
            </div>

            <span className="available-status">
              AVAILABLE
            </span>

          </div>

        </section>


        {/* ALERT */}

        <section className="dashboard-alert">

          <div className="alert-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="alert-content">

            <div className="alert-title-row">

              <strong>
                Active Alert
              </strong>

              <span className="critical-label">
                CRITICAL
              </span>

            </div>

            <p>
              Demo Patient — SpO₂ is below
              the configured threshold.
            </p>

            <span>
              Tap the patient to view details
            </span>

          </div>

          <ChevronRight size={19} />

        </section>


        {/* FOOTER INFO */}

        <div className="dashboard-footer">

          <Wind size={15} />

          <span>
            ICU monitoring system • Demo data
          </span>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   PATIENT DETAIL
========================================================= */

type PatientVitalProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
};

function PatientVital({
  icon,
  label,
  value,
  unit,
}: PatientVitalProps) {
  return (
    <div className="patient-vital">

      <div className="patient-vital-icon">
        {icon}
      </div>

      <div className="patient-vital-content">

        <span>{label}</span>

        <div>
          <strong>{value}</strong>
          <small>{unit}</small>
        </div>

      </div>

    </div>
  );
}


function VitalTrendChart({
  history,
}: {
  history: Vital[];
}) {
  const values = history
    .map(vital => Number(vital.heartRate))
    .filter(value => Number.isFinite(value))
    .slice()
    .reverse();

  const chartValues =
    values.length >= 2
      ? values.slice(-24)
      : [
        82,
        78,
        80,
        84,
        81,
        79,
        83,
        86,
        85,
        88,
        84,
        85,
      ];

  const min = Math.min(50, ...chartValues);
  const max = Math.max(120, ...chartValues);
  const range = Math.max(1, max - min);

  const points = chartValues
    .map((value, index) => {
      const x =
        chartValues.length === 1
          ? 150
          : (index / (chartValues.length - 1)) * 300;

      const y = 92 - ((value - min) / range) * 80;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const last =
    points.split(' ').at(-1)?.split(',') ?? ['300', '66'];

  return (
    <div className="trend-chart">
      <div className="chart-y-axis">
        <span>120</span>
        <span>100</span>
        <span>80</span>
        <span>60</span>
      </div>

      <div className="chart-area">
        <div className="chart-grid-line line-1" />
        <div className="chart-grid-line line-2" />
        <div className="chart-grid-line line-3" />
        <div className="chart-grid-line line-4" />

        <svg
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          className="trend-svg"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx={last[0]}
            cy={last[1]}
            r="4"
            fill="currentColor"
          />
        </svg>

        <div className="chart-x-axis">
          <span>Older</span>
          <span>Recent</span>
        </div>
      </div>
    </div>
  );
}

function createDemoVital(patientId: string): Vital {
  return {
    id: `demo-${Date.now()}`,
    patientId,
    heartRate: 85,
    systolicBP: 121,
    diastolicBP: 70,
    spo2: 100,
    temperature: 37.1,
    respiratoryRate: 17,
    glucose: 108,
    recordedAt: new Date().toISOString(),
  };
}

function createDemoHistory(
  patientId: string,
  hours: number,
): Vital[] {
  const points = Math.min(Math.max(hours * 4, 8), 48);

  const values = [
    82,
    78,
    80,
    84,
    81,
    79,
    83,
    86,
    85,
    88,
    84,
    85,
  ];

  return Array.from({ length: points }, (_, index) => {
    const value = values[index % values.length];

    const recordedAt = new Date(
      Date.now() -
      (points - index) * 5 * 60 * 1000,
    ).toISOString();

    return {
      id: `demo-history-${hours}-${index}`,
      patientId,
      heartRate: value,
      systolicBP: 121,
      diastolicBP: 70,
      spo2: 99,
      temperature: 37.0,
      respiratoryRate: 17,
      glucose: 108,
      recordedAt,
    };
  });
}



type Doctor = {
  id: string;
  employeeId?: string | null;
  name: string;
  email?: string | null;
  role?: string | null;
};

type Patient = {
  id: string;
  patientNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  status?: string | null;
  admissionAt?: string | null;
  admissionDate?: string | null;
  dischargeAt?: string | null;
  dischargeDate?: string | null;
  admissionReason?: string | null;
  currentCondition?: string | null;
  hospital?: {
    id?: string;
    name?: string;
    code?: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  bed?: {
    id?: string;
    bedNumber?: string;
    status?: string;
    icu?: {
      id?: string;
      name?: string;
      code?: string;
      floor?: string | null;
      description?: string | null;
    } | null;
  } | null;
  icu?: unknown;
  assignments?: unknown[];
  admissions?: unknown[];
  diagnoses?: unknown[];
  diagnosis?: unknown;
  medicalHistories?: unknown[];
  medicalHistory?: unknown;
  allergies?: unknown[];
  medications?: unknown[];
  labResults?: unknown[];
  labs?: unknown;
  laboratoryResults?: unknown;
  procedures?: unknown[];
  clinicalNotes?: unknown[];
  notes?: unknown;
  referrals?: unknown[];
  events?: unknown[];
  patientEvents?: unknown[];
  latestVital?: Vital | null;
  age?: number | null;
  [key: string]: unknown;
};

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, value => value.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (
      value.includes('T') &&
      !Number.isNaN(parsed) &&
      value.length >= 16
    ) {
      return new Date(value).toLocaleString();
    }
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(formatValue).join(' • ') : 'No records';
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${formatLabel(key)}: ${formatValue(item)}`)
      .join(' • ');
  }

  return String(value);
}

function PatientDataSection({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle?: string;
  data: unknown;
}) {
  if (data === null || data === undefined) return null;

  const entries = Array.isArray(data)
    ? data.map((item, index) => [`Record ${index + 1}`, item] as const)
    : typeof data === 'object'
      ? Object.entries(data as Record<string, unknown>)
      : [['Information', data] as const];

  return (
    <section className="patient-section">
      <div className="patient-section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>

      <div className="clinical-grid">
        {entries.length === 0 ? (
          <div className="clinical-item">
            <span>Information</span>
            <strong>No records available</strong>
          </div>
        ) : (
          entries.map(([key, value], index) => (
            <div className="clinical-item" key={`${key}-${index}`}>
              <span>{Array.isArray(data) ? key : formatLabel(key)}</span>
              <strong>{formatValue(value)}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function getPatientDisplayName(patient: Patient | null) {
  if (!patient) return 'Demo Patient';

  if (patient.name) return patient.name;

  const fullName = [patient.firstName, patient.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || 'Demo Patient';
}

function getPatientNumber(patient: Patient | null) {
  return patient?.patientNumber || 'P0001';
}

function getPatientField(
  patient: Patient | null,
  ...keys: string[]
): unknown {
  if (!patient) return undefined;

  for (const key of keys) {
    if (patient[key] !== undefined && patient[key] !== null) {
      return patient[key];
    }
  }

  return undefined;
}

function PatientDetailScreen() {
  const navigate = useNavigate();
  const { patientId = '' } =
    useParams<{ patientId: string }>();

  const [timeRange, setTimeRange] = useState('1H');
  const [liveVital, setLiveVital] = useState<Vital | null>(null);
  const [vitalHistory, setVitalHistory] = useState<Vital[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(
    API_BASE_URL ? 'Connecting' : 'DEMO',
  );
  const [demoMode, setDemoMode] = useState(!API_BASE_URL);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPatient() {
      try {
        setLoadingPatient(true);

        if (!API_BASE_URL || !patientId) {
          if (!mounted) return;
          setPatient({
            id: patientId,
            patientNumber: 'P0001',
            firstName: 'Demo',
            lastName: 'Patient',
            status: 'ACTIVE',
            gender: 'Not specified',
            age: 45,
            bloodGroup: 'O+',
            dateOfBirth: '1985-05-15',
            gender: 'Male',
            phone: '+91-9000000001',
            email: 'demo.patient@example.local',
            address: 'Pune, Maharashtra',
            emergencyContactName: 'Demo Patient Family',
            emergencyContactPhone: '+91-9000000002',
            emergencyContactRelation: 'Spouse',
            admissionAt: '2026-09-08T09:30:00',
            admissionReason: 'Acute respiratory distress requiring intensive monitoring',
            currentCondition: 'Hemodynamically stable under ICU observation',
            hospital: { name: 'ICU Sentinel Demo Hospital', code: 'DEMO-01', city: 'Pune', state: 'Maharashtra', country: 'India' },
            bed: { bedNumber: 'B01', status: 'OCCUPIED', icu: { name: 'Main Intensive Care Unit', code: 'ICU-01', floor: '1', description: 'Primary adult intensive care unit' } },
            diagnoses: [
              { diagnosis: 'Acute respiratory distress', type: 'PRIMARY', diagnosedAt: '2026-09-08T10:15:00', notes: 'Primary ICU admission diagnosis requiring continuous respiratory and hemodynamic monitoring.' },
              { diagnosis: 'Community-acquired pneumonia', type: 'SECONDARY', diagnosedAt: '2026-09-08T11:00:00', notes: 'Suspected lower respiratory tract infection based on clinical presentation.' },
            ],
            medicalHistories: [
              { condition: 'Hypertension', description: 'History of controlled hypertension.', diagnosedAt: '2020-06-15' },
              { condition: 'Type 2 Diabetes Mellitus', description: 'Previously diagnosed type 2 diabetes under outpatient management.', diagnosedAt: '2021-03-10' },
            ],
            allergies: [
              { allergen: 'Penicillin', reaction: 'Skin rash', severity: 'MODERATE', notes: 'Avoid penicillin-class antibiotics unless specifically reviewed by treating team.' },
            ],
            medications: [
              { medicineName: 'Ceftriaxone', dose: '1', unit: 'g', route: 'IV', frequency: 'Every 12 hours', startDate: '2026-09-08T12:00:00', status: 'ACTIVE', instructions: 'Administer as prescribed and monitor for adverse reactions.' },
              { medicineName: 'Paracetamol', dose: '650', unit: 'mg', route: 'Oral', frequency: 'Every 6 hours as needed', startDate: '2026-09-08T12:00:00', status: 'ACTIVE', instructions: 'Use for fever or discomfort as clinically indicated.' },
              { medicineName: 'Pantoprazole', dose: '40', unit: 'mg', route: 'IV', frequency: 'Once daily', startDate: '2026-09-08T12:00:00', status: 'ACTIVE', instructions: 'Administer before breakfast or according to ICU protocol.' },
              { medicineName: 'Insulin', dose: 'Sliding scale', unit: 'units', route: 'Subcutaneous', frequency: 'As per glucose monitoring', startDate: '2026-09-08T13:00:00', status: 'ACTIVE', instructions: 'Adjust according to bedside glucose measurements and clinical orders.' },
            ],
            labResults: [
              { testName: 'Platelet Count', result: '245', unit: '10³/µL', referenceRange: '150 - 450 10³/µL', performedAt: '2026-09-10T06:30:00', notes: 'Within expected range.' },
              { testName: 'Creatinine', result: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.3 mg/dL', performedAt: '2026-09-10T06:45:00', notes: 'Renal function currently stable.' },
              { testName: 'Blood Glucose', result: '142', unit: 'mg/dL', referenceRange: '70 - 140 mg/dL', performedAt: '2026-09-10T07:00:00', notes: 'Slightly elevated; continue ICU glucose monitoring.' },
            ],
            procedures: [
              { procedureName: 'Arterial Blood Gas Analysis', performedAt: '2026-09-08T14:00:00', notes: 'Performed for respiratory status assessment.' },
              { procedureName: 'Chest X-Ray', performedAt: '2026-09-08T15:30:00', notes: 'Portable chest imaging performed for respiratory evaluation.' },
            ],
            clinicalNotes: [
              { note: 'Patient remains hemodynamically stable under continuous ICU monitoring. Respiratory status is being monitored closely. Continue current treatment plan and review laboratory results as available.', createdAt: '2026-09-10T09:00:00' },
            ],
            referrals: [
              { referringDoctor: 'Dr. Referral Physician', referringHospital: 'Demo City General Hospital', department: 'Emergency Medicine', referralDate: '2026-09-08T08:45:00', reason: 'Escalation of care for continuous ICU monitoring.', notes: 'Patient transferred to ICU Sentinel Demo Hospital for intensive monitoring and management.' },
            ],
            events: [
              { type: 'ADMISSION', title: 'ICU Admission', description: 'Patient admitted to Main Intensive Care Unit, Bed B01.', occurredAt: '2026-09-08T09:30:00' },
              { type: 'DIAGNOSIS', title: 'Primary Diagnosis Recorded', description: 'Acute respiratory distress recorded as the primary ICU diagnosis.', occurredAt: '2026-09-08T10:15:00' },
              { type: 'PROCEDURE', title: 'Arterial Blood Gas Analysis', description: 'ABG performed for respiratory status assessment.', occurredAt: '2026-09-08T14:00:00' },
              { type: 'PROCEDURE', title: 'Chest X-Ray', description: 'Portable chest X-ray performed.', occurredAt: '2026-09-08T15:30:00' },
              { type: 'MEDICATION', title: 'Medication Plan Initiated', description: 'Initial ICU medication regimen initiated.', occurredAt: '2026-09-08T12:00:00' },
              { type: 'LAB', title: 'Morning Laboratory Panel', description: 'Routine ICU laboratory investigations completed.', occurredAt: '2026-09-10T07:00:00' },
              { type: 'NOTE', title: 'Clinical Progress Note', description: 'Patient remains hemodynamically stable under continuous monitoring.', occurredAt: '2026-09-10T09:00:00' },
            ],
          });
          setLoadingPatient(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/hospitals/05f7450b-2100-4ce8-8418-df7dd2b6b8d5/patients/${patientId}`,
        );

        if (!response.ok) {
          throw new Error(`Patient API returned ${response.status}`);
        }

        const data = (await response.json()) as Patient;

        if (!mounted) return;
        setPatient(data);
      } catch (error) {
        console.warn(
          'ℹ️ Patient details unavailable — using demo patient profile.',
          error,
        );

        if (!mounted) return;

        setPatient({
          id: patientId,
          patientNumber: 'P0001',
          firstName: 'Demo',
          lastName: 'Patient',
          status: 'ACTIVE',
          gender: 'Not specified',
          age: 45,
          bloodGroup: 'O+',
          dateOfBirth: '1985-05-15',
          gender: 'Male',
          phone: '+91-9000000001',
          email: 'demo.patient@example.local',
          address: 'Pune, Maharashtra',
          emergencyContactName: 'Demo Patient Family',
          emergencyContactPhone: '+91-9000000002',
          emergencyContactRelation: 'Spouse',
          admissionAt: '2026-09-08T09:30:00',
          admissionReason: 'Acute respiratory distress requiring intensive monitoring',
          currentCondition: 'Hemodynamically stable under ICU observation',
          hospital: { name: 'ICU Sentinel Demo Hospital', code: 'DEMO-01', city: 'Pune', state: 'Maharashtra', country: 'India' },
          bed: { bedNumber: 'B01', status: 'OCCUPIED', icu: { name: 'Main Intensive Care Unit', code: 'ICU-01', floor: '1', description: 'Primary adult intensive care unit' } },
          diagnoses: [{ diagnosis: 'Acute respiratory distress', type: 'PRIMARY', diagnosedAt: '2026-09-08T10:15:00' }, { diagnosis: 'Community-acquired pneumonia', type: 'SECONDARY', diagnosedAt: '2026-09-08T11:00:00' }],
          medicalHistories: [{ condition: 'Hypertension', description: 'History of controlled hypertension.', diagnosedAt: '2020-06-15' }, { condition: 'Type 2 Diabetes Mellitus', description: 'Previously diagnosed type 2 diabetes under outpatient management.', diagnosedAt: '2021-03-10' }],
          allergies: [{ allergen: 'Penicillin', reaction: 'Skin rash', severity: 'MODERATE' }],
          medications: [{ medicineName: 'Ceftriaxone', dose: '1', unit: 'g', route: 'IV', frequency: 'Every 12 hours', status: 'ACTIVE' }, { medicineName: 'Paracetamol', dose: '650', unit: 'mg', route: 'Oral', frequency: 'Every 6 hours as needed', status: 'ACTIVE' }, { medicineName: 'Pantoprazole', dose: '40', unit: 'mg', route: 'IV', frequency: 'Once daily', status: 'ACTIVE' }, { medicineName: 'Insulin', dose: 'Sliding scale', unit: 'units', route: 'Subcutaneous', frequency: 'As per glucose monitoring', status: 'ACTIVE' }],
          labResults: [{ testName: 'Platelet Count', result: '245', unit: '10³/µL', referenceRange: '150 - 450 10³/µL', performedAt: '2026-09-10T06:30:00' }, { testName: 'Creatinine', result: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.3 mg/dL', performedAt: '2026-09-10T06:45:00' }, { testName: 'Blood Glucose', result: '142', unit: 'mg/dL', referenceRange: '70 - 140 mg/dL', performedAt: '2026-09-10T07:00:00' }],
          procedures: [{ procedureName: 'Arterial Blood Gas Analysis', performedAt: '2026-09-08T14:00:00' }, { procedureName: 'Chest X-Ray', performedAt: '2026-09-08T15:30:00' }],
          clinicalNotes: [{ note: 'Patient remains hemodynamically stable under continuous ICU monitoring.', createdAt: '2026-09-10T09:00:00' }],
          referrals: [{ referringDoctor: 'Dr. Referral Physician', referringHospital: 'Demo City General Hospital', department: 'Emergency Medicine', referralDate: '2026-09-08T08:45:00' }],
          events: [{ type: 'ADMISSION', title: 'ICU Admission', description: 'Patient admitted to Main Intensive Care Unit, Bed B01.', occurredAt: '2026-09-08T09:30:00' }, { type: 'DIAGNOSIS', title: 'Primary Diagnosis Recorded', description: 'Acute respiratory distress recorded as the primary ICU diagnosis.', occurredAt: '2026-09-08T10:15:00' }],
        });
      } finally {
        if (mounted) setLoadingPatient(false);
      }
    }

    void loadPatient();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  useEffect(() => {
    let mounted = true;

    async function loadVitals() {
      try {
        setLoadingVitals(true);

        const hours =
          timeRange === '1H'
            ? 1
            : timeRange === '6H'
              ? 6
              : timeRange === '12H'
                ? 12
                : 24;

        if (!API_BASE_URL) {
          const demo = createDemoVital(patientId);

          if (!mounted) return;

          setLiveVital(demo);
          setVitalHistory(
            createDemoHistory(patientId, hours),
          );
          setDemoMode(true);
          setConnectionStatus('DEMO');

          return;
        }

        const [latest, history] = await Promise.all([
          getLatestVital(patientId),
          getVitalHistory(patientId, hours),
        ]);

        if (!mounted) return;

        setLiveVital(latest);
        setVitalHistory(history);
        setDemoMode(false);
      } catch (error) {
        console.warn(
          'ℹ️ Backend unavailable — switching to Demo Mode.',
          error,
        );

        if (!mounted) return;

        const demo = createDemoVital(patientId);

        setLiveVital(demo);
        setVitalHistory(
          createDemoHistory(
            patientId,
            timeRange === '1H'
              ? 1
              : timeRange === '6H'
                ? 6
                : timeRange === '12H'
                  ? 12
                  : 24,
          ),
        );
        setDemoMode(true);
        setConnectionStatus('DEMO');
      } finally {
        if (mounted) {
          setLoadingVitals(false);
        }
      }
    }

    if (patientId) {
      void loadVitals();
    }

    return () => {
      mounted = false;
    };
  }, [patientId, timeRange]);

  useEffect(() => {
    if (!patientId || !API_BASE_URL) {
      setConnectionStatus('DEMO');
      return;
    }

    const socket = socketService.connect();

    const handleConnect = () => {
      setDemoMode(false);
      setConnectionStatus('LIVE');
      socketService.joinPatient(patientId);
    };

    const handleDisconnect = () => {
      setConnectionStatus('Offline');
    };

    const handleVitalUpdate = (newVital: Vital) => {
      if (newVital.patientId !== patientId) return;

      console.log('💓 LIVE VITAL RECEIVED:', newVital);

      setDemoMode(false);
      setConnectionStatus('LIVE');
      setLiveVital(newVital);

      setVitalHistory(current => {
        if (current.some(vital => vital.id === newVital.id)) {
          return current;
        }

        return [newVital, ...current].slice(0, 500);
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('vital_update', handleVitalUpdate);

    socketService.joinPatient(patientId);

    if (socket.connected) {
      setConnectionStatus('LIVE');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('vital_update', handleVitalUpdate);
    };
  }, [patientId]);

  const heartRate = liveVital?.heartRate;
  const spo2 = liveVital?.spo2;
  const bloodPressure =
    liveVital?.systolicBP != null || liveVital?.diastolicBP != null
      ? `${liveVital?.systolicBP ?? '--'}/${liveVital?.diastolicBP ?? '--'}`
      : '--/--';
  const temperature = liveVital?.temperature;
  const respiratoryRate = liveVital?.respiratoryRate;
  const glucose = liveVital?.glucose;

  const latestRecordedAt = liveVital?.recordedAt
    ? new Date(liveVital.recordedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '--';

  return (
    <div className="patient-page">

      <header className="patient-header">
        <button
          className="icon-button"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="patient-header-title">
          <strong>Patient Details</strong>
          <span>ICU-01 • B01</span>
        </div>

        <button className="notification-button">
          <Bell size={19} />
        </button>
      </header>

      <main className="patient-main">

        <section className="patient-profile-card">

          <div className="patient-profile-top">

            <div className="patient-profile">
              <div className="large-patient-avatar">
                DP
              </div>

              <div>
                <h1>
                  {loadingPatient
                    ? 'Loading patient...'
                    : getPatientDisplayName(patient)}
                </h1>
                <p>
                  Patient ID: {getPatientNumber(patient)}
                  {patient?.age != null ? ` • ${patient.age} years` : ''}
                </p>
              </div>
            </div>

            <div className="patient-bed">
              <Bed size={16} />
              <span>B01</span>
            </div>

          </div>

          <div className="patient-status-row">

            <div className="monitoring-status">
              <span />
              {connectionStatus === 'LIVE'
                ? 'LIVE MONITORING'
                : connectionStatus.toUpperCase()}
            </div>

            <div className="last-updated">
              <Clock3 size={12} />
              {liveVital
                ? `Updated ${latestRecordedAt}`
                : 'Waiting for vitals'}
            </div>

          </div>

        </section>


        <section className="patient-section">

          <div className="patient-section-heading">
            <div>
              <h2>Current Vitals</h2>
              <span>Real-time measurements</span>
            </div>

            <span className="vitals-live-label">
              ● {connectionStatus}
            </span>
          </div>

          <div className="patient-vitals-grid">

            <PatientVital
              icon={<HeartPulse size={20} />}
              label="Heart Rate"
              value={loadingVitals ? '--' : String(heartRate ?? '--')}
              unit="bpm"
            />

            <PatientVital
              icon={<Droplets size={20} />}
              label="SpO₂"
              value={loadingVitals ? '--' : String(spo2 ?? '--')}
              unit="%"
            />

            <PatientVital
              icon={<Activity size={20} />}
              label="Blood Pressure"
              value={loadingVitals ? '--/--' : bloodPressure}
              unit="mmHg"
            />

            <PatientVital
              icon={<Thermometer size={20} />}
              label="Temperature"
              value={loadingVitals ? '--' : String(temperature ?? '--')}
              unit="°C"
            />

            <PatientVital
              icon={<Wind size={20} />}
              label="Respiratory Rate"
              value={loadingVitals ? '--' : String(respiratoryRate ?? '--')}
              unit="/min"
            />

            <PatientVital
              icon={<Activity size={20} />}
              label="Glucose"
              value={loadingVitals ? '--' : String(glucose ?? '--')}
              unit="mg/dL"
            />

          </div>

        </section>


        <section className="patient-section trend-section">

          <div className="patient-section-heading">

            <div>
              <h2>Vital Trends</h2>
              <span>Heart rate history</span>
            </div>

            <div className="range-selector">
              {['1H', '6H', '12H', '24H'].map(range => (
                <button
                  key={range}
                  className={
                    timeRange === range
                      ? 'range-button active'
                      : 'range-button'
                  }
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>

          </div>

          <div className="chart-header">
            <div>
              <strong>{heartRate ?? '--'}</strong>
              <span>bpm</span>
            </div>

            <div className="chart-status">
              {vitalHistory.length > 0
                ? `${vitalHistory.length} readings`
                : 'Waiting for data'}
            </div>
          </div>

          <VitalTrendChart history={vitalHistory} />

        </section>


        <section className="patient-section">

          <div className="patient-section-heading">
            <div>
              <h2>Active Alerts</h2>
              <span>Live alert stream</span>
            </div>

            <span className="alert-count">0</span>
          </div>

          <div className="patient-alert-card">
            <div className="patient-alert-icon">
              <Activity size={20} />
            </div>

            <div className="patient-alert-content">
              <div className="patient-alert-title">
                <strong>Alert monitoring active</strong>
                <span>LIVE</span>
              </div>

              <p>
                Alerts generated by the ICU Sentinel backend
                will appear here.
              </p>
            </div>
          </div>

        </section>


        <PatientDataSection
          title="Patient Information"
          subtitle="Demographics and admission details"
          data={{
            patientNumber: getPatientNumber(patient),
            firstName: patient?.firstName,
            lastName: patient?.lastName,
            gender: patient?.gender,
            age: patient?.age,
            dateOfBirth: patient?.dateOfBirth,
            bloodGroup: patient?.bloodGroup,
            phone: patient?.phone,
            email: patient?.email,
            admissionAt: patient?.admissionAt ?? patient?.admissionDate,
            dischargeAt: patient?.dischargeAt ?? patient?.dischargeDate,
            admissionReason: patient?.admissionReason,
            currentCondition: patient?.currentCondition,
            address: patient?.address,
            emergencyContactName: patient?.emergencyContactName,
            emergencyContactPhone: patient?.emergencyContactPhone,
            emergencyContactRelation: patient?.emergencyContactRelation,
            status: patient?.status || 'ACTIVE',
            hospital: patient?.hospital,
            icu: patient?.bed?.icu ?? patient?.icu,
            bed: patient?.bed,
          }}
        />

        <PatientDataSection
          title="Diagnosis"
          subtitle="Current diagnosis and clinical assessment"
          data={patient?.diagnoses ?? patient?.diagnosis}
        />

        <PatientDataSection
          title="Medical History"
          subtitle="Previous conditions and relevant history"
          data={patient?.medicalHistories ?? patient?.medicalHistory}
        />

        <PatientDataSection
          title="Allergies"
          subtitle="Known allergies and reactions"
          data={patient?.allergies}
        />

        <PatientDataSection
          title="Medications"
          subtitle="Current medication records"
          data={patient?.medications}
        />

        <PatientDataSection
          title="Laboratory Results"
          subtitle="Available laboratory investigations"
          data={patient?.labResults ?? patient?.laboratoryResults ?? patient?.labs}
        />

        <PatientDataSection
          title="Procedures"
          subtitle="Procedures and interventions"
          data={patient?.procedures}
        />

        <PatientDataSection
          title="Clinical Notes"
          subtitle="Clinical documentation and notes"
          data={patient?.clinicalNotes ?? patient?.notes}
        />

        <PatientDataSection
          title="Referrals"
          subtitle="Specialist and department referrals"
          data={patient?.referrals}
        />

        <PatientDataSection
          title="Patient Events"
          subtitle="Admission and clinical event timeline"
          data={patient?.patientEvents ?? patient?.events}
        />

        <div className="patient-footer">
          <Activity size={15} />
          <span>
            ICU Sentinel • {demoMode ? 'Demo data' : 'Connected to live backend'} •
            {loadingPatient ? ' Loading patient profile...' : ' Full patient profile loaded'}
          </span>
        </div>

      </main>
    </div>
  );
}
/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LoginScreen />}
        />

        <Route
          path="/dashboard"
          element={<DashboardScreen />}
        />

        <Route
          path="/patient/:patientId"
          element={<PatientDetailScreen />}

        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;