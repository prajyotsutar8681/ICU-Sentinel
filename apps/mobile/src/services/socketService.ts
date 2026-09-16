import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://10.0.2.2:3000';

export type AlertPayload = {
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

class SocketService {
    private socket: Socket | null = null;

    connect() {
        /*
         * IMPORTANT:
         * Reuse the same socket even if it is still connecting.
         * This prevents multiple socket connections and duplicate
         * patient-room joins.
         */
        if (this.socket) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log(
                '✅ Mobile connected to ICU Sentinel WebSocket',
            );
        });

        this.socket.on('disconnect', reason => {
            console.log(
                '🔌 Mobile disconnected from WebSocket:',
                reason,
            );
        });

        this.socket.on('connect_error', error => {
            console.error(
                '❌ WebSocket connection error:',
                error.message,
            );
        });

        return this.socket;
    }

    joinPatient(patientId: string) {
        const socket = this.connect();

        if (!socket.connected) {
            /*
             * If the socket is still connecting, wait for the
             * connection before joining the patient room.
             */
            socket.once('connect', () => {
                socket.emit(
                    'join_patient',
                    patientId,
                );

                console.log(
                    '👨‍⚕️ Joined patient after socket connection:',
                    patientId,
                );
            });

            return;
        }

        socket.emit(
            'join_patient',
            patientId,
        );

        console.log(
            '👨‍⚕️ Joining patient room:',
            patientId,
        );
    }

    onVitalUpdate(
        callback: (vital: any) => void,
    ) {
        const socket = this.connect();

        socket.on(
            'vital_update',
            callback,
        );
    }

    removeVitalListener(
        callback: (vital: any) => void,
    ) {
        this.socket?.off(
            'vital_update',
            callback,
        );
    }

    onAlertCreated(
        callback: (alert: AlertPayload) => void,
    ) {
        const socket = this.connect();

        socket.on(
            'alert_created',
            callback,
        );
    }

    removeAlertListener(
        callback: (alert: AlertPayload) => void,
    ) {
        this.socket?.off(
            'alert_created',
            callback,
        );
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();