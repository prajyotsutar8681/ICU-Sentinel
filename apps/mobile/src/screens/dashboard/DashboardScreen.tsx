import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import socketService from '../../services/socketService';

const PATIENT_ID = 'fd8ec570-eb5c-469b-b5e4-ba43f243ed96';

type Vital = {
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    spo2?: number;
    temperature?: number;
    respiratoryRate?: number;
    glucose?: number;
};

const DashboardScreen = () => {
    const [vital, setVital] = useState<Vital | null>(null);

    useEffect(() => {
        const socket = socketService.connect();

        socketService.joinPatient(PATIENT_ID);

        const handleVitalUpdate = (newVital: Vital) => {
            console.log('💓 Dashboard received vital:', newVital);
            setVital(newVital);
        };

        socket.on('vital_update', handleVitalUpdate);

        return () => {
            socket.off('vital_update', handleVitalUpdate);
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>ICU Sentinel</Text>
            <Text style={styles.subtitle}>Live ICU Monitoring</Text>

            <View style={styles.card}>
                <Text style={styles.patient}>Demo Patient</Text>
                <Text style={styles.bed}>Bed B01 • Main ICU</Text>

                <View style={styles.vitalRow}>
                    <View style={styles.vitalBox}>
                        <Text style={styles.label}>Heart Rate</Text>
                        <Text style={styles.value}>
                            {vital?.heartRate ?? '--'}
                        </Text>
                        <Text style={styles.unit}>bpm</Text>
                    </View>

                    <View style={styles.vitalBox}>
                        <Text style={styles.label}>SpO₂</Text>
                        <Text style={styles.value}>
                            {vital?.spo2 ?? '--'}
                        </Text>
                        <Text style={styles.unit}>%</Text>
                    </View>
                </View>

                <View style={styles.vitalRow}>
                    <View style={styles.vitalBox}>
                        <Text style={styles.label}>Blood Pressure</Text>
                        <Text style={styles.value}>
                            {vital?.systolicBP ?? '--'}/
                            {vital?.diastolicBP ?? '--'}
                        </Text>
                        <Text style={styles.unit}>mmHg</Text>
                    </View>

                    <View style={styles.vitalBox}>
                        <Text style={styles.label}>Temperature</Text>
                        <Text style={styles.value}>
                            {vital?.temperature ?? '--'}
                        </Text>
                        <Text style={styles.unit}>°C</Text>
                    </View>
                </View>

                <Text style={styles.status}>
                    {vital ? '● LIVE' : '○ Waiting for vitals...'}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
        color: '#667085',
    },
    card: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
    },
    patient: {
        fontSize: 22,
        fontWeight: '700',
    },
    bed: {
        marginTop: 4,
        color: '#667085',
    },
    vitalRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    vitalBox: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
    },
    label: {
        fontSize: 13,
        color: '#667085',
    },
    value: {
        marginTop: 6,
        fontSize: 25,
        fontWeight: '700',
    },
    unit: {
        marginTop: 2,
        color: '#667085',
    },
    status: {
        marginTop: 20,
        fontWeight: '700',
    },
});

export default DashboardScreen;