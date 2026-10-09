import {
  linearTiming,
  TransitionSeries,
  type TransitionPresentation,
  type TransitionPresentationComponentProps,
} from "@remotion/transitions";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// One shared curve for every move in the loop (matches --ease-out-expo feel on the site).
const SOFT_IN_OUT = Easing.bezier(0.76, 0, 0.24, 1);

type PhotoSceneProps = {
  readonly src: string;
  /** Frames of push-in already "banked" when the scene starts (used to make the loop seamless). */
  readonly zoomOffset: number;
  /** Horizontal drift over the whole push-in, in % of the frame. */
  readonly driftX: number;
  readonly driftY: number;
};

const PhotoScene: React.FC<PhotoSceneProps> = ({
  src,
  zoomOffset,
  driftX,
  driftY,
}) => {
  const frame = useCurrentFrame();
  const t = frame + zoomOffset;

  return (
    <AbsoluteFill style={{ backgroundColor: "#dfeef6" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(t, [0, 120], [1, 1.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          translate: `${interpolate(t, [0, 120], [0, driftX], {
            extrapolateRight: "clamp",
          })}% ${interpolate(t, [0, 120], [0, driftY], {
            extrapolateRight: "clamp",
          })}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Custom presentation: the incoming photo is unmasked from the bottom edge
 * upward while it settles (counter-moving + easing from a slight zoom);
 * the outgoing photo drifts up and dims a touch for depth.
 */
const MaskRevealComponent: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ children, presentationProgress, presentationDirection }) => {
  const entering = presentationDirection === "entering";

  if (!entering) {
    return (
      <AbsoluteFill
        style={{
          translate: `0 ${-presentationProgress * 3}%`,
          filter: `brightness(${1 - presentationProgress * 0.22})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{ clipPath: `inset(${(1 - presentationProgress) * 100}% 0% 0% 0%)` }}
    >
      <AbsoluteFill
        style={{
          translate: `0 ${-(1 - presentationProgress) * 6}%`,
          scale: 1 + (1 - presentationProgress) * 0.1,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const maskReveal = (): TransitionPresentation<Record<string, never>> => ({
  component: MaskRevealComponent,
  props: {},
});

export const HeroLoop: React.FC = () => {
  const { fps } = useVideoConfig();

  // Three scenes + a short tail of scene 1 so the last frame equals the first (seamless loop).
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Bathroom"
        durationInFrames={96}
        premountFor={fps}
      >
        <PhotoScene src="1-1400.webp" zoomOffset={23} driftX={-0.6} driftY={-1.2} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={maskReveal()}
        timing={linearTiming({ durationInFrames: 24, easing: SOFT_IN_OUT })}
      />
      <TransitionSeries.Sequence
        name="Living room"
        durationInFrames={96}
        premountFor={fps}
      >
        <PhotoScene src="3-1400.webp" zoomOffset={0} driftX={0.8} driftY={-0.8} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={maskReveal()}
        timing={linearTiming({ durationInFrames: 24, easing: SOFT_IN_OUT })}
      />
      <TransitionSeries.Sequence
        name="Sofa"
        durationInFrames={96}
        premountFor={fps}
      >
        <PhotoScene src="8-1400.webp" zoomOffset={0} driftX={-0.8} driftY={-1} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={maskReveal()}
        timing={linearTiming({ durationInFrames: 24, easing: SOFT_IN_OUT })}
      />
      <TransitionSeries.Sequence
        name="Bathroom (loop tail)"
        durationInFrames={24}
        premountFor={fps}
      >
        <PhotoScene src="1-1400.webp" zoomOffset={0} driftX={-0.6} driftY={-1.2} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
