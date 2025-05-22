import { createThirdwebClient } from "thirdweb";

// Create client only if client ID is available
export const client = import.meta.env.VITE_THIRDWEB_CLIENT_ID 
  ? createThirdwebClient({
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
    })
  : null;