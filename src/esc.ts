import MotorManager from './motor';
import * as servoblaster from 'servoblaster';
import { writeFile, createWriteStream, WriteStream } from "fs";

export default class ESCController implements MotorManager {
    
    ESC_PIN: number = 1;
    escStream: WriteStream;
    isWriting: boolean = false;

    curSpeed: string = '0';

    speedToPwm = {
        '-1': 140,
        '0': 150,
        '1': 160,
        '2': 170,
        '3': 180
    };

    constructor(private ws: WebSocket) {
        console.log('Creating esc controller');
        this.escStream = servoblaster.createWriteStream(this.ESC_PIN);
    }

    calibrate() {
        console.log('ESC : calibrate()');
        if (!this.isWriting) {
            this.curSpeed = '0';
            this.isWriting = true;
            this.escStream.write(150, () => {
                this.isWriting = false;
            });
        } else {
            console.log('Error : stream is in use');
        }
    }

    setPwm(speed: string) {
        console.log('setPwm()', speed);
        if (speed === this.curSpeed) {
            return;
        }
        if (!this.isWriting) {
            this.isWriting = true;
            this.escStream.write(this.speedToPwm[speed], () => {
                this.isWriting = false;
                this.curSpeed = speed;
                this.ws.send(JSON.stringify({
                    motor: 'esc',
                    speed: this.curSpeed
                }));
            });
        }
    }
}