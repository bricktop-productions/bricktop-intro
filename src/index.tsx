import { registerRoot, Composition } from "remotion";
import { BricktopIntroComposition } from "./BricktopIntro";

registerRoot(() => (
  <Composition
    id="BricktopIntro"
    component={BricktopIntroComposition}
    durationInFrames={360}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
));