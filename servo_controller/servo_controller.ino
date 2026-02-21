#include <ESP8266WebServer.h>
#include <Adafruit_PWMServoDriver.h>

#include <ESP8266WiFi.h>
#include <Wire.h>
#include <ArduinoJson.h>

#include "secrets.h"

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
ESP8266WebServer server(80);

/* ====== CONFIG ======= */
const int MAX_COMPONENTS = 10;
const uint16_t MIN_PULSE = 102;   // 0° -> needs tweaking
const uint16_t MAX_PULSE = 512;   // 180° -> needs tweaking

unsigned long CURRENT_TIME;
unsigned long LAST_TIME;
unsigned long DELTA_TIME;

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

    int angleToPWM(int angle)
    {
       return map(angle, 0, 180, MIN_PULSE, MAX_PULSE);
    }

    int linearInterpolation(int currentTime, int timeStart, int timeEnd, int angleStart, int angleEnd)
    {
      return map(currentTime, timeStart, timeEnd, angleStart, angleEnd);
    }
    
  public:
    AnimatedComponent* components;
    int componentCount;
    bool isPlaying;
    float currentTime;
    
    AnimationController() {
      components = (AnimatedComponent*)malloc(MAX_COMPONENTS * sizeof(AnimatedComponent));
      componentCount = 0;
      isPlaying = false;
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
    
      printData();

      //reset to start
      isPlaying = true;
      currentTime = 0;
    }

    void playCurrentAnimation(float delta_time)
    {
      if (isAnimationFinished())
      {
        isPlaying = false;
      }
           
      if (!isPlaying) {
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
          const int inputAngle = linearInterpolation(currentTime, 
            curr_kf.trigger_time, next_kf.trigger_time,
            atoi(curr_kf.action), atoi(next_kf.action)
          );
            
          pwm.setPWM(components[i].pin, 0, angleToPWM(inputAngle));
        }
      }

      currentTime += delta_time;
    }

    bool isAnimationFinished()
    {
      int componentFinishedCounter = 0;
      for (int i = 0; i < componentCount; i ++) {
        if (components[i].currentKeyframe >= components[i].keyframeCount)
          componentFinishedCounter++;
      }

      return componentFinishedCounter == componentCount;
    }
    
    void refresh() {
      for (int i = 0; i < componentCount; i++) {
        free(components[i].type);
      }
      componentCount = 0;
    }

    void printData() {
      Serial.println("\n========== ANIMATION CONTROLLER DEBUG ==========");
      Serial.print("Total Components: ");
      Serial.println(componentCount);
      Serial.print("Is Playing: ");
      Serial.println(isPlaying ? "true" : "false");
      
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

  //establish controller
  animationController = new AnimationController();
  CURRENT_TIME = millis();
  LAST_TIME = CURRENT_TIME;
}

void loop() {
  //web requests
  server.handleClient();

  //time
  LAST_TIME = CURRENT_TIME;
  CURRENT_TIME = millis();
  DELTA_TIME = CURRENT_TIME - LAST_TIME;
  
  //animation
  animationController->playCurrentAnimation(DELTA_TIME);
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

void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
}
