import Lottie from "lottie-react";
import animation from "../assets/caveman-loader.json";

export default function CavemanLoader({ message }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: 200, height: 200 }}>
        <Lottie animationData={animation} loop />
      </div>
      <p style={{ marginTop: 16 }}>{message}</p>
    </div>
  );
}
