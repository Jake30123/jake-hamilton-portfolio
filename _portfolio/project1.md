---
title: City Ripper
subtitle: A lightweight electric commuter that puts gas bikes to shame.
image: assets\img\white\white.jpg
alt: A lightweight white electric commuter motorcycle

caption:
  title: City Ripper
  subtitle: A lightweight electric commuter that puts gas bikes to shame.
  thumbnail: assets\img\white\white_small.jpg
---
### Overview
The City Ripper was designed to provide the most fun experience possible in a small, lightweight platform that is perfect for all city conditions. This bike integrates long-travel suspension with sticky street tires that allow the rider to hop curbs, cut across grass, and hit potholes without a care in the world.

It has enough power to keep up with highway traffic for short sprints and enough torque to beat any sports car at a stoplight, all while weighing only 130 lbs. This bike is incredibly nimble and intuitive, whether you're pulling a wheelie on a long straight or winding through stopped city traffic.

**Specs**
- Frame: EEB Enduro
- Motor: QS 205 + Ferrofluid
- Battery: 76V 48Ah Custom
- Suspension: DNM USD-8 Fork and DNM Rear Shock
- Controller: Fardriver ND72530 (330A bus, 530A phase)
- Top Speed: 70 mph
- Total Power: 14,000 W

#### Build Process
The bones of this bike come from a company called EEB, a Chinese factory that sells frames and components directly to the consumer. This is its "Enduro" frame, which is designed for long-travel suspension, a large battery, and a hub motor. I selected this frame because it was lightweight at only 22 lbs (8 lbs less than the motor alone). EEB is also known for high-quality welds on its frames, good customer support, and a wide range of accessories, along with standardized components for easy off-the-shelf assembly.

To start the build process, I purchased the frame, plastic panels, suspension, wheels, and motor from a variety of suppliers.

<img src="assets/img/white/boxes.jpg" alt="Shipping boxes containing bike parts" width="49%" /><img src="assets/img/white/parts.jpg" alt="Various bike parts laid out on the floor" width="49%" />
*A selection of suspension parts, the battery, and the motor for the bike.*

After about three months of waiting for all the parts to arrive, I started to assemble! This process proved tricky since I did not have professional bike shop tools and was forced to create some janky assembly setups.

<img src="assets/img/white/front.jpg" alt="The front fork and wheel being assembled on a bike stand" width="75%" /><br>
*The front suspension on a regular bike stand.*

The suspension and frame assembly went relatively smoothly, as it was a process I had done a couple of times before when replacing the suspension on my Sur-Ron motorcycle.

<img src="assets/img/white/half.jpg" alt="The partially assembled bike frame with wheels and suspension" width="75%" /><br>
*The bike mostly assembled, without a wiring harness.*

The two major assembly challenges I had with this bike were the battery and the controller.

##### Battery Build
I built the battery for the bike in a flat configuration with the idea of folding it to create my desired shape.

<img src="assets/img/white/flat.jpg" alt="The battery pack laid out flat before being folded" width="75%" /><br>
*The battery in its flat configuration, pre-folding.*

While my concept was solid, I ended up placing the folds in the wrong places, so the battery wanted to fold in on itself, not stack. This was incredibly disappointing, as I had to then cut the battery back into its individual segments and solder them together independently.

<img src="assets/img/white/segments.jpg" alt="The cut segments of the battery pack" width="49%" /><img src="assets/img/white/soldered.jpg" alt="The battery segments after being soldered together" width="49%" />
*The segments of the battery separately (left) and then soldered together (right).*

In the end, the battery turned out perfectly and met my design requirements for weight, voltage, and capacity.

<img src="assets/img/white/jakebat.jpg" alt="Me holding the finished battery pack" width="75%" /><br>
*Me standing with my finished battery.*

With the battery finished, I was then able to assemble the rest of the bike and get to riding!

<img src="assets/img/white/v1.jpg" alt="The completed white electric bike in front of a garage" width="75%" /><br>
*The finished bike in front of a friend's garage.*

##### Controller Troubles
The other big issue I had besides the battery was the controller. The controller I initially used was a Sabvoton SVMC72200. While this controller used to be a go-to for high-powered bike builders, the company had recently come under new management, and quality had decreased. As of this writing, I have burned through three $450 Sabvoton controllers, which has been quite infuriating.

While riding to school one day, I was accelerating quickly from a stoplight when all of a sudden my rear wheel locked up and the entire bike shut down. There was also a good deal of magic smoke coming out of the controller (the gray box underneath the front part of the frame, seen in the last picture). From a post-mortem analysis, I concluded that one of the MOSFETs had welded itself to the cooling plate. This caused the motor to act like a completely shorted generator, thus locking up the rear wheel. The other two Sabvoton controllers failed in the same way about a year or two later.

After this failure, I switched to Fardriver controllers due to their low cost, high power, FOC technology, and Bluetooth capabilities. I was absolutely blown away by the build quality and features for the price, and they are now my go-to controller for any project.

<img src="assets/img/white/v2.jpg" alt="The bike with a new controller and a modified seat" width="75%" /><br>
*The bike with the new Fardriver controller and a new seat for housing it.*