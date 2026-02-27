import React from "react";
import Routes from "./routes/Routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

const App = () => {
	return (
		<React.Fragment>
			<QueryClientProvider client={queryClient}>
				<Routes />
			</QueryClientProvider>
		</React.Fragment>
	);
};

export default App;
