import React, { useEffect, useState } from 'react';
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

import {
    RootStackParamList,
} from '../../navigation/AppNavigator';

import socketService from '../../services/socketService';

const ICU_ID =
    'fd08a170-42c3-4989-8b63-bf61c7295cd5';

const API_URL = 'https://icu-sentinel.onrender.com';;

type Props = NativeStackScreenProps<
    RootStackParamList,
    'IcuOverview'
>;

type Vital = {
    patientId?: string;
    heartRate: number | null;
    systolicBP: number | null;
    diastolicBP: number | null;
    spo2: number | null;
    temperature: number | null;
    respiratoryRate: number | null;
    glucose: number | null;
    recordedAt: string;
};

type Patient = {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
    status: string;
    latestVital: Vital | null;
};

type Bed = {
    id: string;
    bedNumber: string;
    status: string;
    patient: Patient | null;
};

type IcuOverview = {
    id: string;
    name: string;
    code: string;
    beds: Bed[];
};

const IcuOverviewScreen = ({
    navigation,
}: Props) => {
    const [
        icu,
        setIcu,
    ] = useState<IcuOverview | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    useEffect(() => {
        const socket =
            socketService.connect();

        // ======================================================
        // LIVE VITAL UPDATE
        // ======================================================

        const handleVitalUpdate = (
            newVital: Vital,
        ) => {
            console.log(
                '💓 ICU Overview received vital:',
                newVital,
            );

            if (!newVital.patientId) {
                return;
            }

            setIcu(currentIcu => {
                if (!currentIcu) {
                    return currentIcu;
                }

                return {
                    ...currentIcu,

                    beds: currentIcu.beds.map(
                        bed => {
                            const patient =
                                bed.patient;

                            if (
                                !patient ||
                                patient.id !==
                                newVital.patientId
                            ) {
                                return bed;
                            }

                            return {
                                ...bed,

                                patient: {
                                    ...patient,

                                    latestVital:
                                        newVital,
                                },
                            };
                        },
                    ),
                };
            });
        };

        socket.on(
            'vital_update',
            handleVitalUpdate,
        );

        // ======================================================
        // LOAD ICU OVERVIEW
        // ======================================================

        const loadOverview =
            async () => {
                try {
                    setError(null);

                    const response =
                        await fetch(
                            `${API_URL}/icus/${ICU_ID}/overview`,
                        );

                    if (!response.ok) {
                        throw new Error(
                            `Server returned ${response.status}`,
                        );
                    }

                    const data: IcuOverview =
                        await response.json();

                    setIcu(data);

                    // Join WebSocket room for every
                    // active patient in this ICU.
                    data.beds.forEach(
                        bed => {
                            if (
                                bed.patient
                            ) {
                                socketService.joinPatient(
                                    bed.patient.id,
                                );
                            }
                        },
                    );
                } catch (err) {
                    console.error(
                        'Failed to load ICU overview:',
                        err,
                    );

                    setError(
                        'Unable to load ICU data',
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadOverview();

        return () => {
            socket.off(
                'vital_update',
                handleVitalUpdate,
            );
        };
    }, []);

    // ==========================================================
    // SUMMARY
    // ==========================================================

    const occupiedBeds =
        icu?.beds.filter(
            bed =>
                bed.status ===
                'OCCUPIED',
        ).length ?? 0;

    // Alert engine will replace this later.
    const criticalCount = 0;

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
                    Loading ICU...
                </Text>
            </SafeAreaView>
        );
    }

    // ==========================================================
    // ERROR
    // ==========================================================

    if (error || !icu) {
        return (
            <SafeAreaView
                style={
                    styles.center
                }>

                <Text
                    style={
                        styles.errorTitle
                    }>
                    Unable to load ICU
                </Text>

                <Text
                    style={
                        styles.errorText
                    }>
                    {error ??
                        'No ICU data available'}
                </Text>
            </SafeAreaView>
        );
    }

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

                    <View>
                        <Text
                            style={
                                styles.title
                            }>
                            {icu.name}
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }>
                            {icu.code}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.liveBadge
                        }>

                        <View
                            style={
                                styles.liveDot
                            }
                        />

                        <Text
                            style={
                                styles.liveText
                            }>
                            LIVE
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                    SUMMARY
                ================================================== */}

                <View
                    style={
                        styles.summaryRow
                    }>

                    <View
                        style={
                            styles.summaryCard
                        }>

                        <Text
                            style={
                                styles.summaryValue
                            }>
                            {
                                icu.beds
                                    .length
                            }
                        </Text>

                        <Text
                            style={
                                styles.summaryLabel
                            }>
                            Total Beds
                        </Text>
                    </View>

                    <View
                        style={
                            styles.summaryCard
                        }>

                        <Text
                            style={
                                styles.summaryValue
                            }>
                            {occupiedBeds}
                        </Text>

                        <Text
                            style={
                                styles.summaryLabel
                            }>
                            Occupied
                        </Text>
                    </View>

                    <View
                        style={
                            styles.summaryCard
                        }>

                        <Text
                            style={
                                styles.summaryValue
                            }>
                            {criticalCount}
                        </Text>

                        <Text
                            style={
                                styles.summaryLabel
                            }>
                            Critical
                        </Text>
                    </View>
                </View>

                {/* ==================================================
                    PATIENTS
                ================================================== */}

                <Text
                    style={
                        styles.sectionTitle
                    }>
                    Patients
                </Text>

                {icu.beds.map(
                    bed => {
                        const patient =
                            bed.patient;

                        const vital =
                            patient?.latestVital;

                        return (
                            <View
                                key={
                                    bed.id
                                }
                                style={
                                    styles.bedCard
                                }>

                                {/* ======================================
                                    BED HEADER
                                ====================================== */}

                                <View
                                    style={
                                        styles.bedHeader
                                    }>

                                    <Text
                                        style={
                                            styles.bedNumber
                                        }>
                                        Bed{' '}
                                        {
                                            bed.bedNumber
                                        }
                                    </Text>

                                    <View
                                        style={[
                                            styles.statusBadge,

                                            bed.status ===
                                                'OCCUPIED'
                                                ? styles.occupiedBadge
                                                : styles.availableBadge,
                                        ]}>

                                        <Text
                                            style={
                                                styles.statusText
                                            }>
                                            {
                                                bed.status
                                            }
                                        </Text>
                                    </View>
                                </View>

                                {/* ======================================
                                    PATIENT
                                ====================================== */}

                                {patient ? (
                                    <Pressable
                                        onPress={() =>
                                            navigation.navigate(
                                                'PatientDetail',
                                                {
                                                    patientId:
                                                        patient.id,
                                                },
                                            )
                                        }
                                        style={({
                                            pressed,
                                        }) => [
                                                styles.patientContent,

                                                pressed &&
                                                styles.patientContentPressed,
                                            ]}>

                                        {/* ==============================
                                            PATIENT INFORMATION
                                        ============================== */}

                                        <View
                                            style={
                                                styles.patientInfo
                                            }>

                                            <View
                                                style={
                                                    styles.patientAvatar
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
                                                    styles.patientTextContainer
                                                }>

                                                <Text
                                                    style={
                                                        styles.patientName
                                                    }>
                                                    {
                                                        patient.firstName
                                                    }{' '}
                                                    {
                                                        patient.lastName
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.patientNumber
                                                    }>
                                                    {
                                                        patient.patientNumber
                                                    }
                                                </Text>
                                            </View>

                                            <Text
                                                style={
                                                    styles.viewArrow
                                                }>
                                                ›
                                            </Text>
                                        </View>

                                        {/* ==============================
                                            LIVE VITALS
                                        ============================== */}

                                        {vital ? (
                                            <View
                                                style={
                                                    styles.vitalsGrid
                                                }>

                                                <VitalCard
                                                    label="HR"
                                                    value={
                                                        vital.heartRate
                                                    }
                                                    unit="bpm"
                                                />

                                                <VitalCard
                                                    label="SpO₂"
                                                    value={
                                                        vital.spo2
                                                    }
                                                    unit="%"
                                                />

                                                <VitalCard
                                                    label="BP"
                                                    value={
                                                        vital.systolicBP !==
                                                            null &&
                                                            vital.diastolicBP !==
                                                            null
                                                            ? `${vital.systolicBP}/${vital.diastolicBP}`
                                                            : '--'
                                                    }
                                                    unit="mmHg"
                                                />

                                                <VitalCard
                                                    label="Temp"
                                                    value={
                                                        vital.temperature
                                                    }
                                                    unit="°C"
                                                />

                                                <VitalCard
                                                    label="RR"
                                                    value={
                                                        vital.respiratoryRate
                                                    }
                                                    unit="/min"
                                                />

                                                <VitalCard
                                                    label="Glucose"
                                                    value={
                                                        vital.glucose
                                                    }
                                                    unit="mg/dL"
                                                />
                                            </View>
                                        ) : (
                                            <Text
                                                style={
                                                    styles.noVitals
                                                }>
                                                No vital data
                                                available
                                            </Text>
                                        )}

                                        {/* ==============================
                                            DETAIL HINT
                                        ============================== */}

                                        <Text
                                            style={
                                                styles.tapHint
                                            }>
                                            Tap patient to view
                                            complete details
                                        </Text>
                                    </Pressable>
                                ) : (
                                    // ==================================
                                    // AVAILABLE BED
                                    // ==================================

                                    <View
                                        style={
                                            styles.emptyBed
                                        }>

                                        <Text
                                            style={
                                                styles.emptyText
                                            }>
                                            Bed available
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// ================================================================
// VITAL CARD
// ================================================================

type VitalCardProps = {
    label: string;
    value:
    | number
    | string
    | null;
    unit: string;
};

const VitalCard = ({
    label,
    value,
    unit,
}: VitalCardProps) => {
    return (
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

            <View
                style={
                    styles.vitalValueRow
                }>

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
        </View>
    );
};

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
    },

    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#667085',
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#101828',
    },

    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#667085',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#101828',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#667085',
    },

    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#ECFDF3',
    },

    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#12B76A',
        marginRight: 6,
    },

    liveText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#027A48',
    },

    summaryRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },

    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 15,
    },

    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#101828',
    },

    summaryLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#667085',
    },

    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#101828',
        marginBottom: 12,
    },

    bedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
    },

    bedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    bedNumber: {
        fontSize: 17,
        fontWeight: '800',
        color: '#101828',
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 12,
    },

    occupiedBadge: {
        backgroundColor: '#FEF3F2',
    },

    availableBadge: {
        backgroundColor: '#F2F4F7',
    },

    statusText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#667085',
    },

    patientContent: {
        borderRadius: 12,
    },

    patientContentPressed: {
        opacity: 0.7,
    },

    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    patientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0EAFF',
        marginRight: 12,
    },

    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#175CD3',
    },

    patientTextContainer: {
        flex: 1,
    },

    patientName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#101828',
    },

    patientNumber: {
        marginTop: 3,
        fontSize: 12,
        color: '#667085',
    },

    viewArrow: {
        fontSize: 30,
        color: '#98A2B3',
        marginLeft: 8,
    },

    vitalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    vitalCard: {
        width: '31.5%',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
    },

    vitalLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#667085',
    },

    vitalValueRow: {
        marginTop: 5,
    },

    vitalValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#101828',
    },

    vitalUnit: {
        marginTop: 1,
        fontSize: 9,
        color: '#98A2B3',
    },

    tapHint: {
        marginTop: 12,
        fontSize: 11,
        color: '#175CD3',
        fontWeight: '600',
    },

    noVitals: {
        fontSize: 13,
        color: '#98A2B3',
    },

    emptyBed: {
        paddingVertical: 12,
    },

    emptyText: {
        fontSize: 14,
        color: '#98A2B3',
    },
});

export default IcuOverviewScreen;