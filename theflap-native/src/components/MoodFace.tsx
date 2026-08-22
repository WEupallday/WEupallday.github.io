import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Ellipse, Line, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';

// ---------------------------------------------------------------------------
// Hand-drawn animated mood faces — the yellow gradient faces from theflap.app,
// re-authored with react-native-svg + looping RN animations so the native app
// matches the website's animated moods.
// ---------------------------------------------------------------------------

type Spec = { eyes: string; mouth: string; brow?: string; extra?: string; anim: string };

const DARK = '#3a2a00';
const RED = '#e01818';

const SPECS: Record<string, Spec> = {
  happy: { eyes: 'dot', mouth: 'smile', anim: 'float' },
  excited: { eyes: 'wide', mouth: 'big', brow: 'raised', anim: 'hop' },
  pumped: { eyes: 'dot', mouth: 'big', brow: 'raised', anim: 'hop' },
  blissful: { eyes: 'happy', mouth: 'smile', extra: 'blush', anim: 'float' },
  chillin: { eyes: 'sleepy', mouth: 'smirk', anim: 'sway' },
  hopeful: { eyes: 'dot', mouth: 'smile', brow: 'raised', anim: 'float' },
  funky: { eyes: 'wink', mouth: 'smirk', anim: 'groove' },
  fierce: { eyes: 'dot', mouth: 'smirk', brow: 'angry', anim: 'tilt' },
  victorious: { eyes: 'happy', mouth: 'big', brow: 'raised', anim: 'hop' },
  thinky: { eyes: 'side', mouth: 'flat', brow: 'raised', anim: 'tilt' },
  wondering: { eyes: 'dot', mouth: 'o', brow: 'raised', anim: 'tilt' },
  bored: { eyes: 'sleepy', mouth: 'flat', anim: 'tilt' },
  tired: { eyes: 'sleepy', mouth: 'frown', extra: 'sweat', anim: 'nod' },
  blah: { eyes: 'dot', mouth: 'flat', anim: 'tilt' },
  beat: { eyes: 'x', mouth: 'frown', anim: 'nod' },
  hungry: { eyes: 'wide', mouth: 'tongue', anim: 'float' },
  bummed: { eyes: 'dot', mouth: 'frown', brow: 'sad', anim: 'sway' },
  crushed: { eyes: 'sleepy', mouth: 'frown', brow: 'sad', extra: 'tear', anim: 'sway' },
  upset: { eyes: 'dot', mouth: 'frown', brow: 'sad', anim: 'sway' },
  anxious: { eyes: 'wide', mouth: 'wavy', brow: 'sad', extra: 'sweat', anim: 'shake' },
  freakin: { eyes: 'wide', mouth: 'o', brow: 'raised', extra: 'sweat', anim: 'shake' },
  cranky: { eyes: 'squint', mouth: 'frown', brow: 'angry', anim: 'fume' },
  irritated: { eyes: 'squint', mouth: 'flat', brow: 'angry', anim: 'fume' },
  suspicious: { eyes: 'side', mouth: 'flat', brow: 'angry', anim: 'tilt' },
  yuck: { eyes: 'squint', mouth: 'tongue', anim: 'shake' },
  evil: { eyes: 'side', mouth: 'smirk', brow: 'angry', anim: 'tilt' },
  dorky: { eyes: 'wide', mouth: 'big', brow: 'raised', extra: 'blush', anim: 'tilt' },
};

function Eyes({ type }: { type: string }) {
  switch (type) {
    case 'happy':
      return (
        <G stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none">
          <Path d="M10 16 q3 -3 6 0" />
          <Path d="M24 16 q3 -3 6 0" />
        </G>
      );
    case 'wide':
      return (
        <G>
          <Circle cx="14" cy="16" r="3.2" fill="#fff" />
          <Circle cx="26" cy="16" r="3.2" fill="#fff" />
          <Circle cx="14.4" cy="16.4" r="1.7" fill={DARK} />
          <Circle cx="26.4" cy="16.4" r="1.7" fill={DARK} />
        </G>
      );
    case 'sleepy':
      return (
        <G stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none">
          <Path d="M10 16 q3 3 6 0" />
          <Path d="M24 16 q3 3 6 0" />
        </G>
      );
    case 'wink':
      return (
        <G>
          <Circle cx="14" cy="16" r="2.2" fill={DARK} />
          <Path d="M24 16 q3 -3 6 0" stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'side':
      return (
        <G>
          <Circle cx="15" cy="16" r="2.2" fill={DARK} />
          <Circle cx="27" cy="16" r="2.2" fill={DARK} />
        </G>
      );
    case 'x':
      return (
        <G stroke={DARK} strokeWidth={1.8} strokeLinecap="round">
          <Line x1="11.5" y1="14" x2="16.5" y2="18" /><Line x1="16.5" y1="14" x2="11.5" y2="18" />
          <Line x1="23.5" y1="14" x2="28.5" y2="18" /><Line x1="28.5" y1="14" x2="23.5" y2="18" />
        </G>
      );
    case 'squint':
      return (
        <G stroke={DARK} strokeWidth={2.4} strokeLinecap="round">
          <Line x1="10.5" y1="16" x2="16.5" y2="16" />
          <Line x1="23.5" y1="16" x2="29.5" y2="16" />
        </G>
      );
    default: // dot
      return (
        <G fill={DARK}>
          <Circle cx="13.8" cy="16" r="2.3" />
          <Circle cx="26.2" cy="16" r="2.3" />
        </G>
      );
  }
}

function Mouth({ type }: { type: string }) {
  switch (type) {
    case 'big':
      return <Path d="M12 24 q8 9 16 0 q-8 3 -16 0 z" fill={DARK} />;
    case 'flat':
      return <Line x1="14" y1="27" x2="26" y2="27" stroke={DARK} strokeWidth={2} strokeLinecap="round" />;
    case 'frown':
      return <Path d="M13 29 q7 -6 14 0" stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none" />;
    case 'o':
      return <Circle cx="20" cy="27" r="3" fill={DARK} />;
    case 'tongue':
      return (
        <G>
          <Path d="M12 24 q8 8 16 0 q-8 3 -16 0 z" fill={DARK} />
          <Path d="M17 27 q3 6 6 0 z" fill={RED} />
        </G>
      );
    case 'smirk':
      return <Path d="M14 27 q6 4 12 -1" stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none" />;
    case 'wavy':
      return <Path d="M13 27 q2 -2 4 0 q2 2 4 0 q2 -2 4 0" stroke={DARK} strokeWidth={2} strokeLinecap="round" fill="none" />;
    default: // smile
      return <Path d="M13 25 q7 7 14 0" stroke={DARK} strokeWidth={2.2} strokeLinecap="round" fill="none" />;
  }
}

function Brow({ type }: { type: string }) {
  if (type === 'angry') {
    return (
      <G stroke={DARK} strokeWidth={2} strokeLinecap="round">
        <Line x1="10.5" y1="11.5" x2="16.5" y2="13.5" />
        <Line x1="29.5" y1="11.5" x2="23.5" y2="13.5" />
      </G>
    );
  }
  if (type === 'sad') {
    return (
      <G stroke={DARK} strokeWidth={2} strokeLinecap="round">
        <Line x1="10.5" y1="13.5" x2="16.5" y2="11.5" />
        <Line x1="29.5" y1="13.5" x2="23.5" y2="11.5" />
      </G>
    );
  }
  // raised
  return (
    <G stroke={DARK} strokeWidth={1.8} strokeLinecap="round" fill="none">
      <Path d="M10.5 12 q3 -2 6 -0.5" />
      <Path d="M23.5 11.5 q3 -1.5 6 0.5" />
    </G>
  );
}

function Extra({ type }: { type: string }) {
  if (type === 'blush') {
    return (
      <G fill="#ff8a8a" opacity={0.7}>
        <Ellipse cx="10" cy="22" rx="2.6" ry="1.7" />
        <Ellipse cx="30" cy="22" rx="2.6" ry="1.7" />
      </G>
    );
  }
  if (type === 'tear') return <Path d="M27 19 q1.6 3 0 5 q-1.6 -2 0 -5 z" fill="#4bb3ff" />;
  if (type === 'sweat') return <Path d="M31 13 q1.4 2.6 0 4 q-1.4 -1.4 0 -4 z" fill="#4bb3ff" />;
  return null;
}

export function moodAnimStyle(anim: string, v: Animated.Value) {
  switch (anim) {
    case 'hop':
      return { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] };
    case 'tilt':
      return { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) }] };
    case 'sway':
      return { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-2.5, 2.5] }) }] };
    case 'nod':
      return { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-1, 2] }) }] };
    case 'shake':
      return { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }] };
    case 'fume':
      return { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-1.5, 1.5] }) },
        { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) }] };
    case 'groove':
      return { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [1, -1] }) }] };
    default: // float
      return { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [1.2, -1.2] }) }] };
  }
}

export function MoodFace({ mood, size = 40 }: { mood?: string | null; size?: number }) {
  const spec = SPECS[(mood || '').toLowerCase()] || SPECS.happy;
  const v = useRef(new Animated.Value(0)).current;
  const fast = spec.anim === 'shake' || spec.anim === 'fume';
  const dur = fast ? 130 : spec.anim === 'hop' ? 420 : 1100;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dur, v]);

  return (
    <Animated.View style={moodAnimStyle(spec.anim, v)}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <RadialGradient id="emoGrad" cx="0.35" cy="0.30" r="0.75">
            <Stop offset="0" stopColor="#ffe97a" />
            <Stop offset="0.6" stopColor="#ffce1f" />
            <Stop offset="1" stopColor="#e0a800" />
          </RadialGradient>
        </Defs>
        <Circle cx="20" cy="20" r="16.5" fill="url(#emoGrad)" stroke="#c98f00" strokeWidth="2" />
        {spec.brow ? <Brow type={spec.brow} /> : null}
        <Eyes type={spec.eyes} />
        <Mouth type={spec.mouth} />
        {spec.extra ? <Extra type={spec.extra} /> : null}
      </Svg>
    </Animated.View>
  );
}
