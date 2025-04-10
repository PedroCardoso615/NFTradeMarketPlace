import { useEffect } from "react";
import styles from "../styles/Home.module.css";

const Home = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
    script.onload = () => {
      console.log("Spline viewer script loaded.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.heroSection}>
      <div className={styles.splineContainer}>
        <spline-viewer
          loading-anim-type="spinner-small-dark"
          url="https://prod.spline.design/mWxcJ5K-bt7BvFCB/scene.splinecode"
        ></spline-viewer>
      </div>
    </div>
  );
};

export default Home;
