interface LoadingScreenProps {
  isConnected: boolean;
  isConnecting: boolean;
}

export const LoadingScreen = ({
  isConnected,
  isConnecting,
}: LoadingScreenProps) => {
  if (isConnected) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          My Pixel World
        </h2>
        <p className="text-gray-600">
          {isConnecting ? "Connecting..." : "Loading..."}
        </p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
