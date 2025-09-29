#include <Servo.h>

// Servo motorlar
Servo myservo1;
Servo myservo2;
Servo myservo3;
Servo myservo4;
Servo myservo5;
Servo myservo6;
Servo myservo7;
Servo myservo8;

// Sensör pinleri (trig ve echo)
const int trigPins[8] = { 24, 26, 28, 30, 32, 34, 36, 38 };
const int echoPins[8] = { 25, 27, 29, 31, 33, 35, 37, 39 };

long zaman[8];
long mesafe[8];

unsigned long sonOlcumZamani = 0;
unsigned long olcumAraligi = 5000;

void setup() {
  myservo1.attach(2);
  myservo2.attach(3);
  myservo3.attach(4);
  myservo4.attach(5);
  myservo5.attach(6);
  myservo6.attach(7);
  myservo7.attach(8);
  myservo8.attach(9);

  Serial.begin(9600);

  for (int i = 0; i < 8; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
  }
}

void loop() {
  // Komutları oku
  if (Serial.available() > 0) {
    String komut = Serial.readStringUntil('\n');
    komut.trim();

    if (komut == "1") myservo1.write(90);
    else if (komut == "0") myservo1.write(180);
    else if (komut == "3") myservo2.write(90);
    else if (komut == "2") myservo2.write(180);
    else if (komut == "5") myservo3.write(90);
    else if (komut == "4") myservo3.write(180);
    else if (komut == "7") myservo4.write(90);
    else if (komut == "6") myservo4.write(180);
    else if (komut == "9") myservo5.write(90);
    else if (komut == "8") myservo5.write(180);
    else if (komut == "11") myservo6.write(90);
    else if (komut == "10") myservo6.write(180);
    else if (komut == "13") myservo7.write(90);
    else if (komut == "12") myservo7.write(180);
    else if (komut == "15") myservo8.write(90);
    else if (komut == "14") myservo8.write(180);
  }


    unsigned long suan = millis();
  if (suan - sonOlcumZamani >= olcumAraligi) {
    sonOlcumZamani = suan;

    // Sensör 1
    digitalWrite(trigPins[0], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[0], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[0], LOW);
    zaman[0] = pulseIn(echoPins[0], HIGH, 30000);
    mesafe[0] = (zaman[0] / 29.1) / 2;
    Serial.println((mesafe[0] < 10) ? 0 : 1);

    // Sensör 2
    digitalWrite(trigPins[1], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[1], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[1], LOW);
    zaman[1] = pulseIn(echoPins[1], HIGH, 30000);
    mesafe[1] = (zaman[1] / 29.1) / 2;
    Serial.println((mesafe[1] < 10) ? 2 : 3);

    // Sensör 3
    digitalWrite(trigPins[2], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[2], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[2], LOW);
    zaman[2] = pulseIn(echoPins[2], HIGH, 30000);
    mesafe[2] = (zaman[2] / 29.1) / 2;
    Serial.println((mesafe[2] < 10) ? 4 : 5);

    // Sensör 4
    digitalWrite(trigPins[3], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[3], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[3], LOW);
    zaman[3] = pulseIn(echoPins[3], HIGH, 30000);
    mesafe[3] = (zaman[3] / 29.1) / 2;
    Serial.println((mesafe[3] < 10) ? 6 : 7);

    // Sensör 5
    digitalWrite(trigPins[4], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[4], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[4], LOW);
    zaman[4] = pulseIn(echoPins[4], HIGH, 30000);
    mesafe[4] = (zaman[4] / 29.1) / 2;
    Serial.println((mesafe[4] < 10) ? 8 :9);

    // Sensör 6
    digitalWrite(trigPins[5], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[5], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[5], LOW);
    zaman[5] = pulseIn(echoPins[5], HIGH, 30000);
    mesafe[5] = (zaman[5] / 29.1) / 2;
    Serial.println((mesafe[5] < 10) ? 10 : 11);

    // Sensör 7
    digitalWrite(trigPins[6], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[6], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[6], LOW);
    zaman[6] = pulseIn(echoPins[6], HIGH, 30000);
    mesafe[6] = (zaman[6] / 29.1) / 2;
    Serial.println((mesafe[6] < 10) ? 12 : 13);

    // Sensör 8
    digitalWrite(trigPins[7], LOW);
    delayMicroseconds(2);
    digitalWrite(trigPins[7], HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPins[7], LOW);
    zaman[7] = pulseIn(echoPins[7], HIGH, 30000);
    mesafe[7] = (zaman[7] / 29.1) / 2;
    Serial.println((mesafe[7] < 10) ? 14 : 15);

  
  }

}

