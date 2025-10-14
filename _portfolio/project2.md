---
title: Mom-Mobile
subtitle: An ATV for my mom, who gave me my love of speed. 
image: assets\img\atv\mom1.png
alt: Shirts on a hanger

caption:
  title: Mom-Mobile
  subtitle: An ATV for my mom, who gave me my love of speed. 
  thumbnail: assets\img\atv\mom1.png
---
### Overview
An ATV is a fun, easy to ride farm vehicle that even the tamest of riders can feel comfortable on. But what if you want more...

My mother was not satisfied with a pokey gas ATV and wanted an upgrade for touring her property. She challenged me to build a dead quiet, long range, and fast ATV that could tackle any terrain, and so I built one!

Frame: Kawasaki Bayou 220 <br>
Motor: QS138 V3 <br>
Battery: 60v 67AH Custom <br>
Suspension: Kawasaki Stock <br>
Controller: Fardriver ND72450 (200 bus amps, 450 phase)<br>
Top speed: 45 mph<br>
**Total Power: 12,000W**<br>

### Build Process
The ATV had humble begginings as a 1997 Kawasaki Bayou 220 that had seen many bettery days. <br>
<img src="assets\img\atv\pre.jpg" alt="My Image" width="75%" /><br>
*The facebook marketplace listing photo for the ATV.* <br>

I purchased the ATV, in a non-running condition, from facebook marketplace for $500. It was rusty, spray painted an atrocious gold, and was overall a bit sad. Before I could do anything else, I needed to clean it up. 

##### Cleaning and Painting
I ripped absolutely everything off of the ATV. The only thing left at the end was the bare frame. I took a wire brush, detergent, and a garden hose and spent a whole day cleaning all of the parts I wanted to re-use. <br>
<img src="assets\img\atv\frame.jpg" alt="My Image" width="75%" /> <br>
*Me working taking of the final suspension members during cleaning.*<br>

I really wanted to re-paint the entire frame but I did not have the resources to strip all of the paint off, wire brush everything, and then re-paint it in a clean way. The frame was also in fine condition so I left that. Seeing as my mothers favorite color is pink I had to re-paint some parts of it pink to fit her aesthetic. <br>
<img src="assets\img\atv\pink.jpg" alt="My Image" width="75%" /> <br>
*The frame and suspension of the ATV after painting.* <br>

I also planned to paint all of the body panels in camo-pink but I needed to learn more about painting before diving into that project. 

##### Battery and Electronics
Range anxiety really takes the fun out of riding so I wanted this ATV to have way more range than necessary. To accomplish this I purchased two Samsung 8s 67AH prismatic cell modules and wired them in series. This provided a total energy capacity of 3,966 Wh. <br>
<img src="assets\img\atv\samsung.webp" alt="My Image" width="75%" /> <br>
*The battery listing photo at Batteryhookup.com.* <br>

To control this battery I used a JK 200A continous BMS since it perfectly alligned with the 200A controller and JK is well regarded in the battery building world. And while I do prefer ANT BMS', I opted for the JK since it had 1A balancing instead of the 180ma found on the ANT because the cell capacity was so large and needed higher balancing. 

Originally, for the controller I went for a Sabvoton SVMC 72200, like on the city ripper. But as with that controller, I had a MOSFET short to the cooling plate underneat and the controller went up in flames. So, I purchased a newer Fardriver 72450 that had the same power specs, a better interface and features, and it was less than half the price. <br>
<img src="assets\img\atv\far.jpg" alt="My Image" width="75%" /> <br>
*A basic wiring harness with the new Fardriver controller (blue box).* <br>

##### Motor Integration
Integrating an aftermarket motor made with Chinese manufacturing standards into 28 year old Japanese ATV was really hard. The biggest challange I faced was making a spline adapter that went between the motors output shaft to the rear diffirentials input shaft. 

I made 4 different adapter designs before I found the perfect fit for the splines. I made the first three adapters to try and fit the motor to a 90 degree gearbox and have the motor transversly mounted, but I could never get the gears meshed correctly. I then switched to having the motor mounted inline with the driveshaft which worked much better. 
<img src="assets\img\atv\spv1.png" alt="My Image" width="49%" /> <img src="assets\img\atv\spv2.png" alt="My Image" width="49%" /> 
*Spline adapter v1 (left) and spline adapter v4 (right).*<br>
<img src="assets\img\atv\inline2.jpg" alt="My Image" width="75%" /> <br>
*The motor mounted with adapter v4 and final mounts.*<br>
As a small side note, I ordered the final adapter just as tarrifs on Chinese goods hit which forced me to change manufacturers and the quality of the final product was not as good as I hoped. The tolerances on the motor spline were slightly off which led to 1.5 hours of hand filing to get the right fit. 

##### Final Assembly
After mounting the motor and final spline adapter, I was able to finish up all of the wiring and put the plastic panels back on. During my final wiring I realized my 12v converter was too small. The headlights alone drew 12 amps and the converter could only supply 10 amps, so I had to do some re-wiring but nothing major. <br>
<img src="assets\img\atv\controls.jpg" alt="My Image" width="75%" /> <br>
*Control panel and voltage display with light switch, revers, and 2 speed modes.*<br>
<img src="assets\img\atv\final1.jpg" alt="My Image" width="75%" /> <br>
*Me tweaking the battery mounting of the almost finished ATV.*<br>

I have yet to do the final painting or battery mounting but the ATV is now rideable and my mom absolutely loved it. 

##### Reflection
This project came with some of my biggest setbacks except for the bike that caught fire. It took almost a year and a half from start to finish due to everything from laziness to tarrifs. It really pushed my limits of designing for manufacuring and my engineering knowledge in general. I failed many times with the gearbox and my spline adapters, but I always made another version. And seeing how happy my mom was with the final product made it worth all the trouble. The final ATV was quiet enough to have a normal conversation while riding and fast enough to pull a wheelie when necessary. It could go through foot deep mud and up rutted hills without complaint. While this project did have many of my biggest failures, it was nevertheless and incredible succes. 





