---
caption: #what displays in the portfolio grid:
  title: Power and Thermistor Board
  subtitle: A custom PCB for measuring cell voltage and temperature. 
  thumbnail: assets\img\pt\pt1.jpg
  
#what displays when the item is clicked:
title: Power and Thermistor Board
subtitle: A custom PCB for measuring cell voltage and temperature. 
image: assets\img\pt\pt1.jpg #main image, can be a link or a file in assets/img/portfolio
alt: image alt text

---
### Overview
Our FSAE team uses a 102s 4p battery broken up into 6 segments of 17s 4p. Each segment has its own balancing/monitoring board, data acquisition board, and power and thermistor board. On our previous car, Mk6, the power board and thermistor board were seperate. The power board connected all of the cell groups in series and carried pack current to a REDCUBE connector on each end, and the thermistor board measured each cells temperature. My challenge was to combine them while maintaining rules compliance and functionality.<br>
<img src="assets\img\pt\mk6.webp" alt="My Image" width="75%" /><br>
*Mk6 power board (left) and thermistory board(right).*<br>

##### Project Requirements
1: Follow all rules and best practices (listed at bottom) <br>
2: Combine power and thermistor boards <br>
3: Fit accumulator segments <br>
4: Be compatible with the BMS motherboard with connector placement. <br>

##### Project Deliverables 
PCB schematic and layout with the following components: <br>
1: Thermistors for temps<br>
2: Copper strips and traces for voltages<br>
3: 3xConnectors(20pin) to send the signals to the power board<br>
4: Fuses(within 20-25mm from the copper pads)<br>
5: Normally open solder points<br>

##### Design Process
Before this project I had never designed a PCB before, I had experience with circuits and wiring but never a full PCB. I broke down this problem into three sections:
1: Mechanical Fit
2: Electrical Functionality
3: Design Quality

Above anything I needed my design to fit the accumulator segments, without this fit the board was obsolete. To ensure this fit I got a DXF board outline file from the Accumulator team and we talked over what parts out the outline could be changed and what could not. <br>
<img src="assets\img\pt\ptv1.png" alt="My Image" width="75%" /><br>
*The original board outline at the start of the project.*<br><br>
After maybe an hour of looking at this design I was pretty convinced it would not work terribly well. I would have had to place the thermistors offset from the negative terminal which would have required extensive thermal compound use to thermally connect them to the cells. I went back to the accumulator team and suggested adding little bridges in the middle of the gaps to place the thermistors on. After a quick meeting with our electrical and mechanical leads we decided it was feasible and we came up with a v2 design. <br>
<img src="assets\img\pt\ptv2.png" alt="My Image" width="75%" /><br>
*Board outline v2.*<br><br>
After finalizing the outline I was able to finish my schematic and start placing components. This year, our team was switching away from one thermistor per cell, a configuration that was incredibly bandwidth intensive for data collection. Also, we ended up with a lot of dead thermistors simply because of how many we used. We decided to change to one thermistor for every two cells which was a much simpler design and faster to manufacture. It also made running traces on the board much simpler as I had half as many thermistor traces. By a month into my project I had this first design:<br>
<img src="assets\img\pt\pt2.png" alt="My Image" width="75%" /><br>
*V1 board layout.*<br><br>
This version fit my first two qualifications of mechanical fit and electrical functionality, but lacked design quality. The main feedback I recieved on this design was "more silkscreen!". Some of my traces were also relatively isolated which made them prone to EMI which was especially worrying since a false temperature spike could shut down our car. In response to the feedback I consolidated my traces and added informative silkscreen that identified connector numbers, segment numbers, polarity, and parrallel cell group number. <br>
<img src="assets\img\pt\pt3.png" alt="My Image" width="75%" /><br>
*V2 board layout.*<br><br>

##### Manufacturing and Testing
This board was the final revision and was then sent out for manufacturing. Each project on our electrical team had one owner from start to finish, so after this board came in from JLCPCB it was my duty to populate, test, and integrate it into the car. I had also never SMD soldered prior to this project and it was an incredibly fun learning experience. I fried a couple of LEDs on a test board but after that my technique improved and I was able to fully populate 8 copies of my board (6 for the car, 1 for testing, 1 backup). After populating I then tested all of the boards using our BMS test motherboard.
<img src="assets\img\pt\pt4.jpg" alt="My Image" width="75%" /><br>
*BMS test setup powered by a power supply and resistor divider to simulate cells.*<br><br>
In this process I found a couple dead thermistors and was able to replace them quickly. This process of testing boards taught me how to run test procedures and document them in our file system (Coda). On any prior projects I had just kept mental note of issues but when working on a team it was important that others knew the issues I had found for future design cycles. 

##### Reflection and Future Improvements
This project taught me all of my KiCad and PCB design basics along with more general circuit knowledge, SMD soldering, and testing procedures. It was an incredibly fun project and really helped me fall extra in love with FSAE. I had an amazing set of mentors that helped me perfect my designs and walk me through the learning process. 

If I had to do board again I would change the connectors we used as they sometimes come a bit loose after large jolts to the car, causing a BMS fault and shutting the car down. I would also change the thermistors we use to be more reliable, right now at room temperature there is a 2-3 degree celcius difference in the thermsitors. This could be corrected with a calibration algorithm but our BMS does not have enough memory or processing power to perform or store these values. A more powerful BMS is an improvement we are making for Mk8 (our next car), so hopefully we can calibrate our thermistors better then. 




##### Rules 
EV.6.3.1 All wires and terminals and other conductors used in the Tractive System must be sized for the
continuous current they will conduct

EV.7.3.1 A Battery Management System must monitor the Accumulator(s) Voltage EV.7.4 and
Temperature EV.7.5 when the:
a. Tractive System is Active EV.11.5
b. Accumulator is connected to a Charger EV.8.3

EV.7.4.1 The BMS must measure the cell voltage of each cell
When single cells are directly connected in parallel, only one voltage measurement is needed

EV.7.4.3 All voltage sense wires to the BMS must meet one of:
a. Have Overcurrent Protection EV.7.4.4 below
b. Meet requirements for no Overcurrent Protection listed in EV.7.4.5 below

EV.7.4.4 When used, Overcurrent Protection for the BMS voltage sense wires must meet the two:
a. The Overcurrent Protection must occur in the conductor, wire or PCB trace which is
directly connected to the cell tab.
b. The voltage rating of the Overcurrent Protection must be equal to or higher than the
maximum segment voltage

EV.7.5.1 The BMS must measure the temperatures of critical points of the Accumulator

EV.7.5.3 Cell temperatures must be measured at the negative terminal of the respective cell

EV.7.5.4 The temperature sensor used must be in direct contact with one of:
• The negative terminal itself
• The negative terminal busbar less than 10 mm away from the spot weld or clamping
source on the negative cell terminal

EV.7.5.5 For lithium based cells,
a. The temperature of a minimum of 20% of the cells must be monitored by the BMS
b. The monitored cells must be equally distributed inside the Accumulator Container(s)
The temperature of each cell should be monitored

EV.7.5.6 Multiple cells may be monitored with one temperature sensor, if EV.7.5 is met for all cells
sensed by the sensor.

EV.7.5.7 Temperature sensors must have appropriate electrical isolation that meets one of the two:
• Between the sensor and cell
• In the sensing circuit
The isolation must consider GLV/TS isolation as well as common mode voltages between
sense locations.