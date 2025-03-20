import './LoadingScreen.module.scss'; // SCSS for loading screen styles

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
