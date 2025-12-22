---
title: Mom-Mobile
subtitle: An ATV for my mom, who gave me my love of speed. 
image: assets\img\atv\new3.jpeg
alt: Shirts on a hanger

caption:
  title: Mom-Mobile
  subtitle: An ATV for my mom, who gave me my love of speed. 
  thumbnail: assets\img\atv\new3.jpeg
---
### Overview
An ATV is a fun, easy-to-ride farm vehicle that even the tamest of riders can feel comfortable on. But what if you want more?

My mother was not satisfied with a pokey gas ATV and wanted an upgrade for touring her property. She challenged me to build a dead-quiet, long-range, and fast ATV that could tackle any terrain, and so I built one!

**Specs**
- Frame: 1997 Kawasaki Bayou 220
- Motor: QS138 V3
- Battery: 60V 67Ah Custom
- Suspension: Kawasaki Stock
- Controller: Fardriver ND72450 (200A bus, 450A phase)
- Top Speed: 45 mph
- Total Power: 12,000 W

#### Build Process
The ATV had humble beginnings as a 1997 Kawasaki Bayou 220 that had seen many better days.

<img src="assets/img/atv/pre.jpg" alt="A gold-painted Kawasaki Bayou 220 ATV" width="75%" /><br>
*The Facebook Marketplace listing photo for the ATV.*

I purchased the ATV, in non-running condition from Facebook Marketplace for $500. It was rusty, spray-painted an atrocious gold, and was overall a bit sad. Before I could do anything else, I needed to clean it up.

##### Cleaning and Painting
I ripped absolutely everything off the ATV. The only thing left at the end was the bare frame. I took a wire brush, detergent, and a garden hose and spent a whole day cleaning all the parts I wanted to re-use.

<img src="assets/img/atv/frame.jpg" alt="Me working on the stripped-down frame of an ATV" width="75%" /><br>
*Me working on taking off the final suspension members during cleaning.*

I really wanted to re-paint the entire frame, but I did not have the resources to strip all the paint off, wire-brush everything, and then repaint it cleanly. The frame was also in fine condition, so I left it. Seeing as my mother's favorite color is pink, I had to repaint some parts to fit her aesthetic.

<img src="assets/img/atv/pink.jpg" alt="The ATV frame with pink painted suspension components" width="75%" /><br>
*The frame and suspension of the ATV after painting.*

I also planned to paint all the body panels in camo-pink but decided I needed to learn more about painting before diving into that project.

##### Battery and Electronics
Range anxiety really takes the fun out of riding, so I wanted this ATV to have way more range than necessary. To accomplish this, I purchased two Samsung 8s 67Ah prismatic cell modules and wired them in series. This provided a total energy capacity of 3,966 Wh.

<img src="assets/img/atv/samsung.webp" alt="Samsung 8s 67Ah prismatic cell module" width="75%" /><br>
*The battery listing photo at Batteryhookup.com.*

To manage this battery, I used a JK 200A continuous BMS since it perfectly aligned with the 200A controller, and JK is well-regarded in the battery-building world. While I prefer ANT BMSs, I opted for the JK since it had 1A balancing instead of the 180 mA found on the ANT. The larger cell capacity needed the higher balancing current.

Originally, for the controller, I went with a Sabvoton SVMC 72200, like on the City Ripper. But, as with that controller, I had a MOSFET short to the cooling plate underneath, and the controller went up in flames. So, I purchased a newer Fardriver 72450 that had the same power specs, a better interface and features, and was less than half the price.

<img src="assets/img/atv/far.jpg" alt="The Fardriver controller with a basic wiring harness" width="75%" /><br>
*A basic wiring harness with the new Fardriver controller (blue box).*

##### Motor Integration
Integrating an aftermarket motor made with Chinese manufacturing standards into a 28-year-old Japanese ATV was really hard. The biggest challenge I faced was making a spline adapter that went between the motor's output shaft and the rear differential's input shaft.

I created four different adapter designs before I found the perfect fit for the splines. I made the first three adapters to try to fit the motor to a 90-degree gearbox and have the motor transversely mounted, but I could never get the gears to mesh correctly. I then switched to having the motor mounted inline with the driveshaft, which worked much better.

<img src="assets/img/atv/spv1.png" alt="CAD drawing of spline adapter version 1" width="49%" /> <img src="assets/img/atv/spv2.png" alt="CAD drawing of spline adapter version 4" width="49%" />
*Spline adapter v1 (left) and spline adapter v4 (right).*

<img src="assets/img/atv/inline2.jpg" alt="The electric motor mounted inline with the driveshaft" width="75%" /><br>
*The motor mounted with adapter v4 and final mounts.*

As a small side note, I ordered the final adapter just as tariffs on Chinese goods hit, which forced me to change manufacturers. The quality of the final product was not as good as I hoped. The tolerances on the motor spline were slightly off, which led to 1.5 hours of hand-filing to get the right fit.

##### Final Assembly
After mounting the motor and final spline adapter, I was able to finish up all the wiring and put the plastic panels back on. During my final wiring, I realized my 12V converter was too small. The headlights alone drew 12 amps, and the converter could only supply 10 amps, so I had to do some rewiring, but nothing major.

<img src="assets/img/atv/controls.jpg" alt="The ATV's control panel with switches and a voltage display" width="75%" /><br>
*Control panel and voltage display with a light switch, reverse, and 2-speed modes.*

<img src="assets/img/atv/final1.jpg" alt="Me adjusting the battery mounting on the nearly complete ATV" width="75%" /><br>
*Me tweaking the battery mounting on the almost-finished ATV.*

<img src="assets/img/atv/new2.jpeg" alt="Me adjusting the battery mounting on the nearly complete ATV" width="75%" /><br>
*My mom out for a ride on our farm.*

I have yet to do the final painting or battery mounting, but the ATV is now rideable, and my mom absolutely loves it.

#### Reflection
This project came with some of my biggest setbacks, except for the bike that caught fire. It took almost a year and a half from start to finish due to everything from laziness to tariffs. It really pushed my limits of designing for manufacturing and my engineering knowledge in general. I failed many times with the gearbox and my spline adapters, but I always made another version.

Seeing how happy my mom was with the final product made it worth all the trouble. The final ATV was quiet enough to have a normal conversation while riding and fast enough to pull a wheelie when necessary. It could go through foot-deep mud and up rutted hills without complaint. While this project did have many of my biggest failures, it was nevertheless an incredible success.





