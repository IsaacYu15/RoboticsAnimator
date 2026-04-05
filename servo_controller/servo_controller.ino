#include <ESP8266WebServer.h>
#include <Adafruit_PWMServoDriver.h>

#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <ArduinoJson.h>

#include "secrets.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

/* ====== CONFIG ======= */
const int MAX_COMPONENTS = 10;
const uint16_t MIN_PULSE = 102;
const uint16_t MAX_PULSE = 512;

unsigned long CURRENT_TIME;
unsigned long LAST_TIME;
unsigned long DELTA_TIME;

/* ====== UTILITY FUNCTIONS ======= */
int angleToPWM(int angle) {
  return map(angle, 0, 180, MIN_PULSE, MAX_PULSE);
}

int linearInterpolation(int currentTime, int timeStart, int timeEnd, int angleStart, int angleEnd)
{
  return map(currentTime, timeStart, timeEnd, angleStart, angleEnd);
}

/* ====== ANIMATION ======= */
struct Keyframe {
  float trigger_time;
  char* action;
};

struct AnimatedComponent {
  char* type;
  int pin;
  Keyframe* keyframes;
  int keyframeCount;
  int currentKeyframe;
};

class AnimationController {
  private:
    void addComponent(const char* type, int pin, Keyframe* keyframes, int keyframeCount) {
      if (componentCount >= MAX_COMPONENTS) {
        Serial.println("Component length exceeded");
        return;
      } 
      
      components[componentCount].type = (char*)malloc(strlen(type) + 1);
      strcpy(components[componentCount].type, type);
      
      components[componentCount].pin = pin;
      components[componentCount].keyframes = keyframes;
      components[componentCount].keyframeCount = keyframeCount;
      components[componentCount].currentKeyframe = 0;
      componentCount++;
    }
    
  public:
    AnimatedComponent* components;
    int componentCount;
    bool isPlaying;
    bool isPaused;
    float currentTime;
    float animationLength;
    
    AnimationController() {
      components = (AnimatedComponent*)malloc(MAX_COMPONENTS * sizeof(AnimatedComponent));
      componentCount = 0;
      isPlaying = false;
      isPaused = false;
    }

    void startAnimation(const String& jsonString) {
      // free memory
      refresh();
    
      // deserialize
      DynamicJsonDocument doc(4096);
      DeserializationError error = deserializeJson(doc, jsonString);
      if (error) {
        Serial.print("JSON parse error: ");
        Serial.println(error.c_str());
        return;
      }
    
      // parse Json
      animationLength=doc["animationLength"];
      JsonArray animation = doc["animation"];
      for (JsonObject comp : animation) {
        const char* type = comp["type"];
        int pin = comp["pin"];
        
        JsonArray keyframes = comp["keyframes"]; 
        int keyframeCount = keyframes.size();
        Keyframe* keyframe = (Keyframe*)malloc(keyframeCount * sizeof(Keyframe));
        
        int i = 0;
        for (JsonObject kf : keyframes) {
          keyframe[i].trigger_time = kf["trigger_time"];

          const char* actionStr = kf["action"];
          keyframe[i].action = (char*)malloc(strlen(actionStr) + 1);
          strcpy(keyframe[i].action, actionStr);
  
          i++;
        }
        
        addComponent(type, pin, keyframe, keyframeCount);
      }
    
      //reset to start
      isPlaying = true;
      isPaused = false;
      currentTime = 0;

      printData();
    }

    void playCurrentAnimation(float delta_time)
    {           
      if (!isPlaying || isPaused) {
        return;
      }
        
      for (int i = 0; i < componentCount; i ++) {

        //bounds
        if (components[i].currentKeyframe >= components[i].keyframeCount - 1)
        {
          continue;
        }

        const Keyframe curr_kf = components[i].keyframes[components[i].currentKeyframe];
        const Keyframe next_kf = components[i].keyframes[components[i].currentKeyframe + 1];
        
        //update keyframe counter
        if (currentTime >= next_kf.trigger_time)
        {
          components[i].currentKeyframe += 1;
          continue;
        }

        //servo types
        if (strcmp(components[i].type, "servo") == 0)
        {
          int inputAngle;
          
          // before first keyframe, take the value of the first keyframe
          if (currentTime < curr_kf.trigger_time)
          {
            inputAngle = atoi(curr_kf.action);
          }
          else
          {
            inputAngle = linearInterpolation(currentTime, 
              curr_kf.trigger_time, next_kf.trigger_time,
              atoi(curr_kf.action), atoi(next_kf.action)
            );
          }
            
          pwm.setPWM(components[i].pin, 0, angleToPWM(inputAngle));
        }
      }

      currentTime += delta_time;

      if (isAnimationFinished())
      {
        refresh();
      }
    }

    bool isAnimationFinished()
    {
      return currentTime > animationLength + 250; //small buffer
    }
    
    void refresh() {
      for (int i = 0; i < componentCount; i++) {
        free(components[i].type);
        for (int j = 0; j < components[i].keyframeCount; j++) {
          free(components[i].keyframes[j].action);
        }
        free(components[i].keyframes);
      }
      componentCount = 0;
      isPlaying = false;
      isPaused = false;
      currentTime = 0;
    }

    void printData() {
      Serial.println("\n========== ANIMATION CONTROLLER DEBUG ==========");
      Serial.print("Total Components: ");
      Serial.println(componentCount);
      Serial.print("Is Playing: ");
      Serial.println(isPlaying ? "true" : "false");
      Serial.print("Animation Length: ");
      Serial.println(animationLength);
      
      for (int i = 0; i < componentCount; i++) {
        Serial.println("\n--- Component " + String(i) + " ---");
        Serial.print("Type: ");
        Serial.println(components[i].type);
        Serial.print("Pin: ");
        Serial.println(components[i].pin);
        Serial.print("Keyframe Count: ");
        Serial.println(components[i].keyframeCount);
        Serial.print("Current Keyframe: ");
        Serial.println(components[i].currentKeyframe);
        
        Serial.println("Keyframes:");
        for (int j = 0; j < components[i].keyframeCount; j++) {
          Serial.print("  [");
          Serial.print(j);
          Serial.print("] Trigger Time: ");
          Serial.print(components[i].keyframes[j].trigger_time);
          Serial.print("ms | Action: ");
          Serial.println(components[i].keyframes[j].action);
        }
      }
      Serial.println("==============================================\n");
    }
    
    ~AnimationController() {
      refresh();
      free(components);
    }
};

AnimationController* animationController;

/* ====== WEB SOCKETS ======= */
void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("Client [%u] disconnected\n", num);
      break;
    case WStype_CONNECTED:
      Serial.printf("Client [%u] connected\n", num);
      break;
    case WStype_TEXT:
      handleWebSocketMessage(num, payload, length);
      break;
    default:
      break;
  }
}

void handleWebSocketMessage(uint8_t num, uint8_t* payload, size_t length) {
  const char* message = (char*)payload;

  Serial.print("Recieved request: ");
  Serial.println(message);
  
  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, message);
  if (error) return;

  const char* type = doc["type"];
  if (!type) return;

  if (strcmp(type, "pauseResume") == 0)
  {
    animationController->isPaused = !animationController->isPaused;

    if (animationController->isPaused)
    {
      Serial.println("Animation Resumed");
    } else {
      Serial.println("Animation Paused");
    }
  }
  else if (strcmp(type, "frame") == 0)
  {
    JsonArray data = doc["data"];
    for (JsonObject entry : data)
    {
      const char* compType = entry["type"];
      int pin = entry["pin"];
      const char* action = entry["action"];

      if (strcmp(compType, "servo") == 0)
      {
        pwm.setPWM(pin, 0, angleToPWM(atoi(action)));
      }
    }
  }
}

void broadcastProgress() {
  String json = "{\"currentTime\":" + String(animationController->currentTime) + 
                ",\"isPlaying\":" + (animationController->isPlaying ? "true" : "false") +
                ",\"isPaused\":" + (animationController->isPaused ? "true" : "false") + "}";
  webSocket.broadcastTXT(json);
}

unsigned long lastBroadcast = 0;
const unsigned long BROADCAST_INTERVAL = 50;

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
  server.on("/calibrate", HTTP_POST, handleCalibrate);

  server.on("/status", HTTP_OPTIONS, handleCORS);
  server.on("/start", HTTP_OPTIONS, handleCORS);
  server.on("/calibrate", HTTP_OPTIONS, handleCORS);
  
  server.begin();

  //wesocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  //pwm configuration
  pwm.begin();
  pwm.setPWMFreq(50); 

  //establish controller
  animationController = new AnimationController();
  CURRENT_TIME = millis();
  LAST_TIME = CURRENT_TIME;
}

void loop() {
  //handle server and websockets
  server.handleClient();
  webSocket.loop();

  //time
  LAST_TIME = CURRENT_TIME;
  CURRENT_TIME = millis();
  DELTA_TIME = CURRENT_TIME - LAST_TIME;
  
  //animation
  animationController->playCurrentAnimation(DELTA_TIME);

  //broadcast websocket
  if (CURRENT_TIME - lastBroadcast > BROADCAST_INTERVAL) {
    broadcastProgress();
    lastBroadcast = millis();
  }

  yield();
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

  animationController->startAnimation(jsonString);
  
  server.send(200, "application/json", "{\"status\":\"Animation loaded\"}");

  CURRENT_TIME = millis();
  LAST_TIME = CURRENT_TIME;
}

void handleStatusGet() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"message\":\"ESP32 API connected\"}");
}

void handleCalibrate() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"error\":\"No body sent\"}");
    return;
  }

  String jsonString = server.arg("plain");

  DynamicJsonDocument doc(4096);
  DeserializationError error = deserializeJson(doc, jsonString);
  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }

  const char* type = doc["type"];
  const int pin = doc["pin"];
  if (strcmp(type, "servo") == 0) {
    pwm.setPWM(pin, 0, angleToPWM(0));
  }

  server.send(200, "application/json", "{\"status\":\"Calibration complete\"}");
}

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
}
