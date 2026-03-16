import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function ParticlesBackground() {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const particlesLoaded = (container) => {
    console.log("Particles loaded:", container);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
            onHover: { enable: true, mode: "repulse" },
            resize: true,
          },
          modes: {
            push: { quantity: 4 },
            repulse: { distance: 150, duration: 0.4 },
          },
        },
        particles: {
          color: { value: ["#A78BFA", "#FBBF24", "#6EE7B7"] }, // Softer pastel colors
          links: {
            color: "#D1D5DB",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          collisions: { enable: true },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" },
            random: true,
            speed: 1, // Slower movement
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 120, // Slightly denser
          },
          opacity: {
            value: { min: 0.2, max: 0.6 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.2,
            },
          },
          shape: { type: ["circle", "square"] },
          size: {
            value: { min: 1, max: 4 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 1,
            },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}

export default ParticlesBackground;