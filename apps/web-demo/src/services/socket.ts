import {
    io,
    Socket,
} from 'socket.io-client';

import {
    API_BASE_URL,
} from './api';

class SocketService {

    private socket:
        Socket | null = null;

    connect() {

        if (this.socket) {
            return this.socket;
        }

        if (!API_BASE_URL) {
            throw new Error(
                'No backend configured for Socket.IO',
            );
        }

        this.socket = io(
            API_BASE_URL,
            {
                transports: [
                    'websocket',
                ],

                autoConnect: true,
            },
        );

        this.socket.on(
            'connect_error',
            error => {
                console.warn(
                    'Socket connection failed:',
                    error.message,
                );
            },
        );

        return this.socket;
    }

    joinPatient(
        patientId: string,
    ) {

        if (!this.socket) {
            this.connect();
        }

        if (!this.socket) {
            return;
        }

        if (this.socket.connected) {

            this.socket.emit(
                'join_patient',
                patientId,
            );

        } else {

            this.socket.once(
                'connect',
                () => {

                    this.socket?.emit(
                        'join_patient',
                        patientId,
                    );

                },
            );
        }
    }

    disconnect() {

        this.socket?.disconnect();

        this.socket = null;
    }
}

export default new SocketService();