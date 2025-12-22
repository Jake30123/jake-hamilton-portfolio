---
caption: #what displays in the portfolio grid:
  title: Throttle Firmware
  subtitle: Writing throttle logic and fault handling. 
  thumbnail: assets\img\firm\thr1.png
  
#what displays when the item is clicked:
title: Throttle Firmware
subtitle: Writing throttle logic and fault handling. 
image: assets\img\firm\thr1.png #main image, can be a link or a file in assets/img/portfolio
alt: image alt text

---
### Overview
In accordance with FSAE rules, each car needs to have a Brake Speed Plausability Device (BSPD). Among many other functions, like calculating throttle travel and brake pressure, it also:

EV.4.7.1 Must monitor for the two conditions:<br>
• The mechanical brakes are engaged EV.4.6, T.3.2.4<br>
• The APPS signals more than 25% Pedal Travel EV.4.5

EV.4.7.2 If the two conditions in EV.4.7.1 occur at the same time:<br>
a. Power to the Motor(s) must be immediately and completely shut down <br>
b. The Motor shut down must stay active until the APPS signals less than 5% Pedal Travel,
with or without brake operation
The team must be able to demonstrate these actions at Technical Inspection

Our previous code (pasted at the bottom) had an error where the throttle position was detached from reality and the 25% throttle + brake fault would not latch correctly. After triggering the fault, anytime the throttle then went below 25%, the fault would un-latch, instead of unlatching at 5% like it was supposed to. To fix this code, I needed to calibrate the throttle and re-think the fault latching logic. 

#### Throttle Calibration
For quick background, the throttle is comprised of two different linear potentiometers that are a part of two different voltage dividers, one with a 1kOhm resistor and the other with a 10kOhm resistor. The throttle signal is two different voltages that change as the linear pots travel with the throttle. Since the pots and throttle travel are linear, all I needed to calibrate the throttle was the end voltage and the start voltage. To find these values, I used a .dbc file that outputted the raw ADC value of the throttle in real time to the terminal. 
<img src="assets/img/firm/term.jpg" alt=".dbc terminal output." width="100%" />
*Terminal output with throttle at full.*<br><br>
I recorded the max and min values, and then I added them to the throttle config file for the firmware. 

```c
define THROTTLE_R_MIN_COUNTS (int16_t)((20 + THROTTLE_BUFFER) >> 2)
define THROTTLE_R_MAX_COUNTS (int16_t)((667 - THROTTLE_BUFFER) >> 2)
define THROTTLE_L_MIN_COUNTS (int16_t)((30 + THROTTLE_BUFFER) >> 2)
define THROTTLE_L_MAX_COUNTS (int16_t)((1023 - THROTTLE_BUFFER) >> 2)
```
*Each line starts with a '#' that was removed for formatting purposes.*


##### New Brake Fault Code
```c
static bool check_brake(int16_t pos_min) {
    // bool brake_implausibility_occurred = false;

    if (throttle_state.brake_pressed) {
        // if brakes are pressed
        if (pos_min >= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD) {
            // brake is pressed, pedal travel >= 25%
            // brake_implausibility_occurred = true;
            throttle_debug.throttle_brake_implaus = true;
            return true;
        } else if (throttle_debug.throttle_brake_implaus && pos_min >= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD_LOW){
            // if there has 
            return true;
        } else {
            // if brake is pressed and no implausibility
            // brake_implausibility_occurred = false;
            throttle_debug.throttle_brake_implaus = false;
            return false;
        }

    } else {
        // brakes are not pressed
        if (throttle_debug.throttle_brake_implaus) {
            // but implausibility prev occurred
            if (pos_min <= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD_LOW) {
                // however pedal is <= 5% travel, no implausibility
                // brake_implausibility_occurred = false;
                throttle_debug.throttle_brake_implaus = false;
                return false;
            } else {
                // else pedal travel still >5%
                throttle_debug.throttle_brake_implaus = true;
                return true;
            }
        } else {
            // brake not pressed, no prev implausibility
            throttle_debug.throttle_brake_implaus = false;
            return false;
        }
    }
}
```
##### Old Brake Fault Code
```c
static bool check_brake(int1hundred_t pos_min) {
    static bool brake_implausibility_occurred = false;

    if (throttle_state.brake_pressed) {
        // if brakes are pressed
        if (pos_min >= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD) {
            // brake is pressed, pedal travel >= 25%
            brake_implausibility_occurred = true;
            throttle.throttle_status = THROTTLE_BRAKE_PRESSED;
            throttle_debug.throttle_brake_implaus = true;
            return true;
        } else {
            // brake is pressed, pedal travel < 25%
            // no implausibility
            throttle_debug.throttle_brake_implaus = false;
        }

        if (brake_implausibility_occurred) {
            // if brake is pressed & implausibility prev occurred
            if (pos_min <= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD_LOW) {
                // and pedal travel <= 5%
                brake_implausibility_occurred = false;
                throttle.throttle_status = THROTTLE_RUN;
                throttle_debug.throttle_brake_implaus = false;
                return false;
            } else {
                // implausibility prev occurred, pedal travel > 5%
                throttle_debug.throttle_brake_implaus = true;
                throttle.throttle_status = THROTTLE_BRAKE_PRESSED;
                return true;
            }
        } else {
            // no implausibility prev occurred then still no implausibility
            throttle.throttle_status = THROTTLE_RUN;
            throttle_debug.throttle_brake_implaus = false;
            return false;
        }
    } else {
        // brakes are not pressed
        if (brake_implausibility_occurred) { 
            if (pos_min <= APPS_BRAKE_IMPLAUSIBILITY_THRESHOLD_LOW) {
                // however pedal is <= 5% travel, no implausibility
                brake_implausibility_occurred = false;
                throttle_debug.throttle_brake_implaus = false;
                throttle.throttle_status = THROTTLE_RUN;
                return false;
            } else {
                // else pedal travel still >5%
                throttle.throttle_status = THROTTLE_BRAKE_PRESSED;
                throttle_debug.throttle_brake_implaus = true;
                return true;
            }
        } else {
            // brake not pressed, no prev implausibility
            throttle.throttle_status = THROTTLE_RUN;
            throttle_debug.throttle_brake_implaus = false;
            return false;
        }
    }
}
```