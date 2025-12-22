---
title: Fox Robot Electrical System
subtitle: Electrical system design process and justification for a fox robot.
image: assets/img/fox-bot/electrical.jpg
alt: Keep Exploring

caption:
  title: Fox Robot Electrical System
  subtitle: Electrical system design process and justification for a fox robot.
  thumbnail: assets/img/fox-bot/electrical.jpg
---
*Note: This is a snippet of a larger project. Full project documentation can be found here: [Fox Bot Project](https://jake30123.github.io/foxbot-website/)*

#### Electrical Overview
The electrical system of the Fox-Bot was designed to be both functional and clean. The electrical system needs to facilitate all necessary software tasks and power all of the systems while not interfering with the cute looks of the bot. It should also be well organized and easy to follow for debugging. 

All external interaction with the robot was to occur via audio, which we pivoted on later in the project.

#### Initial Design Choices
Going into the project, the team set the following electrical goals:
1. Clean and tidy
2. Integrated with the mechanical system from the start
3. Contained (does not interfere with cuteness)
4. Sufficiently powerful to power all components without dropouts 
5. Powerful enough to run machine learning

The first big choices on the table were how to do computing, how to control motors and servos, and how to power the system. 

##### Computing Demands
Running both machine learning processes and audio processing at once requires a lot of computing power. Many Single Board Computers (SBCs) exist on the market but many are either overpriced or underperforming for our budget and needs. To compare our options we made the following decision matrix:

| Criteria    | Weight (%) | Raspberry Pi 5 | NVIDIA Jetson | Raspberry Pi 4 | Orange Pi 5 |
| ----------- | ---------- | -------------- | ------------- | -------------- | ----------- |
| Cost        | 20         | 7              | 4             | 8              | 4           |
| Performance | 20         | 8              | 10            | 4              | 10          |
| Support     | 5          | 6              | 6             | 6              | 3           |
| Community   | 15         | 10             | 8             | 10             | 6           |
| Size        | 5          | 10             | 5             | 10             | 8           |
| Power Draw  | 15         | 7              | 4             | 7              | 6           |
| Ease of Use | 20         | 8              | 7             | 8              | 7           |
| Final Score | 100        | 7.95           | 6.55          | 7.35           | 6.55        |

*Note: The Arduino Uno Q would have been an absolutely perfect option, but it would not have arrived in time.* 

##### Motor/Servo Control
The Raspberry Pi 5 cannot directly control and power servos or motors, so we needed an intermediate to facilitate this control. In earlier PIE projects, we learned how to use Arduinos and Adafruit Motor Shields, and since fancy motor control was not in the scope of the project or in our learning goals, we opted to continue with this method of control. PIE also has a spare motor shield we could borrow, which made it an easy choice, given that our team also had multiple Arduino R4s at our disposal (*foreshadowing*). 

##### System Power
All the components we selected now had to be powered. All together, the *max* power draw of the system is as follows:

Raspberry Pi 5 = 15W (3A @ 5V) <br>
Arduino Uno R4 Minima = 0.5W (90mA @ 5V) <br>
Three Servos = 3W (600mA @ 5V) <br>
Two 8x8 Matrix Displays = 3W (600mA @ 5V) <br>
Two 12V Drive Motors = 72W (6A @ 12V) <br>

**Total 5V = 4.29A *Needs to be stepped down from 12v*** <br>
**Total 12V = 2.4A *Including 12V converter theoretical draw***

We had a 12V battery easily at our disposal from PIE stock. It was a 12V 2.2AH Li-Po battery that had seen better days (*foreshadowing #2*). Also, we needed a 12V system anyway to power the motors.

We found buck converters in the electrical stock room that could only supply 3A max, meaning that at full draw our robot would be power limited. Also, the Raspberry Pi 5 is incredibly sensitive to power fluctuations (*foreshadowing #3*), so having a dedicated buck converter makes the system more reliable and cleaner. So we ended up with a 12V battery and 2 buck converters to power the entire robot.

#### Initial Work/Integration
With all of our components selected, we could start working! Our original expectation was to use three microphones for all of the software functions. To test this, we connected three microphones to the ADC port on an Arduino and transmitted the audio data over WiFi to test both audio collection and remote data transmission. We were only able to send low fidelity audio which did not meet software's requirements for tracking a person or melody. Relatively late into the project we switched to a camera, which we will discuss more later. 

Just as we were figuring out audio, our Raspberry Pi 5 finally arrived. We purchased the Pi 5 due to its reliability, community, and generally available knowledge on the internet. However, we managed to discover many of the possible downfalls of the Raspberry Pi 5, all in succession. 

After flashing a 64 bit version of Debian Trixie, the Raspberry Pi would start to boot, get caught, and start to boot again endlessly. It gave no error code, would not connect to the internet so we could SSH into it and check errors, or give really any consistent signal as to the problem. We eventually identified a weak power supply, wires that were too thin, a slow SD card, and funky network protocols to all be interfering with the boot process. 

After soldering thicker wires to the GPIO pins, setting a static IP and connecting to OLIN-DEVICES, finding a faster SD card, and changing power supplies, the Raspberry Pi booted! This was absolutely huge for our team and happened after over ten hours of fiddling with a supposedly plug and play product. *Note: we did not have the Raspberry Pi official power supply which would have solved some isses.*

#### Powering the System
With our base systems set up with the Arduino data communication and Raspberry Pi up and running, we started to integrate the electrical system. We were able to find two buck converters in the electrical stock room that perfectly fit our power requirements and dimensions. 

Within a couple of days, we had a fully wired, albeit messy, system for testing. Our battery was happily powering our buck converters and the Arduinos and motors. 
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
    <iframe 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
        src="https://www.youtube.com/embed/r53Vig4T5lE" 
        title="Fox-Bot Firmware" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
    </iframe>
</div><br>

Then one of our GPIO pins on one Arduino shorted and produced magic smoke, and a 12V wire became quite friendly with the USB port on the other Arduino... leaving us with one final Arduino for the project. 

Besides this, the two buck converter system kept the Raspberry Pi happy while providing enough power to the servos and displays. 

#### Wire Management
It was incredibly important to our electrical team member that the system be quite neat. So after we had a working prototype, it was time to refine the wiring. Before refinement the wiring was quite a rat's nest: It all worked, but some wires were too short, some were too long, and it all made working on the robot really hard. 

To fix this issue we unsoldered all of the wires and made all of them the correct length, as well as switching to silicone sleeved wire instead of PVC for ease of routing. We then added wire wrap and heat shrink to all necessary connections and routed the wires for minimal length on power wires.

<img src="assets/img/fox-bot/sleeve.jpg" alt="Fox-Bot wires in wire sleeve" width="100%" /><br>

Here is what the final electrical system looks like with all of the wire management. 

#### Firmware Development
Firmware also fell under the electrical umbrella. Please see the firmware page on the website for details on the development. 

#### The Li-Po Fiasco
The battery powering our dear furry friend was a 12V Li-Po battery that was in PIE stock. We found it with a small amount of bulge, but it was within safe levels. This battery served us for a couple weeks before we left the robot plugged in all night. This completely drained the battery. In the morning we charged the battery again, causing it to inflate a great deal more to highly unsafe levels (enough that the entire PIE teaching team was concerned). We unfortunately had to dispose of our trusty battery with the shop. 

The PIE team offered to buy our team a new battery, since safety comes above budget, so huge shout out to all of them. Thank you for making our project possible. But for a while, we were relegated to power supply testing for our software/hardware integration.

<img src="assets/img/fox-bot/supply.jpg" alt="Fox-Bot hooked up to a power supply" width="100%" /><br>