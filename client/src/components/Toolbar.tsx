import { Tool } from "@/types/canvas";
import { getToolIcon, getToolTitle } from "@/utils/canvas";
import { MdiIcon } from "@/components/MdiIcon";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  isConnected: boolean;
}

export const Toolbar = ({
  color,
  setColor,
  currentTool,
  setCurrentTool,
  isConnected,
}: ToolbarProps) => {
  const tools: Tool[] = ["pen", "eraser", "hand"];

  return (
    <div className="absolute top-1/2 right-5 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border flex flex-col items-center gap-3">
      <label
        htmlFor="color-picker"
        title="Select Color"
        className="w-11 h-11 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
      ></label>
      <input
        type="color"
        id="color-picker"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="opacity-0 w-0 h-0"
        disabled={currentTool !== "pen"}
      />

      <div className="w-full h-[1px] bg-gray-300"></div>

      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => setCurrentTool(tool)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentTool === tool
              ? "bg-blue-500 text-white shadow-lg scale-110"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
          }`}
          title={getToolTitle(tool)}
        >
          <MdiIcon path={getToolIcon(tool)} size={26} />
        </button>
      ))}

      <div className="w-full h-[1px] bg-gray-300"></div>

      <div
        className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
        title={isConnected ? "Connected" : "Disconnected"}
      ></div>
    </div>
  );
};
