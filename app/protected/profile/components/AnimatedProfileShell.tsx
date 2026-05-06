"use client";

import { ReactNode } from "react";
import { motion, type Transition, type Variants } from "framer-motion";

type Props = {
  children: ReactNode;
};

const spring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 16,
  mass: 0.9,
};

const pageDrop: Variants = {
  hidden: {
    opacity: 0,
    y: -70,
    scale: 0.96,
    filter: "blur(14px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: spring,
  },
};

export default function AnimatedProfileShell({ children }: Props) {
  return (
    <motion.div
      variants={pageDrop}
      initial="hidden"
      animate="show"
      className="py-2"
    >
      {children}
    </motion.div>
  );
}