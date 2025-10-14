#include "libs/adc/api.h"
#include "libs/can/api.h"
#include "libs/gpio/api.h"
#include "libs/timer/api.h"

#include "throttle_config.h"
#include "vehicle/mkvii/software/lv/throttle/can_api.h"

#include <avr/interrupt.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <sys/types.h>
#include <util/delay.h>

// commented out temporarily for Jack's testing
#include "projects/btldr/btldr_lib.h"
#include "projects/btldr/git_sha.h"
#include "projects/btldr/libs/image/api.h"

// uint8_t heartbeat_counter = 0;

/*
 * Required for btldr
 */
image_hdr_t image_hdr __attribute__((section(".image_hdr"))) = {
    .image_magic = IMAGE_MAGIC,
    .git_sha = STABLE_GIT_COMMIT,
};

/*
 * Sets the torque request in the motor controller command message
 */
#define SET_TORQUE_REQUEST(torque) \
    (m192_command_message.torque_command = (torque))

#define MIN(a, b) (((a) < (b)) ? (a) : (b))
#define MAX(a, b) (((a) > (b)) ? (a) : (b))

// all possible throttle states
enum State {
    THROTTLE_IDLE,
    THROTTLE_RUN,
    THROTTLE_L_OUT_OF_RANGE,
    THROTTLE_R_OUT_OF_RANGE,
    THROTTLE_POSITION_IMPLAUSIBILITY,
    THROTTLE_BRAKE_PRESSED
};

struct throttle_state_s {
    volatile bool send_can;
    uint16_t implausibility_fault_counter;
    bool brake_pressed;
} throttle_state = { 0 };

void timer0_isr(void) {
    throttle_state.send_can = true;
}

volatile bool run_1ms = false;

void timer1_isr(void) {
    run_1ms = true;
}

void pcint0_callback(void) {
    throttle.ss_is = !gpio_get_pin(SS_IS);
}

void update_Error_LED(void) {
    if (throttle_debug.throttle_l_out_of_range || throttle_debug.throttle_r_out_of_range
    || throttle_debug.throttle_deviation || throttle_debug.throttle_brake_implaus) {
        gpio_set_pin(ERROR_LED);
    } else {
        gpio_clear_pin(ERROR_LED);
    }
}

// void update_Heartbeat_LED(void) {
//     heartbeat_counter += 1;
//     if (heartbeat_counter == 50) {
//         gpio_toggle_pin(HEARTBEAT_LED);
//         throttle.heartbeat = !throttle.heartbeat;
//         heartbeat_counter = 0;
//     }
// }

/*
    Read value from throttle potentiometer, maps it to value between 0 and
    255 where 255 = 100% throttle
    Takes in bool for whether the read throttle is the left or not for
    debugging purposes
    Returns an int16_t representing pedal travel
*/
static int16_t get_throttle_travel(const throttle_potentiometer_s* throttle,
                                   bool is_left_throttle) {
    int16_t throttle_raw = adc_read(throttle->adc_pin);
    if (is_left_throttle) {
        throttle_debug.throttle_l_raw = throttle_raw;
    } else {
        throttle_debug.throttle_r_raw = throttle_raw;
    }
    throttle_raw >>= 2; // TODO: ask why this is here
    int16_t range = throttle->throttle_max - throttle->throttle_min;
    float position_pct
        = (float)(throttle_raw - throttle->throttle_min) / (float)range;
    return floor(position_pct * MAX_THROTTLE_POS);
}

/*
    Check if sensors return a value out of range (<0 or >255)
    Args:
        pos_l: int16_t sensor value of throttle pot 1eft
        pos_r: int16_t sensor value of throttle pot right
    Returns:
        implausibility: boolean if throttle out of range or not
*/
static bool check_out_of_range(int16_t* pos_l, int16_t* pos_r) {
    bool implausibility = false; 

    // Check 1st pot
    if (*pos_l > MAX_THROTTLE_POS) {
        *pos_l = MAX_THROTTLE_POS;
        throttle_debug.throttle_l_out_of_range = true;
        implausibility = true;
    } else if (*pos_l < MIN_THROTTLE_POS) {
        *pos_l = MIN_THROTTLE_POS;
        throttle_debug.throttle_l_out_of_range = true;
        implausibility = true;
    } else {
        throttle_debug.throttle_l_out_of_range = false;
    }

    // Check 2nd pot
    if (*pos_r > MAX_THROTTLE_POS) {
        *pos_r = MAX_THROTTLE_POS;
        throttle_debug.throttle_r_out_of_range = true;
        implausibility = true;
    } else if (*pos_r < MIN_THROTTLE_POS) {
        *pos_r = MIN_THROTTLE_POS;
        throttle_debug.throttle_r_out_of_range = true;
        implausibility = true;
    } else {
        // Will be reset if Ready to Drive is not on
        throttle_debug.throttle_r_out_of_range = false;
    }
    return implausibility;
}

/*
    Check for deviation between 2 throttle sensors, >10% deviation is an
    implausibility
    Args:
        pos_min: int16_t bigger sensor value of the 2 throttle pots
        pos_max: int16_t smaller sensor value of the 2 throttle pots
    Returns:
        boolean if there's deviation or not
*/
static bool check_deviation(int16_t pos_max, int16_t pos_min) {
    if (pos_max - pos_min > APPS_IMPLAUSIBILITY_DEVIATION_THRESHOLD) {
        throttle_debug.throttle_deviation = true;
        return true;
    } else {
        throttle_debug.throttle_deviation = false;
        return false;
    }
}

/*
    Check if brakes are on while pedal travel >= 25%, if so return
    implausibility If pedal travel becomes <5%, clear implausibility.
    Args:
        pos_min: int16_t smaller sensor value of the 2 pots
    Returns:
        true if implausibility, false if not
*/


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

int main(void) {
    sei();

    can_init_throttle();
    adc_init();

    timer_init(&timer0_cfg);
    timer_init(&timer1_cfg);

    updater_init(BTLDR_ID, 5);
    gpio_set_mode(SS_IS, INPUT);
    // gpio_set_mode(HEARTBEAT_LED, OUTPUT);
    gpio_set_mode(ERROR_LED, OUTPUT);
    gpio_enable_interrupt(SS_IS);

    throttle.throttle_status = THROTTLE_IDLE;

    pcint0_callback();

    /*
     * This feature is added so that the inverter cannot be accidentally enabled
     * when first powered up. This feature requires that before sending out an
     * Inverter Enable command, the user must send out an Inverter Disable
     * command. Once the inverter sees a Disable command, the lockout is removed
     * and controller can receive the Inverter Enable command
     */
    can_send_m192_command_message();

    m192_command_message.direction_command = MOTOR_CLOCKWISE;

    can_receive_bspd();
    can_receive_dashboard();

    while (true) {
        updater_loop();
        if (run_1ms) {
            run_1ms = false;

            if (can_poll_receive_bspd() == 0) {
                // checking brake status
                throttle_state.brake_pressed = bspd.brake_gate;
                can_receive_bspd();
            }

            if (can_poll_receive_dashboard() == 0) {
                // check RTD status
                can_receive_dashboard();
                m192_command_message.inverter_enable = dashboard.ready_to_drive;
            }

            int16_t pos_l = get_throttle_travel(&throttle_l, true);
            int16_t pos_r = get_throttle_travel(&throttle_r, false);
            int16_t pos_min = MIN(pos_l, pos_r);
            int16_t pos_max = MAX(pos_l, pos_r);

            throttle.throttle_l_pos = pos_l;
            throttle.throttle_r_pos = pos_r;

            // checking implausibilities
            
            bool oor_implausibility;

            if (check_out_of_range(&pos_l, &pos_r)) { // if out of range value is true,
                oor_implausibility = true;
                // first check if left_throttle debug has been triggered 
                if (throttle_debug.throttle_l_out_of_range) {
                    throttle.throttle_status = THROTTLE_L_OUT_OF_RANGE;
                }
                // do the same with the right throttle
                if (throttle_debug.throttle_r_out_of_range) {
                    throttle.throttle_status = THROTTLE_R_OUT_OF_RANGE;
                   }
            } else {
                // if nothing is triggered, oor_implaus is not triggered
		        oor_implausibility = false;
            }

            bool deviation_implausibility;

            if (check_deviation(pos_max, pos_min)) {
                deviation_implausibility = true;
                throttle.throttle_status = THROTTLE_POSITION_IMPLAUSIBILITY;
            } else {
            	deviation_implausibility = false;
            }

            update_Error_LED();
            
            if (check_brake(pos_min)) {
                SET_TORQUE_REQUEST(0);
                throttle.throttle_status = THROTTLE_BRAKE_PRESSED;
                update_Error_LED();
                continue;
            }

            if (oor_implausibility || deviation_implausibility) {
                throttle_state.implausibility_fault_counter++;
                if (throttle_state.implausibility_fault_counter
                    >= IMPLAUSIBILITY_TIME_LIMIT) {
                    /*
                    if timer reaches IMPLAUSIBILITY_TIMEOUT, request 0 torque
                    */
                    SET_TORQUE_REQUEST(0);
                    throttle_state.implausibility_fault_counter = 0;
                }
                continue;

            } else {
                throttle.throttle_status = THROTTLE_RUN;
                throttle_state.implausibility_fault_counter = 0;
                update_Error_LED();

                // NOTE: If we decide to do a non-linear map, that would go here
                int16_t torque_request = pos_min * TORQUE_REQUEST_SCALE;

                //Prevent motor whining while idle
                if(torque_request < 20) {
                    torque_request = 0;
                }
                if(torque_request > 2300) {
                    torque_request = 2540;
                }

                SET_TORQUE_REQUEST(torque_request);
            }

            if (!dashboard.ready_to_drive) {
                SET_TORQUE_REQUEST(0);
                throttle.throttle_status = THROTTLE_IDLE;
                continue;
            }
        }

        if (throttle_state.send_can) {
            can_send_throttle();
            can_send_throttle_debug();
            can_send_m192_command_message();
            // update_Heartbeat_LED();
            throttle_state.send_can = false;
        }
    }
}