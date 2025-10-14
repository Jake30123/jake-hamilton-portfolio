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
In accordance with FSAE rules, each car needs to have a Brake Speed Plausability Device (BSPD). Among many other functions like calculating throttle travel and brake pressure it also:

EV.4.7.1 Must monitor for the two conditions:<br>
• The mechanical brakes are engaged EV.4.6, T.3.2.4<br>
• The APPS signals more than 25% Pedal Travel EV.4.5

EV.4.7.2 If the two conditions in EV.4.7.1 occur at the same time:<br>
a. Power to the Motor(s) must be immediately and completely shut down <br>
b. The Motor shut down must stay active until the APPS signals less than 5% Pedal Travel,
with or without brake operation
The team must be able to demonstrate these actions at Technical Inspection

Our previous code (pasted at the bottom)

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