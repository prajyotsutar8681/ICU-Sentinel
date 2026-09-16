import { io } from 'socket.io-client';

const patientId = 'fd8ec570-eb5c-469b-b5e4-ba43f243ed96';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Connected to ICU Sentinel WebSocket');
    console.log(`👤 Joining patient: ${patientId}`);

    socket.emit('join_patient', patientId);
});

socket.on('joined_patient', (data) => {
    console.log('✅ Joined patient room:', data);
});

socket.on('vital_update', (vital) => {
    console.log('💓 LIVE VITAL RECEIVED:');
    console.log(vital);
});

socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection failed:', error.message);
});

socket.on('disconnect', () => {
    console.log('🔌 Disconnected from WebSocket');
});