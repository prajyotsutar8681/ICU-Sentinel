const configuredApiUrl =
    import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
    configuredApiUrl ||
    (import.meta.env.DEV
        ? 'http://localhost:3000'
        : '')
).replace(/\/$/, '');

export type Hospital = {
    id: string;
    name: string;
    code?: string | null;
};

export type Icu = {
    id: string;
    name: string;
    code: string;
};

export type Bed = {
    id: string;
    bedNumber: string;
    status: string;

    patients: {
        id: string;
        patientNumber: string;
        firstName: string;
        lastName: string;
        status: string;
    }[];
};

/*
 * Patient is intentionally flexible because the backend
 * returns the expanded clinical patient object.
 *
 * This allows the web application to display additional
 * clinical fields without breaking when new fields are added.
 */
export type Patient = {
    id: string;
    patientNumber?: string | null;

    firstName?: string | null;
    lastName?: string | null;

    status?: string | null;

    gender?: string | null;
    dateOfBirth?: string | null;
    age?: number | null;

    phone?: string | null;
    email?: string | null;

    bloodGroup?: string | null;

    admissionDate?: string | null;
    dischargeDate?: string | null;

    diagnosis?: unknown;
    diagnoses?: unknown;

    medicalHistory?: unknown;
    allergies?: unknown;
    medications?: unknown;

    labs?: unknown;
    laboratoryResults?: unknown;

    procedures?: unknown;
    clinicalNotes?: unknown;
    notes?: unknown;

    referrals?: unknown;
    events?: unknown;
    patientEvents?: unknown;

    hospital?: unknown;
    icu?: unknown;
    bed?: unknown;

    [key: string]: unknown;
};

export type Vital = {
    id: string;
    patientId: string;

    heartRate?: number | null;

    systolicBP?: number | null;

    diastolicBP?: number | null;

    spo2?: number | null;

    temperature?: number | null;

    respiratoryRate?: number | null;

    glucose?: number | null;

    recordedAt: string;
};

async function apiRequest<T>(
    endpoint: string,
): Promise<T> {

    if (!API_BASE_URL) {
        throw new Error(
            'No backend configured',
        );
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
    );

    if (!response.ok) {
        throw new Error(
            `API ${response.status}: ${response.statusText}`,
        );
    }

    return response.json() as Promise<T>;
}

export async function getHospitals() {
    return apiRequest<Hospital[]>(
        '/hospitals',
    );
}

export async function getIcus(
    hospitalId: string,
) {
    return apiRequest<Icu[]>(
        `/icus/hospital/${hospitalId}`,
    );
}

export async function getIcuOverview(
    icuId: string,
) {
    return apiRequest<unknown>(
        `/icus/${icuId}/overview`,
    );
}

export async function getPatient(
    patientId: string,
) {
    return apiRequest<Patient>(
        `/hospitals/05f7450b-2100-4ce8-8418-df7dd2b6b8d5/patients/${patientId}`,
    );
}

export async function getLatestVital(
    patientId: string,
) {
    return apiRequest<Vital | null>(
        `/vitals/patient/${patientId}/latest`,
    );
}

export async function getVitalHistory(
    patientId: string,
    hours = 1,
) {
    return apiRequest<Vital[]>(
        `/vitals/patient/${patientId}/history?hours=${hours}`,
    );
}