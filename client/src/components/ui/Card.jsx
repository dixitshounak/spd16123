import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "", hover = false, glass = false, onClick, ...props }) => {
  const baseClass = glass ? "card-glass" : hover ? "card-hover" : "card";
  return (
    <motion.div
      className={`${baseClass} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-5 border-b border-border ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`px-6 py-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-border bg-slate-50/50 rounded-b-2xl ${className}`}>
    {children}
  </div>
);

export default Card;
