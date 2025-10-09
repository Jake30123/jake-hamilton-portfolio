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
This off-road beast was designed to provide ultimate speed and performance offroad. Everything from the knobby dirt-ripping tires to the long wheelbase inspire confidence in the rider while maintaining supreme stability. 

The active liquid cooling system for the controller allows the rider to push the bike hard all day without overheating. The quad-piston Magura brakes provide incredible stopping power with super high fade resistance aided by 2.3mm thick floating rotors. 

32 KW of power are on tap at all times which can bring this monster from 0-60 in around 4. Overall, the high levels of stability, reliability, and perfomance make this bike an off-road conquerer. 

###### Specs
Frame: Vector Vortex<br>
Motor: Modified QS 205<br>
Battery: 96v 40AH Custom<br>
Suspension: DNM USD-8 and DNM Shock<br>
Controller: Fardriver ND96530 (330 bus amps, 530 phase)<br>
**Total Power: 32,000W**

### Build Process
This bike is built on an Eleek Positive frame, a frame the Ukranian military uses for their electric motorcycles. I chose this frame for its large battery compartment and center mount motor options (my past bikes had all been hub drives). Since the frame was also built in Ukraine it took three months to arrive. In that time I was able to design and build the battery. 

##### Battery Build
I decided early on that I wanted a 96v architecture for the pack for increased efficiency under high load compared to my old 72v designs. The issue I found with 72v was that anything over 20kw would drastically heat up motors and controllers due to the current required. To get even more power I needed to up to 96v as it was a standard for off the shelf BMS'. Another decision I made early on was that I wanted this battery to be incredibly efficient and overbuilt so it could be pushed all day. The first way I implimented this was with custom battery bus bars. <br>
<img src="assets\img\vortex\busbars.jpg" alt="My Image" width="75%" /><br>
*A 2d representation of the bus bars for manufacturing.*<br>

These bus bars were made of 0.3mm copper which resulted in a total voltage drop of 0.2 volts across all 27 bus bars in series. These bus bars also are great for manufacturing purposes as they have ultrasonicly welded nickle tabs that connect to copper so you can spotweld the nickel but benefit from the coppers low resistance (copper is nutoriosuly hard to spot weld).

I also decided to go with incredibly powerful but affordable cells so I chose the Samsung 40t for its $3/cell price tag (back in 2023) and 35 amp power rating. This pack all told could output 350 amps at 96v (33,600 watts). 

The final piece of the puzzle was the BMS. I opted for an ANT 630 amp peak BMS since it was incredibly overbuilt and had integrated bluetooth capabilities, all for an $100 price tag. 

<img src="assets\img\vortex\bat1.jpg" alt="My Image" width="49%" /><img src="assets\img\vortex\bat2.jpg" alt="My Image" width="49%" />
*The bare cells in holders and then with the bus bars spot welded on.*
<img src="assets\img\vortex\bat4.jpg" alt="My Image" width="75%" /><br>
*The battery with high current wires done and waiting for the balance leads.*<br>
<img src="assets\img\vortex\bat5.jpg" alt="My Image" width="49%" /><img src="assets\img\vortex\bat6.jpg" alt="My Image" width="49%" />
*The battery almost finished and then finished with shrink wrap.*<br>

##### Frame Assembly
After the frame arrived I got straight to work. The battery was the single most complex single component so after it was done other things became easier. The first thing I had to do was assemble all the mechanical components: wheels, motor, suspension, seat, swingarm, handlebars, brakes. After integrating all of these components I added in the battery and wiring and got to work making the wiring harness. <br>
<img src="assets\img\vortex\assem1.jpg" alt="My Image" width="75%" /><br>
*A photo with all components integrated waiting for the wiring harness.*<br><br>
The wiring harness was incredibly tricky to connect as the high current path was two 4 gauge wires for positive and negative which were incredibly hard to bend and move out of the way. I also had a cooling system with a total of 6 half-inch tubes running through the same space as the wiring harness. It ended up being somewhat messy but functional in the end. 
<img src="assets\img\vortex\final1.jpg" alt="My Image" width="75%" /><br>
<img src="assets\img\vortex\final2.jpg" alt="My Image" width="75%" /><br>
*The bike fully assembled.*

### Reflection
This bike was the most intricate, powerful, and cool motorcycle I ever built. It taught me how to design efficient systems to prevent overheating, how to wire with super large and incredibly small wires, and as usual, patience. If I had to re-do this project I would air-cool the controller and mount it externally to preserve room in the battery compartment for cleaner wiring. I would also make it less powerful and lighter. While this bike is incredibly fun to ride you never use all 32kw of power, and when you do its terrifying. And while the bike was only 160lbs if it was lighter it would have been more nimble. Finally, I would have chosen a different motor as the one I chose did not have enough torque at low RPMs and thus was not efficient for low speed hill climbs and other routine off-road maneuvers. 

I ended up selling this bike to my schools janitor after going to college as I had no more use for it, but this bike is my pride and joy and still has a place in my heart. 




