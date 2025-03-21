import { useEffect, useState, FC } from "react";

interface ILoadingPage {
  onLoaded: () => void;
}

const LoadingPage: FC<ILoadingPage> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onLoaded(); // Signal that loading is complete
          return 100;
        }
        return prev + 1; // Simulate loading progress
      });
    }, 30); // Adjust speed as necessary

    return () => clearInterval(interval);
  }, [onLoaded]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#3b2f2f]">
      <div className="text-center text-[#e4e2dc]">
        <div className="text-4xl font-bold mb-4 pirata-one">Lutte Arcade</div>
        <div className="text-4xl font-bold mb-4 pirata-one">
          Loading World...
        </div>
        <div className="relative w-64 h-2 bg-[#6b5b4d] rounded-full mx-auto overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#4d7c4c] transition-all duration-500 "
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm mt-2 pirata-one">{progress}%</div>
      </div>
    </div>
  );
};

export default LoadingPage;
