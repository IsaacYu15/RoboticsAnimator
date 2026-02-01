#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include "secrets.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define NUM_SERVOS 3
#define SERVO_MIN 150  
#define SERVO_MAX 500  
#define SERVO_DELAY 500

ESP8266WebServer server(80);

int servoPins[NUM_SERVOS] = {0, 1, 2}; 

void setup() {
  //baud rate
  Serial.begin(9600); 

  //establish connection
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP()); 

  //web server routes
  server.on("/start", HTTP_POST, handleAnimationPost);
  server.on("/status", HTTP_GET, handleStatusGet);
  server.on("/status", HTTP_OPTIONS, handleCORS);
  server.on("/start", HTTP_OPTIONS, handleCORS);
  server.begin();
  
  //pwm configuration
  pwm.begin();
  pwm.setPWMFreq(50); 

}

void loop() {
  server.handleClient();
}

void handleAnimationPost() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body sent\"}");
    return;
  }

  String jsonString = server.arg("plain");

  Serial.println("Received animation JSON:");
  Serial.println(jsonString);
  
  server.send(200, "application/json", "{\"status\":\"Animation loaded\"}");
}

void handleStatusGet() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"message\":\"ESP32 API connected\"}");
}

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
}


//  for (uint16_t pulse = SERVO_MIN; pulse <= SERVO_MAX; pulse += 1) {
//    for (int i = 0; i < NUM_SERVOS; i++) {
//      pwm.setPWM(servoPins[i], 0, pulse);
//    }
//    delay(5); 
//  }
//
//  delay(SERVO_DELAY);
//
//  for (uint16_t pulse = SERVO_MAX; pulse >= SERVO_MIN; pulse -= 1) {
//    for (int i = 0; i < NUM_SERVOS; i++) {
//      pwm.setPWM(servoPins[i], 0, pulse);
//    }
//    delay(5); 
//  }
//
//  delay(SERVO_DELAY); 
