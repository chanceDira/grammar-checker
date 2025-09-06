import { useEffect } from "react";
import GrammarChecker from "./components/GrammarChecker";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initializeAnalytics } from "./utils/analytics";

function App() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <GrammarChecker />
      </div>
    </ThemeProvider>
  );
}

export default App;
