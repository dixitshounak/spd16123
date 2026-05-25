import React from "react";

const variantMap = {
  accent: "badge-accent",
  highlight: "badge-highlight",
  success: "badge-success",
  danger: "badge-danger",
  muted: "badge-muted",
  primary: "badge-primary",
};

const Badge = ({ children, variant = "accent", className = "", ...props }) => (
  <span className={`${variantMap[variant]} ${className}`} {...props}>
    {children}
  </span>
);

export default Badge;
