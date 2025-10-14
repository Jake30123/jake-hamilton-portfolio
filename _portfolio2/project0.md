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
Our FSAE team uses a 102s4p battery broken up into six segments of 17s4p. Each segment has its own balancing/monitoring board, data acquisition board, and a power and thermistor board. On our previous car, Mk6, the power board and the thermistor board were separate. The power board connected all the cell groups in series and carried the pack current to a REDCUBE connector on each end, while the thermistor board measured each cell's temperature. My challenge was to combine them while maintaining rules compliance and functionality.

<img src="assets/img/pt/mk6.webp" alt="The previous Mk6 power board and thermistor board side-by-side" width="75%" /><br>
*Mk6 power board (left) and thermistor board (right).*

**Project Requirements:**
- Follow all FSAE rules and best practices.
- Combine the power and thermistor boards into a single PCB.
- Fit the existing accumulator segment's mechanical constraints.
- Maintain connector placement compatibility with the BMS motherboard.

**Project Deliverables:**
- A complete PCB schematic and layout with the following components:
- Thermistors for temperature sensing.
- Copper strips and traces for voltage monitoring.
- Three 20-pin connectors to send signals to the BMS motherboard.
- Fuses located within 20-25mm of the copper pads.
- Normally open solder points.

##### Design Process
Before this project, I had never designed a PCB. I had experience with circuits and wiring, but never a full PCB from scratch. I broke down this problem into three sections: Mechanical Fit, Electrical Functionality, and Design Quality.

Above all, my design needed to fit the accumulator segments; without this fit, the board was obsolete. To ensure this, I got a DXF board outline file from the Accumulator team and we discussed which parts of the outline could be changed and which could not.

<img src="assets/img/pt/ptv1.png" alt="Version 1 of the PCB board outline CAD drawing" width="75%" /><br>
*The original board outline at the start of the project.*

After about an hour of looking at this design, I was convinced it would not work well. I would have had to place the thermistors offset from the negative terminal, which would have required extensive use of thermal compound to connect them thermally to the cells. I went back to the Accumulator team and suggested adding small bridges in the middle of the gaps to place the thermistors on. After a quick meeting with our electrical and mechanical leads, we decided it was feasible and came up with a v2 design.

<img src="assets/img/pt/ptv2.png" alt="Version 2 of the PCB board outline with bridges for thermistors" width="75%" /><br>
*Board outline v2.*

After finalizing the outline, I was able to finish my schematic and start placing components. This year, our team was switching away from one thermistor per cell, a configuration that was incredibly bandwidth-intensive for data collection. We also ended up with a lot of dead thermistors simply because of how many we used. We decided to change to one thermistor for every two cells, which was a much simpler design and faster to manufacture. It also made routing traces on the board much simpler. A month into my project, I had this first design:

<img src="assets/img/pt/pt2.png" alt="Version 1 of the full PCB layout" width="75%" /><br>
*V1 board layout.*

This version fit my first two qualifications of mechanical fit and electrical functionality, but it lacked design quality. The main feedback I received on this design was "more silkscreen!". Some of my traces were also relatively isolated, which made them prone to EMI—especially worrying since a false temperature spike could shut down our car. In response to the feedback, I consolidated my traces and added informative silkscreen that identified connector numbers, segment numbers, polarity, and parallel cell group numbers.

<img src="assets/img/pt/pt3.png" alt="Version 2 of the full PCB layout with improved traces and silkscreen" width="75%" /><br>
*V2 board layout.*

##### Manufacturing and Testing
This board was the final revision and was then sent out for manufacturing. Each project on our electrical team had one owner from start to finish, so after this board came in from JLCPCB, it was my duty to populate, test, and integrate it into the car. I had also never done SMD soldering prior to this project, and it was an incredibly fun learning experience. I fried a couple of LEDs on a test board, but after that, my technique improved and I was able to fully populate eight copies of my board (six for the car, one for testing, one backup).

After populating, I tested all of the boards using our BMS test motherboard.

<img src="assets/img/pt/pt4.jpg" alt="A test setup for the BMS motherboard with power supply and resistor divider" width="75%" /><br>
*BMS test setup powered by a power supply and resistor divider to simulate cells.*

In this process, I found a couple of dead thermistors and was able to replace them quickly. This process of testing boards taught me how to run test procedures and document them in our file system (Coda). On prior projects, I had just kept a mental note of issues, but when working on a team, it was important that others knew the issues I had found for future design cycles.

#### Reflection and Future Improvements
This project taught me all of my KiCad and PCB design basics, along with more general circuit knowledge, SMD soldering, and testing procedures. It was an incredibly fun project and really helped me fall in love with FSAE. I had an amazing set of mentors who helped me perfect my designs and walked me through the learning process.

If I had to do this board again, I would change the connectors we used, as they sometimes come a bit loose after large jolts to the car, causing a BMS fault and shutting the car down. I would also change the thermistors to be more reliable; right now at room temperature, there is a 2-3 degree Celsius difference between them. This could be corrected with a calibration algorithm, but our team did not have the time to do that this year as we would have needed to get our entire battery to the same exact temperature for multiple temperature points. 

#### Relevant FSAE Rules
- EV.6.3.1: All wires and terminals and other conductors used in the Tractive System must be sized for the continuous current they will conduct.
- EV.7.3.1: A Battery Management System must monitor the Accumulator(s) Voltage and Temperature. 
- EV.7.4.1: The BMS must measure the cell voltage of each cell.
- EV.7.4.3: All voltage sense wires to the BMS must have overcurrent protection or meet requirements for no overcurrent protection.
- EV.7.4.4: Overcurrent protection must occur in the conductor, wire, or PCB trace directly connected to the cell tab.
- EV.7.5.1: The BMS must measure the temperatures of critical points of the Accumulator.
- EV.7.5.3: Cell temperatures must be measured at the negative terminal of the respective cell.
- EV.7.5.4: The temperature sensor used must be in direct contact with the negative terminal or the negative terminal busbar less than 10 mm away from the connection.
- EV.7.5.5: For lithium-based cells, the temperature of a minimum of 20% of the cells must be monitored by the BMS, and they must be equally distributed.
- EV.7.5.7: Temperature sensors must have appropriate electrical isolation.