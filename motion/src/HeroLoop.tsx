import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Easing, Img, staticFile, useVideoConfig } from "remotion";

const Photo: React.FC<{ readonly src: string }> = ({ src }) => (
  <AbsoluteFill style={{ backgroundColor: "#dfeef6" }}>
    <Img
      src={staticFile(src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

/**
 * Hero loop: three photos with plain cross-dissolves.
 * Photo 1 comes back at the end, so the last frame equals the first and the loop is seamless.
 */
export const HeroLoop: React.FC = () => {
  const { fps } = useVideoConfig();
  const dissolve = linearTiming({
    durationInFrames: 24,
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Bathroom" durationInFrames={96} premountFor={fps}>
        <Photo src="1-1400.webp" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={dissolve} />
      <TransitionSeries.Sequence name="Living room" durationInFrames={96} premountFor={fps}>
        <Photo src="3-1400.webp" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={dissolve} />
      <TransitionSeries.Sequence name="Sofa" durationInFrames={96} premountFor={fps}>
        <Photo src="8-1400.webp" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={dissolve} />
      <TransitionSeries.Sequence name="Bathroom (loop tail)" durationInFrames={24} premountFor={fps}>
        <Photo src="1-1400.webp" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
