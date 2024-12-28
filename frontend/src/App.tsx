import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "./components/Router/Router";
import { ModalsContainer } from "./components/ModalsContainer/ModalsContainer";
import { CustomToaster } from "./components/CustomToaster/CustomToaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Remove queries caching
      gcTime: 0,
      // Disable data refetch on window refocus
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative overflow-hidden">
        <Router />
        <CustomToaster />
        <ModalsContainer />
      </div>
    </QueryClientProvider>
  );
};

export default App;
