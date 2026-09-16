import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    NativeStackScreenProps,
} from '@react-navigation/native-stack';

import socketService from '../../services/socketService';

import VitalTrendChart from '../../components/VitalTrendChart';

import {
    RootStackParamList,
} from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<
    RootStackParamList,
    'PatientDetail'
>;

const API_URL =
    'http://10.0.2.2:3000';

const HOSPITAL_ID =
    '05f7450b-2100-4ce8-8418-df7dd2b6b8d5';

type Vital = {
    id: string;
    patientId: string;
    heartRate: number | null;
    systolicBP: number | null;
    diastolicBP: number | null;
    spo2: number | null;
    temperature: number | null;
    respiratoryRate: number | null;
    glucose: number | null;
    recordedAt: string;
    receivedAt: string;
    source: string | null;
    sourceDevice: string | null;
};

type HistoryPoint = {
    recordedAt: string;
    value: number | null;
};

type AlertPayload = {
    id: string;
    patientId: string;
    ruleId?: string | null;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    vitalType: string;
    message: string;
    triggeredValue?: number | null;
    thresholdValue?: number | null;
    generatedAt: string;
};

type Doctor = {
    id: string;
    employeeId?: string;
    name: string;
    email?: string;
    role: string;
};

type PatientDetail = {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;

    dateOfBirth: string | null;
    gender: string | null;
    bloodGroup: string | null;

    phone: string | null;
    email: string | null;
    address: string | null;

    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelation: string | null;

    status: string;

    admissionAt: string;
    dischargeAt: string | null;

    admissionReason: string | null;
    currentCondition: string | null;

    hospital: {
        id: string;
        name: string;
        code: string;
        city: string | null;
        state: string | null;
        country: string;
    } | null;

    bed: {
        id: string;
        bedNumber: string;
        status: string;
        icu: {
            id: string;
            name: string;
            code: string;
            floor: string | null;
            description: string | null;
        };
    } | null;

    assignments: Array<{
        id: string;
        assignedAt: string;
        unassignedAt: string | null;
        user: Doctor;
    }>;

    admissions: Array<{
        id: string;
        admittedAt: string;
        dischargedAt: string | null;
        reason: string | null;
        status: string;
        attendingDoctor: Doctor | null;
    }>;

    diagnoses: Array<{
        id: string;
        diagnosis: string;
        type: string;
        diagnosedAt: string;
        notes: string | null;
        diagnosedBy: Doctor | null;
    }>;

    medicalHistories: Array<{
        id: string;
        condition: string;
        description: string | null;
        diagnosedAt: string | null;
        resolvedAt: string | null;
    }>;

    allergies: Array<{
        id: string;
        allergen: string;
        reaction: string | null;
        severity: string;
        notes: string | null;
    }>;

    medications: Array<{
        id: string;
        medicineName: string;
        dose: string | null;
        unit: string | null;
        route: string | null;
        frequency: string | null;
        startDate: string;
        endDate: string | null;
        status: string;
        instructions: string | null;
        prescribedBy: Doctor | null;
    }>;

    labResults: Array<{
        id: string;
        testName: string;
        result: string;
        unit: string | null;
        referenceRange: string | null;
        performedAt: string;
        notes: string | null;
    }>;

    procedures: Array<{
        id: string;
        procedureName: string;
        performedAt: string;
        notes: string | null;
        performedBy: Doctor | null;
    }>;

    clinicalNotes: Array<{
        id: string;
        note: string;
        createdAt: string;
        author: Doctor | null;
    }>;

    referrals: Array<{
        id: string;
        referringDoctor: string | null;
        referringHospital: string | null;
        department: string | null;
        referralDate: string | null;
        reason: string | null;
        notes: string | null;
    }>;

    events: Array<{
        id: string;
        type: string;
        title: string;
        description: string | null;
        occurredAt: string;
        createdBy: Doctor | null;
    }>;

    latestVital: Vital | null;
};

const formatDate = (
    value: string | null | undefined,
) => {
    if (!value) {
        return '--';
    }

    return new Date(value).toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    );
};

const formatDateTime = (
    value: string | null | undefined,
) => {
    if (!value) {
        return '--';
    }

    return new Date(value).toLocaleString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    );
};

type TimeRangeHours = 1 | 6 | 12 | 24;

const TIME_RANGES: Array<{
    label: string;
    hours: TimeRangeHours;
}> = [
        { label: '1H', hours: 1 },
        { label: '6H', hours: 6 },
        { label: '12H', hours: 12 },
        { label: '24H', hours: 24 },
    ];


const createDemoVital = (patientId: string): Vital => ({
    id: `demo-vital-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patientId,
    heartRate: Math.round(76 + Math.random() * 18),
    systolicBP: Math.round(112 + Math.random() * 16),
    diastolicBP: Math.round(66 + Math.random() * 12),
    spo2: Math.round(97 + Math.random() * 3),
    temperature: Math.round((36.5 + Math.random() * 0.6) * 10) / 10,
    respiratoryRate: Math.round(14 + Math.random() * 6),
    glucose: Math.round(92 + Math.random() * 25),
    recordedAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    source: 'DEMO',
    sourceDevice: 'ICU-DEMO-MONITOR',
});

const createDemoPatient = (patientId: string): PatientDetail => {
    const now = new Date();
    const admission = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const vital = createDemoVital(patientId);

    const doctor: Doctor = {
        id: 'demo-doctor-001',
        employeeId: 'DOC-001',
        name: 'Dr. Demo Physician',
        email: 'doctor@demo-hospital.test',
        role: 'ICU Physician',
    };

    return {
        id: patientId,
        patientNumber: 'P0001',
        firstName: 'Demo',
        lastName: 'Patient',
        dateOfBirth: '1988-06-15T00:00:00.000Z',
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '+91 90000 00001',
        email: 'demo.patient@example.test',
        address: 'Demo Address, Pune, Maharashtra',
        emergencyContactName: 'Demo Emergency Contact',
        emergencyContactPhone: '+91 90000 00002',
        emergencyContactRelation: 'Spouse',
        status: 'ACTIVE',
        admissionAt: admission.toISOString(),
        dischargeAt: null,
        admissionReason: 'Observation and continuous ICU monitoring',
        currentCondition: 'Stable under continuous monitoring.',
        hospital: {
            id: 'demo-hospital-001',
            name: 'Demo Hospital',
            code: 'DEMO-HOSP',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
        },
        bed: {
            id: 'demo-bed-001',
            bedNumber: 'B01',
            status: 'OCCUPIED',
            icu: {
                id: 'demo-icu-001',
                name: 'Main Intensive Care Unit',
                code: 'ICU-01',
                floor: '1st Floor',
                description: 'Demo ICU for product presentation.',
            },
        },
        assignments: [{
            id: 'demo-assignment-001',
            assignedAt: admission.toISOString(),
            unassignedAt: null,
            user: doctor,
        }],
        admissions: [{
            id: 'demo-admission-001',
            admittedAt: admission.toISOString(),
            dischargedAt: null,
            reason: 'Observation and continuous ICU monitoring',
            status: 'ACTIVE',
            attendingDoctor: doctor,
        }],
        diagnoses: [{
            id: 'demo-diagnosis-001',
            diagnosis: 'Acute medical condition under observation',
            type: 'PRIMARY',
            diagnosedAt: admission.toISOString(),
            notes: 'Demo diagnosis for UI presentation only.',
            diagnosedBy: doctor,
        }],
        medicalHistories: [{
            id: 'demo-history-001',
            condition: 'Hypertension',
            description: 'Controlled history used for demonstration.',
            diagnosedAt: '2022-03-10T00:00:00.000Z',
            resolvedAt: null,
        }],
        allergies: [{
            id: 'demo-allergy-001',
            allergen: 'No known drug allergy',
            reaction: null,
            severity: 'NONE',
            notes: 'Demo record.',
        }],
        medications: [{
            id: 'demo-medication-001',
            medicineName: 'Demo Medication',
            dose: '500',
            unit: 'mg',
            route: 'ORAL',
            frequency: 'Twice daily',
            startDate: admission.toISOString(),
            endDate: null,
            status: 'ACTIVE',
            instructions: 'Demo medication record for UI presentation.',
            prescribedBy: doctor,
        }],
        labResults: [
            {
                id: 'demo-lab-001',
                testName: 'Hemoglobin',
                result: '13.8',
                unit: 'g/dL',
                referenceRange: '13.0 - 17.0',
                performedAt: now.toISOString(),
                notes: 'Demo laboratory result.',
            },
            {
                id: 'demo-lab-002',
                testName: 'Blood Glucose',
                result: String(vital.glucose),
                unit: 'mg/dL',
                referenceRange: '70 - 140',
                performedAt: now.toISOString(),
                notes: 'Demo laboratory result.',
            },
        ],
        procedures: [{
            id: 'demo-procedure-001',
            procedureName: 'Continuous ICU Monitoring',
            performedAt: now.toISOString(),
            notes: 'Demo procedure record.',
            performedBy: doctor,
        }],
        clinicalNotes: [{
            id: 'demo-note-001',
            note: 'Patient is stable. Continue routine monitoring and review vital trends.',
            createdAt: now.toISOString(),
            author: doctor,
        }],
        referrals: [{
            id: 'demo-referral-001',
            referringDoctor: 'Dr. Demo Referring Physician',
            referringHospital: 'Demo Referral Hospital',
            department: 'Emergency Medicine',
            referralDate: admission.toISOString(),
            reason: 'Further observation and monitoring.',
            notes: 'Demo referral record.',
        }],
        events: [{
            id: 'demo-event-001',
            type: 'ADMISSION',
            title: 'Patient admitted to ICU',
            description: 'Demo timeline event for presentation.',
            occurredAt: admission.toISOString(),
            createdBy: doctor,
        }, {
            id: 'demo-event-002',
            type: 'MONITORING',
            title: 'Continuous monitoring started',
            description: 'ICU monitoring initiated.',
            occurredAt: now.toISOString(),
            createdBy: doctor,
        }],
        latestVital: vital,
    };
};

const createDemoHistory = (patientId: string): Vital[] => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, index) => {
        const timestamp = new Date(now - (23 - index) * 60 * 60 * 1000);
        return {
            ...createDemoVital(patientId),
            id: `demo-history-${index}`,
            patientId,
            recordedAt: timestamp.toISOString(),
            receivedAt: timestamp.toISOString(),
        };
    });
};

const PatientDetailScreen = ({
    navigation,
    route,
}: Props) => {
    const {
        patientId,
    } = route.params;

    const [
        patient,
        setPatient,
    ] = useState<PatientDetail | null>(
        null,
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const [
        liveVital,
        setLiveVital,
    ] = useState<Vital | null>(
        null,
    );

    const [
        demoMode,
        setDemoMode,
    ] = useState(false);

    const [
        vitalHistory,
        setVitalHistory,
    ] = useState<Vital[]>([]);

    const [
        historyLoading,
        setHistoryLoading,
    ] = useState(true);

    const [
        activeAlerts,
        setActiveAlerts,
    ] = useState<AlertPayload[]>([]);

    const [
        selectedRange,
        setSelectedRange,
    ] = useState<TimeRangeHours>(24);

    /*
     * This state is only used to refresh
     * the freshness indicator every 5 seconds.
     */
    const [, setStatusTick] =
        useState(0);

    // ==========================================================
    // REFRESH VITAL FRESHNESS STATUS
    // ==========================================================

    useEffect(() => {
        const interval =
            setInterval(() => {
                setStatusTick(
                    value => value + 1,
                );
            }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // ==========================================================
    // LOAD PATIENT DETAIL
    // ==========================================================

    useEffect(() => {
        const loadPatient =
            async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response =
                        await fetch(
                            `${API_URL}/hospitals/${HOSPITAL_ID}/patients/${patientId}`,
                        );

                    if (!response.ok) {
                        throw new Error(
                            `Server returned ${response.status}`,
                        );
                    }

                    const data: PatientDetail =
                        await response.json();

                    setPatient(data);
                    setDemoMode(false);

                    setLiveVital(
                        data.latestVital,
                    );
                } catch (err) {
                    console.error(
                        'Failed to load patient:',
                        err,
                    );

                    const demoPatient = createDemoPatient(patientId);
                    setPatient(demoPatient);
                    setLiveVital(demoPatient.latestVital);
                    setDemoMode(true);
                    setError(null);
                } finally {
                    setLoading(false);
                }
            };

        loadPatient();
    }, [patientId]);

    // ==========================================================
    // LOAD VITAL HISTORY
    // ==========================================================

    const loadVitalHistory = useCallback(
        async () => {
            try {
                setHistoryLoading(true);

                const response =
                    await fetch(
                        `${API_URL}/vitals/patient/${patientId}/history?hours=${selectedRange}&limit=500`,
                    );

                if (!response.ok) {
                    throw new Error(
                        `Server returned ${response.status}`,
                    );
                }

                const data: Vital[] =
                    await response.json();

                setVitalHistory(
                    Array.isArray(data)
                        ? data
                        : [],
                );
            } catch (err) {
                console.error(
                    'Failed to load vital history:',
                    err,
                );

                setVitalHistory(
                    createDemoHistory(patientId),
                );
            } finally {
                setHistoryLoading(false);
            }
        },
        [patientId, selectedRange],
    );

    useEffect(() => {
        loadVitalHistory();
    }, [loadVitalHistory]);

    // ==========================================================
    // LIVE VITALS
    // ==========================================================

    useEffect(() => {
        if (demoMode) {
            return;
        }

        const socket =
            socketService.connect();

        socketService.joinPatient(
            patientId,
        );

        const handleVitalUpdate = (
            newVital: Vital,
        ) => {
            if (
                newVital.patientId !==
                patientId
            ) {
                return;
            }

            setLiveVital(newVital);

            setVitalHistory(
                currentHistory => {
                    const exists =
                        currentHistory.some(
                            item =>
                                item.id &&
                                newVital.id &&
                                item.id ===
                                newVital.id,
                        );

                    if (exists) {
                        return currentHistory;
                    }

                    return [
                        newVital,
                        ...currentHistory,
                    ].slice(0, 100);
                },
            );
        };

        socket.on(
            'vital_update',
            handleVitalUpdate,
        );

        return () => {
            socket.off(
                'vital_update',
                handleVitalUpdate,
            );
        };
    }, [patientId, demoMode]);

    // ==========================================================
    // LIVE ALERTS
    // ==========================================================

    useEffect(() => {
        if (demoMode) {
            return;
        }

        const socket = socketService.connect();

        socketService.joinPatient(patientId);

        const handleAlertCreated = (
            newAlert: AlertPayload,
        ) => {
            if (newAlert.patientId !== patientId) {
                return;
            }

            setActiveAlerts(currentAlerts => {
                const exists = currentAlerts.some(
                    alert => alert.id === newAlert.id,
                );

                if (exists) {
                    return currentAlerts;
                }

                return [newAlert, ...currentAlerts].slice(0, 5);
            });
        };

        socket.on(
            'alert_created',
            handleAlertCreated,
        );

        return () => {
            socket.off(
                'alert_created',
                handleAlertCreated,
            );
        };
    }, [patientId, demoMode]);

    // ==========================================================
    // OFFLINE DEMO VITALS
    // ==========================================================

    useEffect(() => {
        if (!demoMode) {
            return;
        }

        const interval = setInterval(() => {
            const newVital = createDemoVital(patientId);

            setLiveVital(newVital);
            setVitalHistory(currentHistory => [
                newVital,
                ...currentHistory,
            ].slice(0, 100));
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [patientId, demoMode]);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <SafeAreaView
                style={
                    styles.center
                }>

                <ActivityIndicator
                    size="large"
                />

                <Text
                    style={
                        styles.loadingText
                    }>
                    Loading patient details...
                </Text>
            </SafeAreaView>
        );
    }

    // ==========================================================
    // ERROR
    // ==========================================================

    if (error || !patient) {
        return (
            <SafeAreaView
                style={
                    styles.center
                }>

                <Text
                    style={
                        styles.errorTitle
                    }>
                    Unable to load patient
                </Text>

                <Text
                    style={
                        styles.errorText
                    }>
                    {error ??
                        'Patient data unavailable'}
                </Text>

                <Pressable
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }>

                    <Text
                        style={
                            styles.backButtonText
                        }>
                        Go Back
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // ==========================================================
    // CURRENT DATA
    // ==========================================================

    const fullName =
        `${patient.firstName} ${patient.lastName}`;

    const vital =
        liveVital ??
        patient.latestVital;

    // ==========================================================
    // VITAL FRESHNESS STATUS
    // ==========================================================

    const getVitalStatus = (
        vitalData: Vital | null,
    ) => {
        if (
            !vitalData?.recordedAt
        ) {
            return 'NO_DATA';
        }

        const age =
            Date.now() -
            new Date(
                vitalData.recordedAt,
            ).getTime();

        if (age <= 15000) {
            return 'LIVE';
        }

        if (age <= 30000) {
            return 'DELAYED';
        }

        return 'NO_DATA';
    };

    const vitalStatus =
        getVitalStatus(vital);

    // ==========================================================
    // VITAL TREND DATA
    // ==========================================================

    const toHistory = (
        selector: (item: Vital) => number | null,
    ): HistoryPoint[] =>
        vitalHistory.map(item => ({
            recordedAt: item.recordedAt,
            value: selector(item),
        }));

    const heartRateHistory =
        toHistory(item => item.heartRate);

    const spo2History =
        toHistory(item => item.spo2);

    const systolicHistory =
        toHistory(item => item.systolicBP);

    const temperatureHistory =
        toHistory(item => item.temperature);

    const respiratoryRateHistory =
        toHistory(
            item => item.respiratoryRate,
        );

    const glucoseHistory =
        toHistory(item => item.glucose);

    // ==========================================================
    // UI
    // ==========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }>

            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }>

                {/* ==================================================
                    HEADER
                ================================================== */}

                <View
                    style={
                        styles.header
                    }>

                    <Pressable
                        style={
                            styles.backCircle
                        }
                        onPress={() =>
                            navigation.goBack()
                        }>

                        <Text
                            style={
                                styles.backArrow
                            }>
                            ‹
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.headerText
                        }>

                        <Text
                            style={
                                styles.title
                            }>
                            Patient Details
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }>
                            {
                                patient.patientNumber
                            }
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.liveBadge,
                            vitalStatus ===
                            'DELAYED' &&
                            styles.delayedBadge,
                            vitalStatus ===
                            'NO_DATA' &&
                            styles.noDataBadge,
                        ]}>

                        <View
                            style={[
                                styles.liveDot,
                                vitalStatus ===
                                'DELAYED' &&
                                styles.delayedDot,
                                vitalStatus ===
                                'NO_DATA' &&
                                styles.noDataDot,
                            ]}
                        />

                        <Text
                            style={[
                                styles.liveText,
                                vitalStatus ===
                                'DELAYED' &&
                                styles.delayedText,
                                vitalStatus ===
                                'NO_DATA' &&
                                styles.noDataText,
                            ]}>
                            {demoMode
                                ? 'DEMO LIVE'
                                : vitalStatus ===
                                    'LIVE'
                                    ? 'LIVE'
                                    : vitalStatus ===
                                        'DELAYED'
                                        ? 'DELAYED'
                                        : 'NO DATA'}
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                    PATIENT IDENTITY
                ================================================== */}

                <View
                    style={
                        styles.identityCard
                    }>

                    <View
                        style={
                            styles.avatar
                        }>

                        <Text
                            style={
                                styles.avatarText
                            }>
                            {patient.firstName.charAt(
                                0,
                            )}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.identityInfo
                        }>

                        <Text
                            style={
                                styles.patientName
                            }>
                            {fullName}
                        </Text>

                        <Text
                            style={
                                styles.patientNumber
                            }>
                            {
                                patient.patientNumber
                            }
                        </Text>

                        <View
                            style={
                                styles.identityMeta
                            }>

                            <Text
                                style={
                                    styles.metaText
                                }>
                                {patient.gender ??
                                    '--'}
                            </Text>

                            <Text
                                style={
                                    styles.metaDivider
                                }>
                                •
                            </Text>

                            <Text
                                style={
                                    styles.metaText
                                }>
                                {patient.bloodGroup ??
                                    '--'}
                            </Text>

                            <Text
                                style={
                                    styles.metaDivider
                                }>
                                •
                            </Text>

                            <Text
                                style={
                                    styles.metaText
                                }>
                                {formatDate(
                                    patient.dateOfBirth,
                                )}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.activeBadge
                        }>

                        <Text
                            style={
                                styles.activeText
                            }>
                            {
                                patient.status
                            }
                        </Text>
                    </View>
                </View>

                {demoMode && (
                    <View style={styles.demoNotice}>
                        <Text style={styles.demoNoticeTitle}>
                            Presentation Demo Mode
                        </Text>
                        <Text style={styles.demoNoticeText}>
                            Patient details and vitals are simulated locally for UI demonstration.
                        </Text>
                    </View>
                )}

                {activeAlerts.length > 0 && (
                    <View style={styles.alertSection}>
                        <View style={styles.alertSectionHeader}>
                            <Text style={styles.alertSectionTitle}>
                                Active Alerts
                            </Text>
                            <View style={styles.alertCountBadge}>
                                <Text style={styles.alertCountText}>
                                    {activeAlerts.length}
                                </Text>
                            </View>
                        </View>

                        {activeAlerts.map(alert => {
                            const isCritical =
                                alert.severity === 'CRITICAL';
                            const isWarning =
                                alert.severity === 'WARNING';

                            return (
                                <View
                                    key={alert.id}
                                    style={[
                                        styles.alertCard,
                                        isCritical && styles.alertCardCritical,
                                        isWarning && styles.alertCardWarning,
                                    ]}>
                                    <View style={styles.alertHeader}>
                                        <View
                                            style={[
                                                styles.alertSeverityBadge,
                                                isCritical && styles.alertSeverityCritical,
                                                isWarning && styles.alertSeverityWarning,
                                            ]}>
                                            <Text
                                                style={[
                                                    styles.alertSeverityText,
                                                    isCritical && styles.alertSeverityCriticalText,
                                                    isWarning && styles.alertSeverityWarningText,
                                                ]}>
                                                {isCritical ? '🚨' : isWarning ? '⚠️' : 'ℹ️'}{' '}
                                                {alert.severity}
                                            </Text>
                                        </View>

                                        <Pressable
                                            style={styles.alertDismissButton}
                                            onPress={() =>
                                                setActiveAlerts(currentAlerts =>
                                                    currentAlerts.filter(
                                                        item => item.id !== alert.id,
                                                    ),
                                                )
                                            }>
                                            <Text style={styles.alertDismissText}>×</Text>
                                        </Pressable>
                                    </View>

                                    <Text style={styles.alertTitle}>
                                        {alert.vitalType.replace(/_/g, ' ')}
                                    </Text>
                                    <Text style={styles.alertMessage}>
                                        {alert.message}
                                    </Text>

                                    <View style={styles.alertMetrics}>
                                        <View style={styles.alertMetric}>
                                            <Text style={styles.alertMetricLabel}>
                                                Value
                                            </Text>
                                            <Text style={styles.alertMetricValue}>
                                                {alert.triggeredValue ?? '--'}
                                            </Text>
                                        </View>

                                        <View style={styles.alertMetricDivider} />

                                        <View style={styles.alertMetric}>
                                            <Text style={styles.alertMetricLabel}>
                                                Threshold
                                            </Text>
                                            <Text style={styles.alertMetricValue}>
                                                {alert.thresholdValue ?? '--'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.alertTime}>
                                        Generated: {formatDateTime(alert.generatedAt)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* ==================================================
                    LOCATION
                ================================================== */}

                <SectionTitle
                    title="Current Location"
                />

                <View
                    style={
                        styles.infoCard
                    }>

                    <InfoRow
                        label="Hospital"
                        value={
                            patient.hospital
                                ?.name ?? '--'
                        }
                    />

                    <InfoRow
                        label="ICU"
                        value={
                            patient.bed?.icu
                                ?.name ?? '--'
                        }
                    />

                    <InfoRow
                        label="ICU Code"
                        value={
                            patient.bed?.icu
                                ?.code ?? '--'
                        }
                    />

                    <InfoRow
                        label="Bed"
                        value={
                            patient.bed?.bedNumber
                                ? `Bed ${patient.bed.bedNumber}`
                                : '--'
                        }
                    />

                    <InfoRow
                        label="Bed Status"
                        value={
                            patient.bed?.status ??
                            '--'
                        }
                    />
                </View>

                {/* ==================================================
                    LIVE VITALS
                ================================================== */}

                <View
                    style={
                        styles.sectionHeader
                    }>

                    <Text
                        style={
                            styles.sectionHeaderTitle
                        }>
                        Live Vitals
                    </Text>

                    <View
                        style={[
                            styles.liveSmall,
                            vitalStatus ===
                            'DELAYED' &&
                            styles.delayedSmall,
                            vitalStatus ===
                            'NO_DATA' &&
                            styles.noDataSmall,
                        ]}>

                        <View
                            style={[
                                styles.liveDot,
                                vitalStatus ===
                                'DELAYED' &&
                                styles.delayedDot,
                                vitalStatus ===
                                'NO_DATA' &&
                                styles.noDataDot,
                            ]}
                        />

                        <Text
                            style={[
                                styles.liveSmallText,
                                vitalStatus ===
                                'DELAYED' &&
                                styles.delayedText,
                                vitalStatus ===
                                'NO_DATA' &&
                                styles.noDataText,
                            ]}>
                            {demoMode
                                ? 'DEMO LIVE'
                                : vitalStatus ===
                                    'LIVE'
                                    ? 'LIVE'
                                    : vitalStatus ===
                                        'DELAYED'
                                        ? 'DELAYED'
                                        : 'NO DATA'}
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.vitalsGrid
                    }>

                    <VitalCard
                        label="Heart Rate"
                        value={
                            vital?.heartRate
                        }
                        unit="bpm"
                    />

                    <VitalCard
                        label="SpO₂"
                        value={
                            vital?.spo2
                        }
                        unit="%"
                    />

                    <VitalCard
                        label="Blood Pressure"
                        value={
                            vital
                                ? `${vital.systolicBP ?? '--'}/${vital.diastolicBP ?? '--'}`
                                : '--'
                        }
                        unit="mmHg"
                    />

                    <VitalCard
                        label="Temperature"
                        value={
                            vital?.temperature
                        }
                        unit="°C"
                    />

                    <VitalCard
                        label="Respiratory Rate"
                        value={
                            vital?.respiratoryRate
                        }
                        unit="breaths/min"
                    />

                    <VitalCard
                        label="Glucose"
                        value={
                            vital?.glucose
                        }
                        unit="mg/dL"
                    />
                </View>

                {vital && (
                    <Text
                        style={
                            styles.lastUpdated
                        }>
                        Last updated:{' '}
                        {formatDateTime(
                            vital.recordedAt,
                        )}
                    </Text>
                )}

                {/* ==================================================
                    VITAL TRENDS
                ================================================== */}

                <View
                    style={
                        styles.sectionHeader
                    }>
                    <View>
                        <Text
                            style={
                                styles.sectionHeaderTitle
                            }>
                            Vital Trends
                        </Text>

                        <Text
                            style={
                                styles.trendsSubtitle
                            }>
                            Last {selectedRange} hour
                            {selectedRange === 1
                                ? ''
                                : 's'} of historical measurements
                        </Text>
                    </View>
                </View>

                <View
                    style={
                        styles.timeRangeContainer
                    }>
                    {TIME_RANGES.map(range => {
                        const isSelected =
                            selectedRange ===
                            range.hours;

                        return (
                            <Pressable
                                key={
                                    range.label
                                }
                                style={[
                                    styles.timeRangeButton,
                                    isSelected &&
                                    styles.timeRangeButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedRange(
                                        range.hours,
                                    )
                                }>
                                <Text
                                    style={[
                                        styles.timeRangeButtonText,
                                        isSelected &&
                                        styles.timeRangeButtonTextSelected,
                                    ]}>
                                    {
                                        range.label
                                    }
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {historyLoading ? (
                    <View
                        style={
                            styles.historyLoadingCard
                        }>
                        <ActivityIndicator
                            size="small"
                        />

                        <Text
                            style={
                                styles.historyLoadingText
                            }>
                            Loading vital history...
                        </Text>
                    </View>
                ) : vitalHistory.length ===
                    0 ? (
                    <View
                        style={
                            styles.emptyCard
                        }>
                        <Text
                            style={
                                styles.emptyText
                            }>
                            No vital history available.
                        </Text>
                    </View>
                ) : (
                    <>
                        <VitalTrendChart
                            title="Heart Rate"
                            unit="bpm"
                            data={
                                heartRateHistory
                            }
                            min={40}
                            max={160}
                        />

                        <VitalTrendChart
                            title="SpO₂"
                            unit="%"
                            data={
                                spo2History
                            }
                            min={80}
                            max={100}
                        />

                        <VitalTrendChart
                            title="Systolic Blood Pressure"
                            unit="mmHg"
                            data={
                                systolicHistory
                            }
                            min={70}
                            max={200}
                        />

                        <VitalTrendChart
                            title="Temperature"
                            unit="°C"
                            data={
                                temperatureHistory
                            }
                            min={34}
                            max={42}
                        />

                        <VitalTrendChart
                            title="Respiratory Rate"
                            unit="breaths/min"
                            data={
                                respiratoryRateHistory
                            }
                            min={5}
                            max={50}
                        />

                        <VitalTrendChart
                            title="Glucose"
                            unit="mg/dL"
                            data={
                                glucoseHistory
                            }
                            min={40}
                            max={300}
                        />
                    </>
                )}

                {/* ==================================================
                    CURRENT CONDITION
                ================================================== */}

                <SectionTitle
                    title="Current Condition"
                />

                <View
                    style={
                        styles.conditionCard
                    }>

                    <Text
                        style={
                            styles.conditionText
                        }>
                        {patient.currentCondition ??
                            'No current condition recorded.'}
                    </Text>

                    {patient.admissionReason && (
                        <>
                            <Text
                                style={
                                    styles.subLabel
                                }>
                                Admission Reason
                            </Text>

                            <Text
                                style={
                                    styles.detailText
                                }>
                                {
                                    patient.admissionReason
                                }
                            </Text>
                        </>
                    )}
                </View>

                {/* ==================================================
                    ADMISSION
                ================================================== */}

                <SectionTitle
                    title="Admission"
                />

                <View
                    style={
                        styles.infoCard
                    }>

                    <InfoRow
                        label="Admission Date"
                        value={formatDateTime(
                            patient.admissionAt,
                        )}
                    />

                    <InfoRow
                        label="Status"
                        value={
                            patient.admissions[0]
                                ?.status ??
                            patient.status
                        }
                    />

                    <InfoRow
                        label="Attending Doctor"
                        value={
                            patient.admissions[0]
                                ?.attendingDoctor
                                ?.name ?? '--'
                        }
                    />

                    <InfoRow
                        label="Reason"
                        value={
                            patient.admissions[0]
                                ?.reason ??
                            patient.admissionReason ??
                            '--'
                        }
                    />
                </View>

                {/* ==================================================
                    DIAGNOSES
                ================================================== */}

                <SectionTitle
                    title="Diagnosis"
                />

                {patient.diagnoses.length ===
                    0 ? (
                    <EmptyCard
                        text="No diagnoses recorded."
                    />
                ) : (
                    patient.diagnoses.map(
                        diagnosis => (
                            <View
                                key={
                                    diagnosis.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <View
                                    style={
                                        styles.listHeader
                                    }>

                                    <Text
                                        style={
                                            styles.listTitle
                                        }>
                                        {
                                            diagnosis.diagnosis
                                        }
                                    </Text>

                                    <View
                                        style={
                                            styles.typeBadge
                                        }>

                                        <Text
                                            style={
                                                styles.typeText
                                            }>
                                            {
                                                diagnosis.type
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    Diagnosed:{' '}
                                    {formatDate(
                                        diagnosis.diagnosedAt,
                                    )}
                                </Text>

                                {diagnosis.notes && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            diagnosis.notes
                                        }
                                    </Text>
                                )}

                                {diagnosis.diagnosedBy && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        By:{' '}
                                        {
                                            diagnosis
                                                .diagnosedBy
                                                .name
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    ALLERGIES
                ================================================== */}

                <SectionTitle
                    title="Allergies"
                />

                {patient.allergies.length ===
                    0 ? (
                    <EmptyCard
                        text="No allergies recorded."
                    />
                ) : (
                    patient.allergies.map(
                        allergy => (
                            <View
                                key={
                                    allergy.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <View
                                    style={
                                        styles.listHeader
                                    }>

                                    <Text
                                        style={
                                            styles.listTitle
                                        }>
                                        {
                                            allergy.allergen
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.allergySeverity
                                        }>
                                        {
                                            allergy.severity
                                        }
                                    </Text>
                                </View>

                                {allergy.reaction && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        Reaction:{' '}
                                        {
                                            allergy.reaction
                                        }
                                    </Text>
                                )}

                                {allergy.notes && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            allergy.notes
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    MEDICATIONS
                ================================================== */}

                <SectionTitle
                    title="Medication Prescription"
                />

                {patient.medications.length ===
                    0 ? (
                    <EmptyCard
                        text="No medications recorded."
                    />
                ) : (
                    patient.medications.map(
                        medication => (
                            <View
                                key={
                                    medication.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <View
                                    style={
                                        styles.listHeader
                                    }>

                                    <Text
                                        style={
                                            styles.listTitle
                                        }>
                                        {
                                            medication.medicineName
                                        }
                                    </Text>

                                    <View
                                        style={
                                            styles.statusPill
                                        }>

                                        <Text
                                            style={
                                                styles.statusPillText
                                            }>
                                            {
                                                medication.status
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={
                                        styles.medicationDose
                                    }>
                                    {
                                        medication.dose ??
                                        '--'
                                    }{' '}
                                    {
                                        medication.unit ??
                                        ''
                                    }
                                </Text>

                                <InfoRow
                                    label="Route"
                                    value={
                                        medication.route ??
                                        '--'
                                    }
                                />

                                <InfoRow
                                    label="Frequency"
                                    value={
                                        medication.frequency ??
                                        '--'
                                    }
                                />

                                <InfoRow
                                    label="Start Date"
                                    value={formatDate(
                                        medication.startDate,
                                    )}
                                />

                                {medication.instructions && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            medication.instructions
                                        }
                                    </Text>
                                )}

                                {medication.prescribedBy && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        Prescribed by:{' '}
                                        {
                                            medication
                                                .prescribedBy
                                                .name
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    MEDICAL HISTORY
                ================================================== */}

                <SectionTitle
                    title="Medical History"
                />

                {patient.medicalHistories.length ===
                    0 ? (
                    <EmptyCard
                        text="No medical history recorded."
                    />
                ) : (
                    patient.medicalHistories.map(
                        history => (
                            <View
                                key={
                                    history.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listTitle
                                    }>
                                    {
                                        history.condition
                                    }
                                </Text>

                                {history.description && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            history.description
                                        }
                                    </Text>
                                )}

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    Diagnosed:{' '}
                                    {formatDate(
                                        history.diagnosedAt,
                                    )}
                                </Text>

                                {history.resolvedAt && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        Resolved:{' '}
                                        {formatDate(
                                            history.resolvedAt,
                                        )}
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    LAB RESULTS
                ================================================== */}

                <SectionTitle
                    title="Laboratory Results"
                />

                {patient.labResults.length ===
                    0 ? (
                    <EmptyCard
                        text="No laboratory results recorded."
                    />
                ) : (
                    patient.labResults.map(
                        lab => (
                            <View
                                key={
                                    lab.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listTitle
                                    }>
                                    {
                                        lab.testName
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.labResult
                                    }>
                                    {
                                        lab.result
                                    }{' '}
                                    {
                                        lab.unit ??
                                        ''
                                    }
                                </Text>

                                {lab.referenceRange && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        Reference:{' '}
                                        {
                                            lab.referenceRange
                                        }
                                    </Text>
                                )}

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    Performed:{' '}
                                    {formatDateTime(
                                        lab.performedAt,
                                    )}
                                </Text>

                                {lab.notes && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            lab.notes
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    PROCEDURES
                ================================================== */}

                <SectionTitle
                    title="Procedures"
                />

                {patient.procedures.length ===
                    0 ? (
                    <EmptyCard
                        text="No procedures recorded."
                    />
                ) : (
                    patient.procedures.map(
                        procedure => (
                            <View
                                key={
                                    procedure.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listTitle
                                    }>
                                    {
                                        procedure.procedureName
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    Performed:{' '}
                                    {formatDateTime(
                                        procedure.performedAt,
                                    )}
                                </Text>

                                {procedure.notes && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            procedure.notes
                                        }
                                    </Text>
                                )}

                                {procedure.performedBy && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        By:{' '}
                                        {
                                            procedure
                                                .performedBy
                                                .name
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    CLINICAL NOTES
                ================================================== */}

                <SectionTitle
                    title="Clinical Notes"
                />

                {patient.clinicalNotes.length ===
                    0 ? (
                    <EmptyCard
                        text="No clinical notes recorded."
                    />
                ) : (
                    patient.clinicalNotes.map(
                        note => (
                            <View
                                key={
                                    note.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listDescription
                                    }>
                                    {
                                        note.note
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    {formatDateTime(
                                        note.createdAt,
                                    )}
                                </Text>

                                {note.author && (
                                    <Text
                                        style={
                                            styles.listMeta
                                        }>
                                        Author:{' '}
                                        {
                                            note.author
                                                .name
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    REFERRALS
                ================================================== */}

                <SectionTitle
                    title="Referral"
                />

                {patient.referrals.length ===
                    0 ? (
                    <EmptyCard
                        text="No referral information recorded."
                    />
                ) : (
                    patient.referrals.map(
                        referral => (
                            <View
                                key={
                                    referral.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listTitle
                                    }>
                                    {
                                        referral
                                            .referringDoctor ??
                                        'Referring doctor'
                                    }
                                </Text>

                                <InfoRow
                                    label="Hospital"
                                    value={
                                        referral
                                            .referringHospital ??
                                        '--'
                                    }
                                />

                                <InfoRow
                                    label="Department"
                                    value={
                                        referral.department ??
                                        '--'
                                    }
                                />

                                <InfoRow
                                    label="Date"
                                    value={formatDate(
                                        referral.referralDate,
                                    )}
                                />

                                {referral.reason && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            referral.reason
                                        }
                                    </Text>
                                )}

                                {referral.notes && (
                                    <Text
                                        style={
                                            styles.listDescription
                                        }>
                                        {
                                            referral.notes
                                        }
                                    </Text>
                                )}
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    CARE TEAM
                ================================================== */}

                <SectionTitle
                    title="Care Team"
                />

                {patient.assignments.length ===
                    0 ? (
                    <EmptyCard
                        text="No active care team assignment."
                    />
                ) : (
                    patient.assignments.map(
                        assignment => (
                            <View
                                key={
                                    assignment.id
                                }
                                style={
                                    styles.listCard
                                }>

                                <Text
                                    style={
                                        styles.listTitle
                                    }>
                                    {
                                        assignment
                                            .user
                                            .name
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    {
                                        assignment
                                            .user
                                            .role
                                    }{' '}
                                    •{' '}
                                    {
                                        assignment
                                            .user
                                            .employeeId
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.listMeta
                                    }>
                                    Assigned:{' '}
                                    {formatDateTime(
                                        assignment.assignedAt,
                                    )}
                                </Text>
                            </View>
                        ),
                    )
                )}

                {/* ==================================================
                    TIMELINE
                ================================================== */}

                <SectionTitle
                    title="Patient Timeline"
                />

                {patient.events.length ===
                    0 ? (
                    <EmptyCard
                        text="No timeline events recorded."
                    />
                ) : (
                    patient.events.map(
                        event => (
                            <View
                                key={
                                    event.id
                                }
                                style={
                                    styles.timelineItem
                                }>

                                <View
                                    style={
                                        styles.timelineDot
                                    }
                                />

                                <View
                                    style={
                                        styles.timelineContent
                                    }>

                                    <View
                                        style={
                                            styles.timelineHeader
                                        }>

                                        <Text
                                            style={
                                                styles.timelineTitle
                                            }>
                                            {
                                                event.title
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.timelineType
                                            }>
                                            {
                                                event.type
                                            }
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.timelineDate
                                        }>
                                        {formatDateTime(
                                            event.occurredAt,
                                        )}
                                    </Text>

                                    {event.description && (
                                        <Text
                                            style={
                                                styles.timelineDescription
                                            }>
                                            {
                                                event.description
                                            }
                                        </Text>
                                    )}

                                    {event.createdBy && (
                                        <Text
                                            style={
                                                styles.timelineDate
                                            }>
                                            By:{' '}
                                            {
                                                event
                                                    .createdBy
                                                    .name
                                            }
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ),
                    )
                )}

                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>
        </SafeAreaView>
    );
};

// ================================================================
// SECTION TITLE
// ================================================================

const SectionTitle = ({
    title,
}: {
    title: string;
}) => (
    <Text
        style={
            styles.sectionTitle
        }>
        {title}
    </Text>
);

// ================================================================
// INFO ROW
// ================================================================

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <View
        style={
            styles.infoRow
        }>

        <Text
            style={
                styles.infoLabel
            }>
            {label}
        </Text>

        <Text
            style={
                styles.infoValue
            }>
            {value}
        </Text>
    </View>
);

// ================================================================
// VITAL CARD
// ================================================================

const VitalCard = ({
    label,
    value,
    unit,
}: {
    label: string;
    value:
    | number
    | string
    | null
    | undefined;
    unit: string;
}) => (
    <View
        style={
            styles.vitalCard
        }>

        <Text
            style={
                styles.vitalLabel
            }>
            {label}
        </Text>

        <Text
            style={
                styles.vitalValue
            }>
            {value ?? '--'}
        </Text>

        <Text
            style={
                styles.vitalUnit
            }>
            {unit}
        </Text>
    </View>
);

// ================================================================
// EMPTY CARD
// ================================================================

const EmptyCard = ({
    text,
}: {
    text: string;
}) => (
    <View
        style={
            styles.emptyCard
        }>

        <Text
            style={
                styles.emptyText
            }>
            {text}
        </Text>
    </View>
);

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FA',
        padding: 24,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#667085',
    },

    errorTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#101828',
    },

    errorText: {
        marginTop: 8,
        color: '#667085',
        textAlign: 'center',
    },

    backButton: {
        marginTop: 20,
        backgroundColor: '#175CD3',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    backCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    backArrow: {
        fontSize: 30,
        lineHeight: 32,
        color: '#101828',
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 25,
        fontWeight: '800',
        color: '#101828',
    },

    subtitle: {
        marginTop: 3,
        color: '#667085',
        fontSize: 14,
    },

    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#ECFDF3',
    },

    delayedBadge: {
        backgroundColor: '#FFFAEB',
    },

    noDataBadge: {
        backgroundColor: '#F2F4F7',
    },

    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#12B76A',
        marginRight: 6,
    },

    delayedDot: {
        backgroundColor: '#F79009',
    },

    noDataDot: {
        backgroundColor: '#98A2B3',
    },

    liveText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#027A48',
    },

    delayedText: {
        color: '#B54708',
    },

    noDataText: {
        color: '#667085',
    },

    identityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#E8F1FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#175CD3',
    },

    identityInfo: {
        flex: 1,
        marginLeft: 14,
    },

    patientName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#101828',
    },

    patientNumber: {
        marginTop: 3,
        color: '#667085',
        fontSize: 13,
    },

    identityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    metaText: {
        color: '#475467',
        fontSize: 12,
    },

    metaDivider: {
        marginHorizontal: 6,
        color: '#98A2B3',
    },

    activeBadge: {
        backgroundColor: '#ECFDF3',
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 6,
    },

    activeText: {
        color: '#027A48',
        fontSize: 10,
        fontWeight: '800',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#101828',
        marginTop: 22,
        marginBottom: 10,
    },

    sectionHeader: {
        marginTop: 22,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#101828',
    },

    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
    },

    infoLabel: {
        flex: 1,
        color: '#667085',
        fontSize: 13,
    },

    infoValue: {
        flex: 1.5,
        textAlign: 'right',
        color: '#101828',
        fontSize: 13,
        fontWeight: '600',
    },

    liveSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    delayedSmall: {
        backgroundColor: '#FFFAEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },

    noDataSmall: {
        backgroundColor: '#F2F4F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },

    liveSmallText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#027A48',
    },

    vitalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    vitalCard: {
        width: '31.8%',
        minHeight: 105,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 12,
        justifyContent: 'center',
    },

    vitalLabel: {
        fontSize: 11,
        color: '#667085',
    },

    vitalValue: {
        marginTop: 6,
        fontSize: 22,
        fontWeight: '800',
        color: '#101828',
    },

    vitalUnit: {
        marginTop: 2,
        fontSize: 10,
        color: '#98A2B3',
    },

    lastUpdated: {
        marginTop: 8,
        color: '#98A2B3',
        fontSize: 11,
        textAlign: 'right',
    },

    trendsSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: '#667085',
    },

    historyLoadingCard: {
        minHeight: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },

    historyLoadingText: {
        marginTop: 8,
        fontSize: 13,
        color: '#667085',
    },

    timeRangeContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E4E7EC',
    },

    timeRangeButton: {
        flex: 1,
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
        paddingHorizontal: 8,
    },

    timeRangeButtonSelected: {
        backgroundColor: '#EEF4FF',
    },

    timeRangeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#667085',
    },

    timeRangeButtonTextSelected: {
        color: '#175CD3',
    },

    alertSection: {
        marginBottom: 2,
    },

    alertSectionHeader: {
        marginTop: 18,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    alertSectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#101828',
    },

    alertCountBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: 8,
        paddingHorizontal: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F04438',
    },

    alertCountText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },

    alertCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#D0D5DD',
    },

    alertCardCritical: {
        borderColor: '#FDA29B',
        backgroundColor: '#FFFBFA',
    },

    alertCardWarning: {
        borderColor: '#FEC84B',
        backgroundColor: '#FFFCF5',
    },

    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    alertSeverityBadge: {
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
        backgroundColor: '#F2F4F7',
    },

    alertSeverityCritical: {
        backgroundColor: '#FEF3F2',
    },

    alertSeverityWarning: {
        backgroundColor: '#FFFAEB',
    },

    alertSeverityText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#475467',
    },

    alertSeverityCriticalText: {
        color: '#B42318',
    },

    alertSeverityWarningText: {
        color: '#B54708',
    },

    alertDismissButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F4F7',
    },

    alertDismissText: {
        fontSize: 22,
        lineHeight: 24,
        color: '#667085',
    },

    alertTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '800',
        color: '#101828',
        textTransform: 'capitalize',
    },

    alertMessage: {
        marginTop: 5,
        fontSize: 12,
        lineHeight: 18,
        color: '#475467',
    },

    alertMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EAECF0',
    },

    alertMetric: {
        flex: 1,
    },

    alertMetricDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#EAECF0',
        marginHorizontal: 12,
    },

    alertMetricLabel: {
        fontSize: 10,
        color: '#667085',
    },

    alertMetricValue: {
        marginTop: 3,
        fontSize: 19,
        fontWeight: '800',
        color: '#101828',
    },

    alertTime: {
        marginTop: 10,
        fontSize: 10,
        color: '#98A2B3',
    },

    conditionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },

    conditionText: {
        color: '#101828',
        fontSize: 14,
        lineHeight: 21,
    },

    subLabel: {
        marginTop: 16,
        fontSize: 12,
        color: '#667085',
        fontWeight: '700',
    },

    detailText: {
        marginTop: 5,
        color: '#344054',
        fontSize: 13,
        lineHeight: 19,
    },

    listCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    listTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#101828',
    },

    listMeta: {
        marginTop: 7,
        fontSize: 11,
        color: '#667085',
    },

    listDescription: {
        marginTop: 9,
        fontSize: 13,
        lineHeight: 19,
        color: '#344054',
    },

    typeBadge: {
        backgroundColor: '#EEF4FF',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },

    typeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#175CD3',
    },

    allergySeverity: {
        fontSize: 10,
        fontWeight: '800',
        color: '#B42318',
    },

    statusPill: {
        backgroundColor: '#ECFDF3',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },

    statusPillText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#027A48',
    },

    medicationDose: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: '800',
        color: '#175CD3',
    },

    labResult: {
        marginTop: 8,
        fontSize: 21,
        fontWeight: '800',
        color: '#101828',
    },

    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
    },

    emptyText: {
        color: '#98A2B3',
        fontSize: 13,
    },

    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },

    timelineDot: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#175CD3',
        marginTop: 5,
        marginRight: 12,
    },

    timelineContent: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
    },

    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    timelineTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#101828',
    },

    timelineType: {
        marginLeft: 8,
        fontSize: 9,
        fontWeight: '800',
        color: '#175CD3',
    },

    timelineDate: {
        marginTop: 4,
        fontSize: 11,
        color: '#667085',
    },

    timelineDescription: {
        marginTop: 8,
        fontSize: 12,
        lineHeight: 18,
        color: '#475467',
    },

    demoNotice: {
        backgroundColor: '#EEF4FF',
        borderRadius: 14,
        padding: 14,
        marginTop: 10,
    },

    demoNoticeTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#175CD3',
    },

    demoNoticeText: {
        marginTop: 4,
        fontSize: 11,
        lineHeight: 17,
        color: '#475467',
    },

    bottomSpace: {
        height: 20,
    },
});

export default PatientDetailScreen;