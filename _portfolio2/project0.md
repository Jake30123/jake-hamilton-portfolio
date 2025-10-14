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
~ Follow all rules and best practices (listed at bottom) <br>
~ Combine power and thermistor boards <br>
~ Fit accumulator segments <br>
~ Be compatible with the BMS motherboard in relation to connector placement. <br>

##### Project Deliverables 
PCB schematic and layout with the following components: <br>
~ Thermistors for temps<br>
~ Copper strips and traces for voltages<br>
~ 3xConnectors(20pin) to send the signals to the power board<br>
~ Fuses(within 20-25mm from the copper pads)<br>
~ Normally open solder points<br>

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