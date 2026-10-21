/*
Copyright (C): 2010-2019, Shenzhen Yahboom Tech
modified from liusen
load dependency
"Tinybit": "file:../pxt-Tinybit"
*/

//% color="#006400" weight=20 icon="\uf1b9"
namespace Tinybit {

    const PWM_ADD = 0x01
    const MOTOR = 0x02
    const RGB = 0x01
    
    // ===== 车身彩灯：2 颗 WS2812B，接 P12 =====
    // 直接用 micro:bit 内核自带的 light.sendWS2812Buffer 驱动，
    // 不再依赖 neopixel 扩展，因此不会出现 sendBufferAsm 标签重定义。
    const WS_PIN = DigitalPin.P12
    const WS_LEDS = 2
    let wsBuf: Buffer;
    let wsHue = 0

    function wsShow(): void {
        if (!wsBuf) {
            wsBuf = pins.createBuffer(WS_LEDS * 3)
        }
        light.sendWS2812Buffer(wsBuf, WS_PIN)
    }

    function wsSetLed(i: number, r: number, g: number, b: number): void {
        wsBuf[3 * i + 0] = g
        wsBuf[3 * i + 1] = r
        wsBuf[3 * i + 2] = b
    }

    function wsHsv(h: number, s: number, v: number): number[] {
        const c = v * s / 10000
        const hh = h / 60
        const x = c * (1 - Math.abs((hh % 2) - 1))
        let r = 0
        let g = 0
        let b = 0
        if (hh < 1) {
            r = c
            g = x
        } else if (hh < 2) {
            r = x
            g = c
        } else if (hh < 3) {
            g = c
            b = x
        } else if (hh < 4) {
            g = x
            b = c
        } else if (hh < 5) {
            r = x
            b = c
        } else {
            r = c
            b = x
        }
        const m = v / 100 - c
        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ]
    }

    export enum enColor {

        //% blockId="OFF" block="灭"
        OFF = 0,
        //% blockId="Red" block="红色"
        Red,
        //% blockId="Green" block="绿色"
        Green,
        //% blockId="Blue" block="蓝色"
        Blue,
        //% blockId="White" block="白色"
        White,
        //% blockId="Cyan" block="青色"
        Cyan,
        //% blockId="Pinkish" block="品红"
        Pinkish,
        //% blockId="Yellow" block="黄色"
        Yellow,

    }
    export enum enMusic {

        //% blockId="dadadum" block="哒哒哒"
        dadadum = 0,
        //% blockId="entertainer" block="卖艺人"
        entertainer,
        //% blockId="prelude" block="前奏曲"
        prelude,
        //% blockId="ode" block="欢乐颂"
        ode,
        //% blockId="nyan" block="彩虹猫"
        nyan,
        //% blockId="ringtone" block="铃声"
        ringtone,
        //% blockId="funk" block="放克"
        funk,
        //% blockId="blues" block="蓝调"
        blues,
        //% blockId="birthday" block="生日歌"
        birthday,
        //% blockId="wedding" block="婚礼进行曲"
        wedding,
        //% blockId="funereal" block="葬礼进行曲"
        funereal,
        //% blockId="punchline" block="笑点"
        punchline,
        //% blockId="baddy" block="坏人登场"
        baddy,
        //% blockId="chase" block="追逐"
        chase,
        //% blockId="ba_ding" block="叮咚"
        ba_ding,
        //% blockId="wawawawaa" block="哇哇哇"
        wawawawaa,
        //% blockId="jump_up" block="跳跃上升"
        jump_up,
        //% blockId="jump_down" block="跳跃下降"
        jump_down,
        //% blockId="power_up" block="升级"
        power_up,
        //% blockId="power_down" block="降级"
        power_down

    }
    export enum enPos {

        //% blockId="LeftState" block="左边"
        LeftState = 0,
        //% blockId="RightState" block="右边"
        RightState = 1
    }

    export enum enLineState {
        //% blockId="White" block="白线"
        White = 0,
        //% blockId="Black" block="黑线"
        Black = 1
    }
    
    
    export enum CarState {
        //% blockId="Car_Run" block="前进"
        Car_Run = 1,
        //% blockId="Car_Back" block="后退"
        Car_Back = 2,
        //% blockId="Car_Left" block="左转"
        Car_Left = 3,
        //% blockId="Car_Right" block="右转"
        Car_Right = 4,
        //% blockId="Car_Stop" block="停止"
        Car_Stop = 5,
        //% blockId="Car_SpinLeft" block="原地左旋"
        Car_SpinLeft = 6,
        //% blockId="Car_SpinRight" block="原地右旋"
        Car_SpinRight = 7
    }

    function setPwmRGB(red: number, green: number, blue: number): void {

        let buf = pins.createBuffer(4);
        buf[0] = RGB;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;
        
        pins.i2cWriteBuffer(PWM_ADD, buf);
    }

    let car_flag_old = 0; //0：两电机正转 1：两电机反转 2:左旋 3：右旋
    let car_flag_new = 0; //0：两电机正转 1：两电机反转 2:左旋 3：右旋
    function setPwmMotor(mode: number, speed1: number, speed2: number): void {
        if (mode < 0 || mode > 6)
            return;
        
        let buf = pins.createBuffer(5);
        buf[0] = MOTOR;
        switch (mode) { 
            case 0: buf[1] = 0; buf[2] = 0; buf[3] = 0; buf[4] = 0; break;              //stop
            case 1: buf[1] = speed1; buf[2] = 0; buf[3] = speed2; buf[4] = 0; car_flag_new = 0; break;    //run
            case 2: buf[1] = 0; buf[2] = speed1; buf[3] = 0; buf[4] = speed2; car_flag_new = 1; break;    //back
            case 3: buf[1] = 0; buf[2] = 0; buf[3] = speed2; buf[4] = 0; car_flag_new = 0;      break;    //left
            case 4: buf[1] = speed1; buf[2] = 0; buf[3] = 0; buf[4] = 0; car_flag_new = 0;      break;    //right
            case 5: buf[1] = 0; buf[2] = speed1; buf[3] = speed2; buf[4] = 0; car_flag_new = 2; break;    //tleft
            case 6: buf[1] = speed1; buf[2] = 0; buf[3] = 0; buf[4] = speed2; car_flag_new = 3; break;    //tright
        }
        if(car_flag_new != car_flag_old) //上一次状态是正转，这次是反转
        {
            let bufff = pins.createBuffer(5);
            bufff[0] = MOTOR;
            bufff[1] = 0; bufff[2] = 0; bufff[3] = 0; bufff[4] = 0;
            pins.i2cWriteBuffer(PWM_ADD, buf);//停止100ms
            basic.pause(100);
            car_flag_old = car_flag_new;
        }
        pins.i2cWriteBuffer(PWM_ADD, buf);
    }

    function Car_run(speed1: number, speed2: number) {


        setPwmMotor(1, speed1, speed2);
    }

    function Car_back(speed1: number, speed2: number) {

        setPwmMotor(2, speed1, speed2);
    }

    function Car_left(speed1: number, speed2: number) {

        setPwmMotor(3, speed1, speed2);
    }

    function Car_right(speed1: number, speed2: number) {

        setPwmMotor(4, speed1, speed2);
    }

    function Car_stop() {
       
        setPwmMotor(0, 0, 0);
    }

    function Car_spinleft(speed1: number, speed2: number) {

        setPwmMotor(5, speed1, speed2);
    } 

    function Car_spinright(speed1: number, speed2: number) {

        setPwmMotor(6, speed1, speed2);
    }

    /**
     * *****************************************************************
     * @param index
     */   

    //% blockId=Tinybit_RGB_Car_Program block="车身七彩流水灯"
    //% weight=99
    //% blockGap=10
    //% color="#006400"
    export function RGB_Car_Program(): void {
        if (!wsBuf) {
            wsBuf = pins.createBuffer(WS_LEDS * 3)
        }
        for (let i = 0; i < WS_LEDS; i++) {
            const c = wsHsv((wsHue + i * 180) % 360, 100, 100)
            wsSetLed(i, c[0], c[1], c[2])
        }
        wsHue = (wsHue + 60) % 360
        wsShow()
    }

    //% blockId=Tinybit_RGB_Car_Big block="小车RGB探照灯|选择车灯颜色 %value"
    //% weight=98
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Big(value: enColor): void {

        switch (value) {
            case enColor.OFF: {
                setPwmRGB(0, 0, 0);
                break;
            }
            case enColor.Red: {
                setPwmRGB(255, 0, 0);
                break;
            }
            case enColor.Green: {
                setPwmRGB(0, 255, 0);
                break;
            }
            case enColor.Blue: {
                setPwmRGB(0, 0, 255);
                break;
            }
            case enColor.White: {
                setPwmRGB(255, 255, 255);
                break;
            }
            case enColor.Cyan: {
                setPwmRGB(0, 255, 255);
                break;
            }
            case enColor.Pinkish: {
                setPwmRGB(255, 0, 255);
                break;
            }
            case enColor.Yellow: {
                setPwmRGB(255, 255, 0);
                break;
            }
        }
    }
    //% blockId=Tinybit_RGB_Car_Big2 block="小车RGB探照灯|红色 %value1|绿色 %value2|蓝色 %value3"
    //% weight=97
    //% blockGap=10
    //% value1.min=0 value1.max=255 value2.min=0 value2.max=255 value3.min=0 value3.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Big2(value1: number, value2: number, value3: number): void {

        setPwmRGB(value1, value2, value3);

    }
    //% blockId=Tinybit_Music_Car block="小车音乐播放|%index"
    //% weight=95
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Music_Car(index: enMusic): void {
        switch (index) {
            case enMusic.dadadum: music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once); break;
            case enMusic.birthday: music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once); break;
            case enMusic.entertainer: music.beginMelody(music.builtInMelody(Melodies.Entertainer), MelodyOptions.Once); break;
            case enMusic.prelude: music.beginMelody(music.builtInMelody(Melodies.Prelude), MelodyOptions.Once); break;
            case enMusic.ode: music.beginMelody(music.builtInMelody(Melodies.Ode), MelodyOptions.Once); break;
            case enMusic.nyan: music.beginMelody(music.builtInMelody(Melodies.Nyan), MelodyOptions.Once); break;
            case enMusic.ringtone: music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once); break;
            case enMusic.funk: music.beginMelody(music.builtInMelody(Melodies.Funk), MelodyOptions.Once); break;
            case enMusic.blues: music.beginMelody(music.builtInMelody(Melodies.Blues), MelodyOptions.Once); break;
            case enMusic.wedding: music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once); break;
            case enMusic.funereal: music.beginMelody(music.builtInMelody(Melodies.Funeral), MelodyOptions.Once); break;
            case enMusic.punchline: music.beginMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.Once); break;
            case enMusic.baddy: music.beginMelody(music.builtInMelody(Melodies.Baddy), MelodyOptions.Once); break;
            case enMusic.chase: music.beginMelody(music.builtInMelody(Melodies.Chase), MelodyOptions.Once); break;
            case enMusic.ba_ding: music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once); break;
            case enMusic.wawawawaa: music.beginMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once); break;
            case enMusic.jump_up: music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once); break;
            case enMusic.jump_down: music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once); break;
            case enMusic.power_up: music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once); break;
            case enMusic.power_down: music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once); break;
        }
    }
    
    
    
    //% blockId=Tinybit_CarCtrl block="小车控制|%index"
    //% weight=93
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrl(index: CarState): void {
        switch (index) {
            case CarState.Car_Run: Car_run(255, 255); break;
            case CarState.Car_Back: Car_back(255, 255); break;
            case CarState.Car_Left: Car_left(255, 255); break;
            case CarState.Car_Right: Car_right(255, 255); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(255, 255); break;
            case CarState.Car_SpinRight: Car_spinright(255, 255); break;
        }
    }
    
    //% blockId=Tinybit_CarCtrlSpeed block="小车控制|%index|速度 %speed"
    //% weight=92
    //% blockGap=10
    //% speed.min=0 speed.max=255
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        switch (index) {
            case CarState.Car_Run: Car_run(speed, speed); break;
            case CarState.Car_Back: Car_back(speed, speed); break;
            case CarState.Car_Left: Car_left(speed, speed); break;
            case CarState.Car_Right: Car_right(speed, speed); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(speed, speed); break;
            case CarState.Car_SpinRight: Car_spinright(speed, speed); break;
        }
    }
    
    //% blockId=Tinybit_CarCtrlSpeed2 block="小车控制|%index|左电机速度 %speed1|右电机速度 %speed2"
    //% weight=91
    //% blockGap=10
    //% speed1.min=0 speed1.max=255 speed2.min=0 speed2.max=255
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrlSpeed2(index: CarState, speed1: number, speed2: number): void {
        switch (index) {
            case CarState.Car_Run: Car_run(speed1, speed2); break;
            case CarState.Car_Back: Car_back(speed1, speed2); break;
            case CarState.Car_Left: Car_left(speed1, speed2); break;
            case CarState.Car_Right: Car_right(speed1, speed2); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(speed1, speed2); break;
            case CarState.Car_SpinRight: Car_spinright(speed1, speed2); break;
        }
    }    
        
   
    
    //% blockId=Tinybit_Line_Sensor block="巡线传感器|位置 %direct|检测到 %value"
    //% weight=89
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Line_Sensor(direct: enPos, value: enLineState): boolean {

        let temp: boolean = false;
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
        switch (direct) {
            case enPos.LeftState: {
                if (pins.digitalReadPin(DigitalPin.P13) == value) {              
                    temp = true;                  
                }
                else {                  
                     temp = false;
                }
                break;
            }

            case enPos.RightState: {
                if (pins.digitalReadPin(DigitalPin.P14) == value) {              
                    temp = true;                  
                }
                else {
                    temp = false;
                }
                break;
            }
        }
        return temp;

    }

    //% blockId=Tinybit_Voice_Sensor block="声音传感器返回"
    //% weight=88
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Voice_Sensor(): number {
	    //pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
        let temp  = 0;		
        temp = pins.analogReadPin(AnalogPin.P1);           
            
        return temp;

    }
        
    //% blockId=Tinybit_Ultrasonic_Car block="超声波返回（cm）"
    //% color="#006400"
    //% weight=87
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic_Car(): number {

       	let list:Array<number> = [0, 0, 0, 0, 0];
				for (let i = 0; i < 5; i++)
				{
					pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
					pins.digitalWritePin(DigitalPin.P16, 0);
					control.waitMicros(2);
					pins.digitalWritePin(DigitalPin.P16, 1);
					control.waitMicros(15);
					pins.digitalWritePin(DigitalPin.P16, 0);
					let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 43200);
					list[i] = Math.floor(d / 40);
				}
				list.sort();
				let length = (list[1] + list[2] + list[3])/3;
				return  Math.floor(length);
    }
        
    //% blockId=Tinybit_Ultrasonic_CarV2 block="microbit|V2|超声波返回（cm）"
    //% color="#006400"
    //% weight=87
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic_CarV2(): number {
		pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
		pins.digitalWritePin(DigitalPin.P16, 0);
		control.waitMicros(4);
		pins.digitalWritePin(DigitalPin.P16, 1);
		control.waitMicros(10);
		pins.digitalWritePin(DigitalPin.P16, 0);

		let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 500 * 58);
        return  Math.floor(d / 58);

    }

    //% blockId=Tinybit_motor_pid block="小车运动|左电机速度 %sp_L|右电机速度 %sp_R"
    //% color="#006400"
    //% weight=87
    //% sp_L.min=-255 sp_L.max=255  sp_R.min=-255 sp_R.max=255
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function car_sport(sp_L:number,sp_R:number)
    {
        let buf = pins.createBuffer(5);
        buf[0] = MOTOR;

        if (sp_L < 0)//反转
        {
            buf[1] = 0;
            buf[2] = -sp_L;
        }
        else //正转
        {
            buf[1] = sp_L;
            buf[2] = 0;
        }

        if (sp_R < 0)//反转
        {
            buf[3] = 0;
            buf[4] = -sp_R;
        }
        else //正转
        {
            buf[3] = sp_R;
            buf[4] = 0;
        }

        if(sp_L>=0 && sp_R>=0) //正、左、右
        {
            car_flag_new = 0;
        }
        else if(sp_L<0 && sp_R<0)//反
        {
            car_flag_new = 1;
        }
        else if(sp_L>0 && sp_R<0)//左旋
        {
            car_flag_new = 2;
        }
        else if(sp_L<0 && sp_R>0)//右旋
        {
            car_flag_new = 3;
        }


        if(car_flag_new != car_flag_old) //状态发生变化
        {
            let bufff = pins.createBuffer(5);
            bufff[0] = MOTOR;
            bufff[1] = 0; bufff[2] = 0; bufff[3] = 0; bufff[4] = 0;
            pins.i2cWriteBuffer(PWM_ADD, buf);//停止100ms
            basic.pause(100);
            car_flag_old = car_flag_new;
        }

        pins.i2cWriteBuffer(PWM_ADD, buf);

    }


}
