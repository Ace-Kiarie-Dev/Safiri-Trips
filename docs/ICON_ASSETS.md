# Safiri Trips: Icon and Store Asset Prompts

Logo: the pin with acacia and sunset, wordmark "Safiri Trips". Sampled colours: cream background #FDF4DF, pin green #254F38, sun orange #F28F24, "Trips" orange #F28021.

## How to use
1. Open a NEW ChatGPT image chat per asset. Attach the logo image every time.
2. Paste the COMMON PREFIX, then the asset prompt.
3. Save with the exact file name shown and drop it into `assets/`.
4. Tell Claude. It wires app.json, derives the small sizes, runs the checks and commits.

If ChatGPT will not give a true transparent PNG: generate on a flat solid #00FF00 background, then remove the background with rembg (already on your machine) and check the edges.

## COMMON PREFIX (paste first, every time)
Use the attached logo as the exact reference. Keep the pin shape, the acacia tree and the orange sun identical, do not redesign or restyle. Flat vector look, crisp edges, no gradients, no shadows, no outlines, no 3D, no extra decoration. Simplify the tree for small sizes: bolder trunk, three or four clear branches, solid canopy, remove the thin fine lines. Output a PNG at exactly the size requested.

## 1. App icon master: icon.png (1024x1024)
Mark only, no wordmark. Centre the pin on a solid cream #FDF4DF square background. The pin is about 62 percent of the canvas width, centred. Square canvas, no rounded corners, no border.

## 2. Android adaptive foreground: android-icon-foreground.png (1024x1024, transparent)
Mark only, no wordmark, on a fully transparent background. The pin must sit entirely inside the centre circle that is 66 percent of the canvas (about 680 px across), so Android masks never cut it. The inside of the pin around the tree must be transparent (a cut-out), not painted cream.

## 3. Android themed icon: android-icon-monochrome.png (1024x1024, transparent)
The same mark as a single solid black silhouette on a transparent background. Pin ring, tree and sun all pure black, no colour, no gradients, no grey. Same 66 percent safe zone as asset 2. Keep the sun as a solid circle behind the canopy.

## 4. Splash: splash-icon.png (1024x1024, transparent)
Mark only on a transparent background, pin about 78 percent of the canvas height, centred. Same colours as the logo.

## 5. Feature graphic: feature-graphic.png (generate 1536x1024, then crop to 1024x500)
Wide Play Store banner on cream #FDF4DF. Left third: the logo lockup (pin with "Safiri Trips" wordmark exactly as in the attached logo). Right two thirds: flat vector Kenya landscape in the logo greens and oranges: rolling Rift Valley hills, a flat-topped acacia, a soft Mt Kenya silhouette, a small lake, and a dashed orange route line connecting three round pins. Tagline under the lockup in the same rounded font: "Plan it. Save it. Go offline." Keep all text and the pin inside the centre 80 percent of the image because the top and bottom get cropped.

## 6. Lockup for web: logo-lockup-transparent.png (2048 wide, transparent)
The exact logo (pin plus "Safiri Trips") on a transparent background, tightly cropped with a little padding. For nesturex.com privacy page and README.

## Claude derives these (do not generate)
- android-icon-background.png: solid #FDF4DF (already created)
- Play Store icon 512x512 from asset 1
- Notification small icon 96x96 white silhouette from asset 3
- favicon.png from asset 1

## Quick checks before you send them
- Look at asset 1 at 48 px on screen: can you still see pin, tree and sun?
- Asset 2: toggle a circle mask over it, nothing touches the edge.
- Asset 3: only black and transparent, nothing else.
- Spelling on the feature graphic: SAFIRI with an i, TRIPS.

## Status (16 Nov 2026)
Done. Final art lives in assets/ (icon, adaptive foreground, background, monochrome, splash) and store/ (Play icon 512, feature graphic 1024x500). Brand colours come from assets/branding/mark-transparent.png (pin #2A4337, sun #E37326), which match the app tokens closely, so tokens are unchanged. Raw ChatGPT images sit in assets/branding/source/ (not committed). Two rejected: the glowing dark variant and the transparent lockup with speckle noise.
