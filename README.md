### Treedy's Photogrammetry Scanner

## What is this? 

This repository contains the codebase for Treedy's orginal photogrammetry-based 3D body scanning system. This system has been deployed by Treedy's and our customers all over the globe and consistenly delivers excellent results in 3D scanning. 

With a little automation on the 3D processing side with photogrammetry software like "Capturing Reality" or "Agisoft Metashape" you can use this scanning system to create 3D models like these fully automatically (links go to sketchfab):


<a href="https://sketchfab.com/3d-models/david-at-gsp-connect-2018-26be3a3c55a143648b6e6a7e1d26fa7d?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" style="font-weight: bold; color: #1CAAD9;"><img src="https://raw.githubusercontent.com/treedys/tps/master/preview1.jpg" 
alt="EXAMPLE 1" width="200" height="200" border="10" /></a><a href="https://sketchfab.com/3d-models/louis-from-sketchfab-2-0d966fce8ec04cc992422c127b6aaed3?utm_medium=embed&utm_source=website&utm_campaign=share-popup" target="_blank" style="font-weight: bold; color: #1CAAD9;"><img src="https://raw.githubusercontent.com/treedys/tps/master/preview2.jpg" 
alt="EXAMPLE 2" width="200" height="200" border="10" /></a>





This repository contains both the code needed to build such a scanner and operate it, and the design files to create your own **transportable** 3D scanning system made of sturdy aluminium components, that will fit in a set of flight cases.

**Please take a look at the licensing agreement below. We are making this system free to use for scientific research, non-commercial education, and artistic projects.** For other uses please contact us for licensing. We don't bite :-p  

## How does the scanner work ? 

This scanning system is essentially a network of connected SoCs, each one controlling a camera. These cameras are set up to shoot an image in perfect sync when using the control system. You can choose to shoot either a single image or a set of two with different parameters, with very short delay between the shots (down to about 15ms).

The idea is to collect these images from the network of cameras and use photogrammetry algorithms to place the cameras in 3D space and create stereoscopic depth maps between aligned frames. These depth maps then allow you to calculate a 3D point cloud of the capture, which can then be meshed into a 3D model and textured. If this processing system is well set up you can go from a set of images to a clean 3D model in 6 to 10 minutes on modern hardware. 

**We use it like this:**
1. Shot 1: with projected grid
2. Shot 2: with "normal" lighting (15ms after shot 1)
3. Images are compressed using H265 compression hardware on the Nvidia Xavier (complete data for one scan is then about 30 to 50Mb)
4. Images are downloaded to a .zip file which also contains a JSON file with info on the scan
5. zip file is automatically uploaded to a remote rendering system
6. 3D model is rendered and sent back wherever you want it... you can automatically upload it to www.sketchfab.com for example
(7. In our own pipelines we use an ML sytem to infer body shape and extract measurements to help people make better and more sustainable decisions when shopping online for clothing... but that's another story :p ) 


## What will I need? 

In order to replicate the **exact** setup that we use at Treedy's you will need to use the following components:
1. a set of Raspberry Pi 3 B+ boards
2. one Raspberry Pi V2 camera for each board
3. one PoE splitter for each Raspberry Pi board
4. one Ethernet cable for each Raspberry Pi board
5. TP-Link JetStream series PoE switches (the sofware is set up to aumatically configure these and reboot failing devices over PoE)
6. an Nvidia Xavier device with sufficient ethernet ports for your PoE switches + one additional uplink on which the scanner control interface will be served

--> The rest is up to your imagination. Each Raspberry pi can send impulses on each scan to GPIO pins enabling you to, for example:
1. Control a pattern projector to add noise to one of the captures
2. Control the lighting inside the scanner, dimming LED strips for example
3. Play your favorite song :-p 


***Of course*** you don't need to stick to this exact configuration! With minor modifications to the code you can replace the control system with an X86-based computer for example instead of the Nvidia Xavier, or you can update the software running on the Raspberry Pis to be compatible with the Pi v4 boards... or rewrite the network discovery system to support any brand of PoE switch instead of the TP-link gear that we use. If you make such changes please merge them back into the main repo!


## Who made this? 

This is a product of Treedy's SA, the people you see below. Click on the picture to see our website.

<a href="https://www.treedys.com" target="_blank" style="font-weight: bold; color: #1CAAD9;"><img src="https://images.squarespace-cdn.com/content/v1/5d6cf31ccbc1df0001d1cceb/1567422231117-DM92R9GZ577OQHSIC7V4/ke17ZwdGBToddI8pDm48kLkXF2pIyv_F2eUT9F60jBl7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0iyqMbMesKd95J-X4EagrgU9L3Sa3U8cogeb0tjXbfawd0urKshkc5MgdBeJmALQKw/180116_Treedys_BenjaminBrolet0115.jpg" 
alt="EXAMPLE 1" width="500" height="333" border="10" /></a>



## License:

### Software Copyright License for non-commercial scientific research purposes

Please read the following terms and conditions and any accompanying documentation before you download and/or use Treedy's Photogrammetry Scanner Software (hereinafter the "Software").
By downloading and/or using the Software (including downloading, cloning, installing, and any other use of this github repository), you acknowledge that you have read these terms and conditions, understand them, and agree to be bound by them. If you do not agree with these terms and conditions, you must not download and/or use the Software. Any infringement of the terms of this agreement will automatically terminate your rights under this License.

### Ownership / Licensees
The Software and the associated materials has been developed by Treedy's SA.

Any copyright or patent right is owned by and proprietary material of Treedy's SA, hereinafter the “Licensor”.

### License Grant
Licensor grants you (Licensee) personally a single-user, non-exclusive, non-transferable, free of charge right:

To install the Software on computers owned, leased or otherwise controlled by you and/or your organization;
To use the Software for the sole purpose of performing non-commercial scientific research, non-commercial education, or non-commercial artistic projects;
Any other use, in particular any use for commercial purposes, is prohibited. This includes, without limitation, incorporation in a commercial product, use in a commercial service, or production of other artifacts for commercial purposes. The Software may not be reproduced, modified and/or made available in any form to any third party without Treedy's SA’s prior written permission.


### No Distribution
The Software and the license herein granted shall not be copied, shared, distributed, re-sold, offered for re-sale, transferred or sub-licensed in whole or in part.

### Disclaimer of Representations and Warranties
You expressly acknowledge and agree that the Software is provided “AS IS”, may contain errors, and that any use of the Software is at your sole risk. LICENSOR MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND CONCERNING THE SOFTWARE, NEITHER EXPRESS NOR IMPLIED, AND THE ABSENCE OF ANY LEGAL OR ACTUAL DEFECTS, WHETHER DISCOVERABLE OR NOT.
Specifically, and not to limit the foregoing, licensor makes no representations or warranties (1) regarding the merchantability or fitness for a particular purpose of the Software, (2) that the use of the Software will not infringe any patents, copyrights or other intellectual property rights of a third party, and (3) that the use of the Software will not cause any damage of any kind to you or a third party.

### Limitation of Liability
For the avoidance of doubt Licensor shall be liable in accordance with Belgian law. The foregoing applies also to Licensor’s legal representatives or assistants in performance. Any further liability shall be excluded.
Patent claims generated through the usage of the Software cannot be directed towards the copyright holders.
The Software is provided in the state of development the licensor defines. If modified or extended by Licensee, the Licensor makes no claims about the fitness of the Software and is not responsible for any problems such modifications cause.

### No Maintenance Services
You understand and agree that Licensor is under no obligation to provide either maintenance services, update services, notices of latent defects, or corrections of defects with regard to the Software. Licensor nevertheless reserves the right to update, modify, or discontinue the Software at any time.

Defects of the Software must be notified in writing to the Licensor with a comprehensible description of the error symptoms. The notification of the defect should enable the reproduction of the error. The Licensee is encouraged to communicate any use, results, modification or publication.


### Commercial licensing opportunities
For commercial uses of the Software, please send email to **info@treedys.com**
This Agreement shall be governed by the laws of Belgium.
