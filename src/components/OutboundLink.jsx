// src/components/OutboundLink.jsx
import React from "react";
import { trackEvent } from "../analytics";

export default function OutboundLink({
  href,
  children,
  eventName = "outbound_click",
  eventParams = {},
  className,
  style,
  newTab = true,
  ...rest
}) {
  const onClick = () => {
    try {
      trackEvent(eventName, { url: href, ...eventParams });
    } catch {
      // noop
    }
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
      style={style}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
