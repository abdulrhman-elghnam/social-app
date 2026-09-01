import Routes from "./routes/Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 2, // 2 minutes
        },
    },
});

const App = () => {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                <Routes />
                <Toaster richColors position="top-right" closeButton />
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;
