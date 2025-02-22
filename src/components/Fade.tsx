import React, { useEffect, useState } from "react";

interface props {
  children: React.ReactNode;
}

const Fade = ({ children }: props) => {
  const [Opacity, setOpacity] = useState(0);
  useEffect(() => {
    const Interval = setInterval(() => {
      if (Opacity < 1) {
        setOpacity((curr) => (curr < 1 ? curr + 0.1 : 1));
      }
    }, 50);

    return () => clearInterval(Interval);
  }, []);

  useEffect(() => {
    console.log("op :", Opacity);
  }, [Opacity]);

  return (
    <div
      style={{
        transition: `opacity 2s ease-in-out`,
        opacity: String(Opacity),
        height : "100vh",
        width : "100vw",
        justifyContent : "center",
        alignItems : "center"
      }}
    >
      {children}
    </div>
  );
};

export default Fade;
