import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class VitalsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`🩺 Doctor connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`🔌 Doctor disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_patient')
    handleJoinPatient(
        @ConnectedSocket() client: Socket,
        @MessageBody() patientId: string,
    ) {
        const room = `patient:${patientId}`;

        void client.join(room);

        console.log(
            `👨‍⚕️ Doctor ${client.id} joined patient room: ${patientId}`,
        );

        return {
            event: 'joined_patient',
            patientId,
        };
    }

    emitVitalUpdate(
        patientId: string,
        vital: unknown,
    ) {
        const room = `patient:${patientId}`;

        this.server
            .to(room)
            .emit('vital_update', vital);
    }

    emitAlert(
        patientId: string,
        alert: unknown,
    ) {
        const room = `patient:${patientId}`;

        console.log(
            `🚨 Sending alert to patient room: ${patientId}`,
        );

        this.server
            .to(room)
            .emit('alert_created', alert);
    }
}