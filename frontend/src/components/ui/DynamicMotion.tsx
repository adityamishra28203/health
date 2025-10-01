"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import motion components to reduce initial bundle size
const MotionDiv = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div>{/* Fallback static div */}</div>,
});

const MotionH1 = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h1 })), {
  ssr: false,
  loading: () => <h1>{/* Fallback static h1 */}</h1>,
});

const MotionH2 = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h2 })), {
  ssr: false,
  loading: () => <h2>{/* Fallback static h2 */}</h2>,
});

const MotionP = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.p })), {
  ssr: false,
  loading: () => <p>{/* Fallback static p */}</p>,
});

const MotionButton = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.button })), {
  ssr: false,
  loading: () => <button>{/* Fallback static button */}</button>,
});

const AnimatePresence = dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), {
  ssr: false,
  loading: () => <>{/* Fallback without animation */}</>,
});

interface MotionProps {
  children: ReactNode;
  [key: string]: any;
}

export const DynamicMotionDiv = ({ children, ...props }: MotionProps) => (
  <MotionDiv {...props}>{children}</MotionDiv>
);

export const DynamicMotionH1 = ({ children, ...props }: MotionProps) => (
  <MotionH1 {...props}>{children}</MotionH1>
);

export const DynamicMotionH2 = ({ children, ...props }: MotionProps) => (
  <MotionH2 {...props}>{children}</MotionH2>
);

export const DynamicMotionP = ({ children, ...props }: MotionProps) => (
  <MotionP {...props}>{children}</MotionP>
);

export const DynamicMotionButton = ({ children, ...props }: MotionProps) => (
  <MotionButton {...props}>{children}</MotionButton>
);

export const DynamicAnimatePresence = ({ children, ...props }: MotionProps) => (
  <AnimatePresence {...props}>{children}</AnimatePresence>
);



