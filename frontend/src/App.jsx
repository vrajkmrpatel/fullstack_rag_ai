import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";
import useTheme from "./hooks/useTheme";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#18181b" : "#ffffff",
            color: theme === "dark" ? "#fafafa" : "#09090b",
            border: theme === "dark" ? "1px solid #27272a" : "1px solid #e4e4e7",
            borderRadius: "0.5rem",
          },
        }}
      />

      <ChatPage theme={theme} toggleTheme={toggleTheme} />
    </>
  );
}

export default App;