import { registerRoot, Composition } from "remotion";
import { BricktopIntroComposition } from "./BricktopIntro";
import { BricktopIntroSimple } from "./BricktopIntroSimple";

registerRoot(() => (
  <>
    <Composition
      id="BricktopIntro"
      component={BricktopIntroComposition}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
    <Composition
      id="BricktopIntroSimple"
      component={BricktopIntroSimple}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  </>
));