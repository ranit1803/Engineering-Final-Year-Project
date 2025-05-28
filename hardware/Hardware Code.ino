//Import All The Libraries
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "Wire.h"
#include "MAX30100_PulseOximeter.h"
#include <Adafruit_ADXL345_U.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <TinyGPS++.h>

//Defining The Pins
#define DHTPIN 4
#define DHTTYPE DHT11
#define BUZZER_PIN 27
#define ONE_WIRE_BUS 5
#define MQ3_PIN 34
#define HEART_RATE_PIN 32
//Defining The Pins For OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C  
//Defining The Pins For GPS
#define RXD2 16  // GPS module TX connected to ESP32 RX2 (GPIO 16)
#define TXD2 17  // GPS module RX connected to ESP32 TX2 (GPIO 17)

// WiFi & ThingSpeak details
const char* ssid = "Redmi";//Add WiFi SSID         
const char* password = "ranitsantra";//Add The Password
const char* apiKey = "0U0424RHM25DOS47";//Add ThingSpeak Read API 
const char* server = "http://api.thingspeak.com/update";

// Default GPS coordinates (Bangalore, India)
const float defaultLatitude = 13.036956;
const float defaultLongitude = 77.619606;

// Sensor objects
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
PulseOximeter pox;
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

static float lastSpo2 = 97.0;

void onBeatDetected() {
    Serial.println("Beat Detected!");
}

void setup() {
    Serial.begin(115200);
    gpsSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);
    
    WiFi.begin(ssid, password);
    dht.begin();
    sensors.begin();
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    // OLED Initialization
    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        Serial.println("SSD1306 allocation failed");
        for (;;);
    }
    display.clearDisplay();
    display.setTextSize(0.7);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.print("Initializing...");
    display.display();
    delay(2000);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");

    if (!pox.begin()) {
        Serial.println("Failed to initialize MAX30100/30102!");
    } else {
        Serial.println("MAX30100/30102 initialized!");
    }
    pox.setOnBeatDetectedCallback(onBeatDetected);

    if (!accel.begin()) {
        Serial.println("Failed to initialize ADXL345!");
    } else {
        Serial.println("ADXL345 initialized!");
        accel.setRange(ADXL345_RANGE_2_G);
    }
}

void loop() {
    // Read sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    sensors.requestTemperatures();
    float ds18b20_temp = sensors.getTempCByIndex(0);
    int mq3_raw = analogRead(MQ3_PIN);
    int heartRateRaw = analogRead(HEART_RATE_PIN);
    int heartRate = map(heartRateRaw, 0, 4095, 40, 180);

    // Simulate SpO2 value
    float variation = random(-3, 3);
    float spo2 = lastSpo2 + variation;
    if (spo2 < 94) spo2 = 94 + random(0, 3);
    if (spo2 > 102) spo2 = 102 - random(0, 3);
    lastSpo2 = spo2;

    // Read ADXL345 values
    sensors_event_t event;
    accel.getEvent(&event);
    float accelZ = event.acceleration.z;
    bool fallDetected = (accelZ < 3.0);

    // Read GPS Data
    float latitude = defaultLatitude;
    float longitude = defaultLongitude;
    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
        if (gps.location.isUpdated()) {
            latitude = gps.location.lat();
            longitude = gps.location.lng();
        }
    }

    // Print Data to Serial Monitor
    Serial.println("\n--- Sensor Readings ---");
    Serial.print("Room Temp: "); Serial.print(temperature); Serial.println(" °C");
    Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
    Serial.print("Body Temp: "); Serial.print(ds18b20_temp); Serial.println(" °C");
    Serial.print("Gas Level: "); Serial.println(mq3_raw);
    Serial.print("Heart Rate: "); Serial.print(heartRate); Serial.println(" BPM");
    Serial.print("SpO2: "); Serial.print(spo2); Serial.println(" %");
    Serial.print("Latitude: "); Serial.print(latitude, 6); Serial.print("  ");
    Serial.print("Longitude: "); Serial.println(longitude, 6);

    if (fallDetected) {
        Serial.println("Alert: Fall Detected!");
    }

    // Display Data on OLED
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("Room Temp: "); display.print(temperature); display.println("C");
    display.print("Humidity: "); display.print(humidity); display.println("%");
    display.print("Body Temp: "); display.print(ds18b20_temp); display.println("C");
    display.print("Gas: "); display.print(mq3_raw); display.println("");
    display.print("Heart Rate: "); display.print(heartRate); display.println(" BPM");
    display.print("Oxygen: "); display.print(spo2); display.println("%");
    display.print("Lat: "); display.print(latitude, 6); display.print("  ");
    display.print("Lon: "); display.print(longitude, 6);
    
    display.display();

    // Alerts
    bool alert = false;
    if (fallDetected || temperature > 35 || ds18b20_temp > 37 || mq3_raw > 2000 || heartRate < 50 || heartRate > 120 || spo2 < 90) {
        Serial.println("Emergency Alert!");
        alert = true;
    }
    digitalWrite(BUZZER_PIN, alert ? HIGH : LOW);

    // Send Data to ThingSpeak
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String url = String(server) + "?api_key=" + apiKey + 
                     "&field1=" + String(temperature) +
                     "&field2=" + String(humidity) + 
                     "&field3=" + String(ds18b20_temp) + 
                     "&field4=" + String(mq3_raw) + 
                     "&field5=" + String(heartRate) +
                     "&field6=" + String(spo2) + 
                     "&field7=" + String(latitude, 6) + 
                     "&field8=" + String(longitude, 6);
        
        http.begin(url);
        int httpCode = http.GET();

        if (httpCode > 0) {
            Serial.println("Data sent to ThingSpeak successfully");
        } else {
            Serial.println("Error sending data to ThingSpeak");
        }
        http.end();
    }

    delay(15000);
}
