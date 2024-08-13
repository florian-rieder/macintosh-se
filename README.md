# Macintosh SE
This project offers an interactive 3D experience of the Macintosh SE FDHD, a vintage computer model released in 1989. Users can explore the computer from all angles, virtually open its case, and closely inspect its internal components. Given the rarity and fragility of these machines today, this project serves as a digital preservation effort, allowing enthusiasts and researchers to study the Macintosh SE in detail.

The application is a proof of concept for creating high-fidelity 3D models using photogrammetry, combined with an interactive web interface built with `three.js`. Additionally, the project includes contextual information about the machine and links to an emulator for a more immersive experience.

This project was developed for the course "Virtual and Augmented Reality", given by Isaac Pante (UNIL, SLI) at the University of Lausanne.

[Explore the Macintosh SE](https://florian-rieder.github.io/macintosh-se/)

![Preview of the app](https://github.com/user-attachments/assets/d812118e-1c74-4ebc-9ab4-6c4ed6f79c55)

## Features
The application includes a full 360° view, as well as panning, around the Macintosh SE FDHD, allowing users to interactively open and close the case by simply clicking on it. Additional information about the machine is available through an infobox with multiple tabs, including general information, technical specifications, and links to useful resources such as an emulator, the specs sheet source, and Wikipedia.

## Models
![Disassembly of the Macintosh SE FDHD](https://github.com/user-attachments/assets/a2a96373-e7a5-4bf4-87b0-5fb1fa182213)

The 3D models of the Macintosh SE FDHD were created using Reality Capture photogrammetry software. The computer was carefully disassembled, and separate models were made for both the exterior case and the interior components.

![Photography process](https://github.com/user-attachments/assets/33e9099b-4ad7-4a8b-abe2-329131470343)


To reconstruct the interior, 415 images were taken at various heights all around the computer. This process was relatively straightforward due to the abundance of distinct features on all sides, such as text, components, cables, and the monitor. These elements provided numerous reference points for accurate alignment.

The exterior case, however, presented more challenges. The smooth plastic surface made it difficult to achieve proper alignment, resulting in multiple unaligned fragments. To address this, a second photoshoot was conducted with markers placed on each side of the case. These markers provided the necessary reference points, although manual intervention was still required to identify and mark additional control points, after which a satisfactory model was produced. The reconstruction used 425 images taken at various heights all around the case, made with the aid of a turntable.

After the models were generated, they were simplified, and the textures were recalculated and reprojected onto the models, reducing the file sizes to approximately 6MB each, making them more suitable for web use.

Subsequent post-processing was performed in Blender. This involved removing holes in the structure—particularly around the handle, where light penetration was limited—and ensuring that both models were scaled and aligned correctly.

Initially, I planned to remove the markers from the texture using Blender. However, after filling the holes, the model’s topology changed, causing any subsequent texture edits to bleed across the model. This issue forced me to abandon the texture corrections, as redoing the entire process of hole filling, scaling, and alignment would have been necessary. Some defects remain in the textures, particularly on the front where the "Macintosh" text is cut off, which is unfortunate, but I was unable to correct them.

An additional challenge arose after these post-processing steps when the file sizes for each model ballooned to around 20MB, which I consider too large. Despite my efforts, I have not yet found a way to reduce the file size further.

## Libraries
- `three.js`: Handles the 3D rendering and interaction.
- `gsap.js`: Manages animating the opening and closing of the case.

## Installation
Setting up the development environment for this static website is straightforward. It can be done using Visual Studio Code or its open-source alternative, [VSCodium](https://vscodium.com/) with the [Live Server (Five Server)](https://open-vsx.org/extension/glenn2223/live-sass) plugin.
Other options can also be used as long as the files are served from a local server.
