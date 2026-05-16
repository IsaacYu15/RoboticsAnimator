# RAYTRACING
**Part 1 Demo [here](https://www.youtube.com/watch?v=HW6DJN8scOM)**

As someone who has always been amazed by theme park animatronics, I decided to build some software tools to help me
create and animate robots faster. The robotics animator is a full-stack app that lets you design animations
through a clean user interface while playing and editing them in real time. 

So far, this process has allowed me to prototype animations **3x** faster. The previous process was to blindly write some code to drive a servo, 
flash the firmware, watch the animation play out on the robot and then iterate. Using the robotics animator, 
there is no longer a need to flash the firmware as animation sequences are directly sent to the microcontroller over HTTP. Additionally,
via a WebSocket connection, you can also preview a servo's rotation in real time as you create your animations. 

Core Features:
- A digital twin interface that allows you to create and manipulate a virtual copy of your robot. It's also helpful for storing data like which pins each servo is connected to
- Animation timelines that allow you to adjust a servo's rotation at a specific time using keyframes. It also offers different forms of interpolation (ease-in, ease-out)
- A database for storing various animations and hardware / component configurations
- A WebSocket connection to the microcontroller which allows for real time interactions with the robot via the app such as previewing a frame, playing and pausing animations


