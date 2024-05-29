import React from "react";
import { TypeAnimation } from "react-type-animation";

const TypingAnim = () => {
  return (
    <div>
      <TypeAnimation
        sequence={[
          // Same substring at the start will only be typed once, initially
          "Chat With our Private AI",
          3000,
          "Built With OpenAI",
          1000,
          "Your Own Customized ChatGPT",
          3000,
        ]}
        speed={50}
        style={{
          fontSize: "70px",
          color: "white",
          display: "inline-block",
          textShadow: "1px 1px 20px #000",
        }}
        repeat={Infinity}
      />
    </div>
  );
};

export default TypingAnim;
