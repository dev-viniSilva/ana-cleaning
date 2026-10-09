import { Composition } from "remotion";
import { HeroLoop } from "./HeroLoop";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4 scenes x 96/24 frames, minus 3 x 24-frame transitions = 240 frames (8s). 4:5 matches the hero card. */}
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        durationInFrames={240}
        fps={30}
        width={720}
        height={900}
      />
    </>
  );
};
