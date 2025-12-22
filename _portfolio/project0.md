---
caption: #what displays in the portfolio grid:
  title: Off-Road Super Bike
  subtitle: An electric off-road motorcycle designed for ultimate performance.
  thumbnail: assets\img\vortex\vortex_small.jpg
  
#what displays when the item is clicked:
title: Off-Road Super Bike
subtitle: An electric off-road motorcycle designed for ultimate performance.
image: assets\img\vortex\vortex.jpg #main image, can be a link or a file in assets/img/portfolio
alt: image alt text

---
### Overview
This off-road beast was designed to provide ultimate speed and performance. Everything from the knobby, dirt-ripping tires to the long wheelbase inspires confidence in the rider while maintaining supreme stability.

The active liquid cooling system for the controller allows the rider to push the bike hard all day without overheating. The quad-piston Magura brakes provide incredible stopping power with high fade resistance, aided by 2.3mm thick floating rotors.

With 32 kW of power on tap at all times, this monster can go from 0-60 mph in around 4 seconds. Overall, the high levels of stability, reliability, and performance make this bike an off-road conqueror.

**Specs**
- Frame: Vector Vortex
- Motor: Modified QS 205
- Battery: 96V 40Ah Custom
- Suspension: DNM USD-8 Fork and DNM Rear Shock
- Controller: Fardriver ND96530 (330A bus, 530A phase)
- Top Speed: 90 mph
- Total Power: 32,000 W

#### Build Process
This bike is built on an Eleek Positive frame, a model the Ukrainian military uses for its electric motorcycles. I chose this frame for its large battery compartment and center-mount motor options (my past bikes were all hub drives). Since the frame was built in and shipped from Ukraine, it took three months to arrive. In that time, I was able to design and build the battery.

##### Battery Build
I decided early on that I wanted a 96V architecture for the battery pack to increase efficiency under high load compared to my old 72V designs. The issue I found with 72V was that anything over 20 kW would drastically heat up motors and controllers due to the required current. To get more power, I needed to upgrade to 96V, a standard for off-the-shelf Battery Management Systems (BMS).

Another decision I made was that I wanted this battery to be incredibly efficient and overbuilt so it could be pushed all day. The first way I implemented this was with custom battery bus bars.

<img src="assets/img/vortex/busbars.jpg" alt="CAD drawing of custom bus bars" width="75%" /><br>
*A 2D representation of the bus bars for manufacturing.*

These bus bars were made of 0.3mm copper, which resulted in a total voltage drop of only 0.2 volts across all 27 bus bars in series. They were also great for manufacturing, as they have ultrasonically welded nickel tabs. This allows for spot-welding the nickel while still benefiting from copper's low resistance (copper is notoriously hard to spot-weld).

I also decided to go with incredibly powerful but affordable cells, choosing the Samsung 40T for its $3/cell price tag (in 2023) and 35A power rating. All told, this pack could output 350 amps at 96V (33,600 watts).

The final piece of the puzzle was the BMS. I opted for an ANT 630A peak BMS since it was incredibly overbuilt and had integrated Bluetooth capabilities, all for a $100 price tag.

<img src="assets/img/vortex/bat1.jpg" alt="Battery cells arranged in plastic holders" width="49%" /><img src="assets/img/vortex/bat2.jpg" alt="Battery cells with bus bars spot-welded on" width="49%" />
*The cells in holders (left) and with the bus bars spot-welded on (right).*

<img src="assets/img/vortex/bat4.jpg" alt="Battery pack with high-current wires attached" width="75%" /><br>
*The battery with high-current wires installed, waiting for balance leads.*

<img src="assets/img/vortex/bat5.jpg" alt="The nearly finished battery pack" width="49%" /><img src="assets/img/vortex/bat6.jpg" alt="The finished battery pack in black shrink wrap" width="49%" />
*The battery almost finished (left) and fully wrapped (right).*

##### Frame Assembly
After the frame arrived, I got straight to work. The battery was the most complex component, so assembly became easier once it was finished. The first thing I had to do was assemble all the mechanical components: wheels, motor, suspension, seat, swingarm, handlebars, and brakes. After integrating these components, I installed the battery and began creating the wiring harness.

<img src="assets/img/vortex/assem1.jpg" alt="The bike frame assembled with components, pre-wiring" width="75%" /><br>
*A photo with all components integrated, waiting for the wiring harness.*

The wiring harness was incredibly tricky to connect. The high-current path consisted of two 4-gauge positive and negative wires, which were very difficult to bend and move out of the way. I also had a cooling system with six half-inch tubes running through the same space. It ended up being somewhat messy but functional in the end.

<img src="assets/img/vortex/final1.jpg" alt="A photo of the fully assembled electric motorcycle from the side" width="75%" /><br>
<img src="assets/img/vortex/final2.jpg" alt="A close-up photo of the bike's motor and battery compartment" width="75%" /><br>
*The bike fully assembled.*

#### Reflection
This bike was the most intricate, powerful, and coolest motorcycle I have ever built. It taught me how to design efficient systems to prevent overheating, how to manage wiring with both large and small gauges, and, as always, it taught me patience.

If I were to do this project again, I would air-cool the controller and mount it externally to preserve room in the battery compartment for cleaner wiring. I would also make it less powerful and lighter. While this bike is incredibly fun to ride, you never use all 32 kW of power, and when you do, it's terrifying. And while the bike weighed only 160 lbs, it would have been more nimble if it were lighter. Finally, I would have chosen a different motor, as the one I chose did not have enough torque at low RPMs and was therefore not efficient for low-speed hill climbs and other routine off-road maneuvers.

I ended up selling this bike to my school's janitor when I left for college, as I no longer had a use for it. This bike remains my pride and joy and still holds a special place in my heart.