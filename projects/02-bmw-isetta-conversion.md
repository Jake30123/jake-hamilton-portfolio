---
slug: bmw-isetta-conversion
category: Professional
title: "BMW Isetta Electric Conversion"
subtitle: "A customer electric conversion of a BMW Isetta."
thumbnail: assets/img/isetta/hero.jpg
hero: assets/img/isetta/hero.jpg
tags: [EV conversion, Customer project, CAN, Battery]
status: "In progress"
role: "Customer Project"
year: "2026"
specs:
  - ["Battery", "2× Tesla Model S modules, 12S"]
  - ["Motor controller", "Curtis AC F6-A"]
  - ["BMS", "Thunderstruck MCU + 2 satellite modules (isoSPI)"]
  - ["Charger", "Thunderstruck TSM2500"]
  - ["Charge port", "NACS (J1772 signaling)"]
  - ["HV conductors", "2 AWG"]
---

## Overview

I picked up this project kind of randomly. I was at the Newton Green Expo in Newton, Massachusetts with the Olin College Formula SAE team. We had our electric car out and a couple of posters about the team, and there were kids climbing all over everything. It was a super fun time! Then a local politician running for city council came up and asked if anyone there knew about batteries.

And I did! I'd picked up a bunch of battery experience on Formula and from my earlier e-bike projects, like designing a 96 V battery for my off-road super bike and some larger capacity 72 V batteries for customer projects. So we got to talking, and he told me he knew a guy who was converting his little BMW Isetta to electric.

My first thought was, what on earth is a BMW Isetta. It turns out it's a tiny bubble car BMW built in the 1950s, with a single door on the front and rear wheels set so close together they almost look like one. It's an absolutely adorable, ridiculous little car, and it's so small that you can convert it to electric with a pretty chill powertrain.

### The Starting Point

The owner had already bought a few components, including a BMS, two Tesla Model S battery modules, and a motor controller, and he needed someone to wire it all up for him. Right then I knew it was a project I could take on, but I also knew it was going to be a lot more than just wiring stuff up. There was going to be debugging and all the fun bits of integration, like parts that weren't there and systems that didn't want to talk to each other. It was going to be an adventure!

So I went to go look at the car, and there was no body on it. It had been stripped all the way down to the frame, and I remember thinking, wow, this guy is serious. None of the electrical work had been done yet, so I basically started from scratch.

### Mapping the System

My first step was getting a list of every component he had and pulling up all of their wiring diagrams. From there I figured out every single wire on the car I actually needed to care about to get to a bare minimum rolling chassis.

<!-- specs: Wiring to map -->
Throttle and brake: Driver inputs to the motor controller.
Charger to BMS: CAN.
Controller to laptop: CAN for programming (which turned into a whole ordeal, more on that below).
Charge port: J1772 signaling from the charge controller. The port is actually NACS, but it uses the same logic and wires as J1772 for AC charging.
Main contactor: Relay control from the motor controller, since the controller runs the whole precharge circuit and has to close the main contactor itself.
BMS modules: isoSPI between the Thunderstruck central MCU and its two satellite modules, one on each Tesla module.
<!-- /specs -->

Once I had all the wires mapped out, I went through every part with little bits of Scotch tape and made wire flags, each with a little three letter abbreviation, so I always knew what was what.

### High Voltage

Thankfully the battery was a pretty simple install. 
![Battery modules right after install](assets/img/isetta/1.jpg)
*The two Tesla battery modules right after install.*
The harder part was figuring out how much current I should actually let the system draw. The limiting factor ended up being the car's transmission. The original engine only made about 13 horsepower, and I didn't want to go too far past what the drivetrain was built for. Maybe just a little bit past it, because you've gotta give the car a bit of kick!

So I worked the math backwards. Two 6S modules in series make a 12S pack at roughly 44 V nominal, and aiming for about 15 horsepower (around 11 kW) works out to roughly 250 A. I sized my conductors from there and landed on 2 AWG wire, which is about the biggest wire I could realistically work with in that space. It's tough stuff to bend.

With the high current conductors made, I wired up the main contactor, the charge contactor, and the BMS, and then ran a bare minimum test to see if I could get the contactors to close and open. Surprisingly, almost everything worked right away! The charge contactor was totally fine. The main contactor, however, would not close, and that one took me a long time to figure out.
![Annoted picture of electronics](assets/img/isetta/5.jpg)
*Annotated view of the bare-bones electronics.*

#### Low Voltage

I also wired up a complete 12 V system. We're redoing the car's entire low voltage wiring harness, so that became part of the project too.

### Talking to a Curtis Controller

The main contactor wasn't closing because the controller wasn't precharging. It would just flash its little status light to tell me it wasn't precharging, but it wouldn't tell me why, because that would be too easy. And so began the whole saga of figuring out how to actually talk to a Curtis controller.

There isn't a ton of documentation from Curtis, and there aren't many people in the hobby world who use them. They're forklift motor controllers, so they're not really meant for cars. They work totally fine because they're super overbuilt, but forklift manufacturers aren't exactly telling the internet how they build their forklifts.

#### Building My Own Tool

The controller talks to its programming software over CAN using the CANopen standard. All I needed to do was change the battery voltage settings and tune the throttle, and paying $1,000 for software to do that felt kind of preposterous to me. So I sort of naively figured that if everything is over CAN, I could just build a tool for it myself.

I read up on CANopen, worked out what each message from the Curtis controller was saying, and with help from some AI tools I wrote a Python app that could read a bunch of values off the controller. That actually gave me real visibility into the problem. I could read every status flag and see that the contactor wasn't closed and that the capacitor voltage was way lower than the battery voltage, all because it wasn't precharging.

I thought I was SO close! But every time I tried to change a value, the controller would flag it and basically say that the request came from a weird place and it wasn't going to let me change that. The parameters I needed were locked behind Curtis's own tools. That one took me a while and was honestly a bit painful, because I really wanted to save my client the money.

#### Buying the Software

That left buying the official programming software, which runs anywhere from $500 to $1,000. I bought the $500 option, and I was very sure it would work, and it didn't. That was a harsh lesson. I was able to return it for a full refund, but first I had to go to the owner and tell him I'd ordered the wrong software.

It's always good to have a little practice in humility. I explained where I messed up, why I made the decision I did, and what I was going to do to fix it. Thankfully the next software we bought did work, although at $1,000 it really hurt.

With the right software the problem was pretty obvious. The battery voltage levels in the controller were just set wrong, so it thought the pack was undervoltage and refused to precharge. Once I reset all of that, things got a lot smoother.

![Curtis Integrated Toolkit screenshot](assets/img/isetta/scrn.png)
*Screenshot of the Curtis Integrated Toolkit Software after fixing the voltage level issue (contactor was not connected).*

#### First Spin

With the motor and battery wired to the controller, I got the motor spinning pretty easily! The main thing I had to tune was the offset between the motor's encoder and where the rotor actually was. Once I dialed that in it was running just fine, which was fantastic.

**Note: This was an update video I made for the owner of the vehicle.**
![Motor spin test](assets/img/isetta/first-spin.mp4)
*First motor spin after throttle calibration with a power supply as the throttle.*

### The Charger Mystery

Next up were my challenges with the charger, which randomly cuts off at 38°C. It doesn't throw a fault flag, and it doesn't say the plug got disconnected or that anything is undervoltage or overtemperature. All it says over CAN is that it's not charging anymore, and it happens at 38°C every single time. If I charge at 2 A it takes a lot longer to heat up, and if I charge at 20 A it heats up a lot quicker, but either way it stops at 38°C.

```bash
04:09:24.0 tsm2500   : V=43.7, A=10.2, W=445, Wh=87 , TMP=37C
...
04:09:25.5 tsm2500   : V=43.4, A= 0.3, W=13, Wh=87 not charging, TMP=38C
04:09:25.7 Plug State: LOCKED => DISCONNECT_WAIT
04:09:25.7 Charge State: CHARGE => WARMDOWN, term rsn=NORMAL
04:09:26.0 tsm2500   : V=43.4, A= 0.3, W=13, TMP=37C
...
04:09:30.6 tsm2500   : V=43.4, A= 0.3, W=13, TMP=37C
04:09:30.7 Charge State: WARMDOWN => STANDBY
04:09:31.0 tsm2500   : V=43.4, A= 0.3, W=13, TMP=37C
...
04:09:34.1 tsm2500   : V=43.4, A= 0.3, W=13, TMP=37C
1/c7  : 3.577v, discharge OFF
1/c8  : 3.579v, discharge ON
04:09:34.6 tsm2500   : V=43.4, A= 0.3, W=13, TMP=37C
...
04:09:36.1 tsm2500   : V=43.2, A= 0.2, W=8, TMP=37C
1/c8  : 3.577v, discharge OFF
1/c11 : 3.577v, discharge ON
```
*Status snippet from the Thunderstruck MCU during a charge session when the cutoff happens.*

I've been working through it pretty methodically, charging at different voltages and different currents, with the cooling fan on and with it off, and watching every status flag I can. It fails the exact same way every time. I haven't solved it yet, and I'm in talks with the manufacturer to get it sorted out.

### What's Next

The car is going to live on Martha's Vineyard, where the top speed is about 40 mph, so it's probably already going to be overpowered. What I'm really, really dead set on is making the car feel exactly how the owner wants it to feel. I take a lot of pride in the driving dynamics of the vehicles I've built in the past, and I want to keep that going!

So I'm going to spend a lot of time tuning the throttle and mapping it differently, then driving through a bunch of different scenarios with him. I'm not really going to tell him what I changed. I'll just ask him how it feels and have him describe it to me in words, and then make changes from there.

### Reflection

#### Pick Open Parts

If I had been picking the parts, I would have chosen different ones. Going forward, I'm definitely not using any system that isn't as open as possible. Shout out to VESC!

#### Working Directly With a Client

This project reminds me how much I like being my own boss and really getting to know my clients. It's something I loved about my earlier days running my bike repair business, where I'd put my tools on my back and go out and meet the people I was helping. This is the same kind of thing. At this point I know my client's dog, his wife, and his kids, and I really value that kind of relationship where I get to mix engineering with helping people face to face. I think that human connection can so often get lost behind a 10,000 person company.

#### Explaining Engineering to a Non-Engineer

This project has also been really good practice in communicating engineering decisions to someone who isn't an engineer. There's that saying that if you can't teach something, you don't know it well enough, and I think it really comes into play here. Having to justify a purchase or explain a problem forces me to understand every part of the system down to the fundamentals.

The charger is a good example. I don't know what's going on with it yet, so I have to explain my process in normal words. I'm basically trying every single permutation of how to use this thing, and I'm watching it fail the same way every time.

I've also noticed that if I go two weeks without checking in and then start explaining stuff, he gets kind of lost. That's a good reminder of how important it is to keep people updated with clear, consistent, and frequent communication. Whether you're talking to an engineer or not, explaining something in the simplest way possible is pretty much always best.
