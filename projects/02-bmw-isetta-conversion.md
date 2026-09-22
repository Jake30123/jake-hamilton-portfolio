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

I picked up this project kind of randomly. I was at the Newton Green Expo in Newton, Massachusetts with the Olin College Formula SAE team. We had our electric car and a couple of posters about the team, and there were kids climbing all over it. It was a super fun time. Then a local politician running for city council came up and asked, "Does anyone here know about batteries?"

I did. I'd picked up a lot of battery experience on Formula and from my earlier e-bike projects, like designing a 96 V battery for my off-road super bike and larger-capacity 72 V batteries for customer projects. So we started talking, and he told me he knew a guy who was converting his little BMW Isetta to electric.

My first thought was: what is a BMW Isetta? It turns out it's a tiny bubble car BMW built in the 1950s, with a single front door and rear wheels set so close together they almost look like one. It's an absolutely adorable, ridiculous little car, and it's so small you can convert it to electric with a relatively chill powertrain.

### The Starting Point

The owner had already bought a few components: a BMS, two Tesla Model S battery modules, and a motor controller. He needed someone to wire it all up. Right then I knew it was a project I could take on, and also that it was going to be more than just wiring. There would be debugging and all the fun bits of integration: parts that weren't there, systems that wouldn't talk to each other. It was going to be an adventure.

Then I went to look at the car, and there was no body on it. It had been stripped down to the frame. None of the electrical work had been done, so I started from scratch.

## Mapping the System

My first step was getting a list of every component he had and pulling up all of their wiring diagrams. From there I figured out every single wire I needed to care about to get to a bare-minimum rolling chassis:

- Throttle and brake inputs
- CAN between the charger and the BMS
- CAN from the motor controller to a laptop for programming (a whole ordeal, more on that below)
- J1772 signaling from the charge controller to the charge port. The port is actually NACS, but it uses the same logic and wiring as J1772 for AC charging.
- Relay control from the motor controller to the battery's main contactor, since the controller runs the precharge circuit and has to close the main contactor itself
- isoSPI between the Thunderstruck BMS's central MCU and its two satellite modules, one on each Tesla module

Once everything was mapped out, I went through all the parts with little bits of Scotch tape, making wire flags with a three-letter abbreviation for each connection so I always knew what was what.

## High Voltage

Thankfully, the battery was a relatively simple install. The harder question was how much current I should actually let the system draw. The limiting factor turned out to be the car's transmission. The original engine made about 13 horsepower, and I didn't want to exceed what the drivetrain was built for by much. Just a little. You've got to give the car a bit of kick.

So I worked the math backwards. Two 6S modules in series make a 12S pack at roughly 44 V nominal. Targeting about 15 horsepower (around 11 kW) works out to roughly 250 A, and I sized the conductors from there. I landed on 2 AWG, which is about the biggest wire I could feasibly work with in that space. It's tough stuff to bend.

With the high-current conductors made, I wired up the main contactor, the charge contactor, and the BMS, then ran a bare-minimum test: Can I get the contactors to close? Can I get them to open? Surprisingly, almost everything worked on the first try. The charge contactor was fine. The main contactor would not close, and that took me a long time to figure out.

### Low Voltage

I also wired up a complete 12 V system. We're redoing the car's entire low-voltage wiring harness, so that became part of the scope too.

## Talking to a Curtis Controller

The main contactor wasn't closing because the controller wasn't precharging. It just flashed its little status light to say "I'm not precharging," without saying why, because that would be too easy. That kicked off the whole saga of figuring out how to actually talk to a Curtis controller.

There isn't much documentation from Curtis, and not many people in the hobby world use them. They're forklift motor controllers, not really meant for cars. They work totally fine because they're overbuilt, but forklift manufacturers aren't exactly telling the internet how they build their forklifts.

### Building My Own Tool

The controller talks to its programming software over CAN using the CANopen standard. All I needed to do was change the battery voltage settings and tune the throttle, and paying $1,000 for software to do that felt preposterous. So I naively thought: if everything is over CAN, I can build a tool for this myself.

I read up on CANopen, worked out what each message from the Curtis controller meant, and, with help from AI tools, wrote a Python app that could read a lot of values off the controller. That got me real visibility into the problem. I could read every status flag and see that the contactor wasn't closed and that the capacitor voltage was way below battery voltage, because the controller wasn't precharging.

I thought I was so close. But every time I tried to write a value, the controller flagged it: this request came from somewhere I don't trust, and I'm not letting you change that. The parameters I needed were locked behind Curtis's own tooling. That one took a while and was a bit painful, because I really wanted to save my client the money.

### Buying the Software

That left buying official programming software, which runs anywhere from $500 to $1,000. I bought the $500 option, fully confident it would work, and it didn't. That was a harsh lesson. I was able to return it for a full refund, but first I had to go to the owner and tell him I'd ordered the wrong software.

It's always good to have a little practice in humility: here's where I messed up, here's why I made that decision, and here's what I'm going to do to fix it. The next software we bought did work, though at $1,000 it really hurt.

With the right software, the problem was obvious. The controller's battery voltage levels were set wrong, so it thought the pack was undervoltage and refused to precharge. Once I reset those, things got a lot smoother.

### First Spin

With the motor and battery wired to the controller, I got the motor spinning pretty easily. The main thing I had to tune was the offset between the motor's encoder and the rotor's actual position. Once that was dialed in, it ran just fine, which was fantastic.

## The Charger Mystery

Next came the charger, which randomly cuts off at 38°C. It doesn't set a fault flag. It doesn't report a disconnected plug, undervoltage, or overtemperature. All it says over CAN is that it's not charging anymore, and it happens at 38°C every single time. At 2 A it takes a lot longer to heat up; at 20 A it gets there much quicker. Either way, it stops at 38°C.

I've been working through it methodically: charging at different voltages and currents, with the cooling fan on and off, and watching every status flag. It fails the same way every time. It isn't resolved yet, and I'm in talks with the manufacturer to get it sorted out.

## What's Next: Driving Feel

The car is going to live on Martha's Vineyard, where the top speed is about 40 mph, so it will probably already be overpowered. What I'm really dead set on is making it feel exactly how the owner wants it to feel. I take a lot of pride in the driving dynamics of the vehicles I've built, and I want to keep that going.

So I'm going to spend a lot of time tuning and remapping the throttle, then driving through different scenarios with him. I'm not going to tell him what I changed. I'll just ask, "How does this feel to you? Describe it to me in words," and make changes from there.

## Reflection

### Pick Open Parts

If I had been specifying the parts, I would have picked different ones. Going forward, I'm not using any system that isn't as open as possible. Shout out to VESC.

### Working Directly With a Client

This project reminds me how much I like being my own boss and really getting to know my clients. It's something I loved about my earlier days running my bike repair business, putting my tools on my back and going out to meet the people I was helping. It's the same here. At this point I know my client's dog, his wife, and his kids. I really value getting to mix engineering with helping people face to face. That human connection can so easily get lost inside a 10,000-person company.

### Explaining Engineering to a Non-Engineer

This project has also been great practice in communicating engineering decisions to someone who isn't an engineer. There's a saying that if you can't teach something, you don't know it well enough, and it applies here. Having to justify a purchase or explain a problem forces me to understand every part of the system at the fundamentals.

The charger is a good example. I don't know yet what's going on, so I have to explain my process in plain words: I'm trying every permutation of how to use this thing, and I'm watching it fail the same way every time.

I've also learned that if I go two weeks without checking in and then start explaining things, he says, "Whoa, you kind of lost me." That's a reminder that clear, consistent, frequent communication matters. Whether you're talking to an engineer or not, explaining something in the simplest way possible is almost always best.
