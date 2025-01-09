# Fund Kit Widget React Sample App

<div align="center">

![Aarc logo](/public/aarclogo.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0+-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

A production-ready sample application demonstrating the integration of Aarc's Fund Kit Widget with React
</div>

## 📋 Prerequisites

- Node.js (v16.0.0 or later)
- Package manager (choose one):
  - npm (v7.0.0 or later)
  - yarn (v1.22.0 or later)
  - pnpm (v6.0.0 or later)
  - bun (v1.0.0 or later)

## 🛠 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/aarc-xyz/aarc-react-widget-demo.git
   cd aarc-react-widget-demo
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install

   # Using bun
   bun install
   ```

3. **Start Development Server**
   ```bash
   # Using npm
   npm start

   # Using yarn
   yarn start

   # Using pnpm
   pnpm start

   # Using bun
   bun start
   ```

4. **View the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Required Aarc Packages

```json
{
  "dependencies": {
    "@aarc-xyz/fundkit-web-sdk": "latest",
    "@aarc-xyz/eth-connector": "latest"
  }
}
```

## 🔧 Integration Guide

### 1. Install Dependencies

```bash
npm install @aarc-xyz/fundkit-web-sdk @aarc-xyz/eth-connector @tanstack/react-query
```

### 2. Import Required Styles

```tsx
import "@aarc-xyz/eth-connector/styles.css";
```

### 3. Configure the Widget

Create a configuration file (`src/config/aarc.ts`):

```tsx
import { FKConfig } from "@aarc-xyz/fundkit-web-sdk";

export const config: FKConfig = {
  // Your configuration options
  // See: https://docs.aarc.xyz/developer-docs/fund-kit/fund-kit-widget/config
};
```

### 4. Set Up Providers

Wrap your application with the necessary providers:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AarcEthWalletConnector } from "@aarc-xyz/eth-connector";
import { AarcFundKitModal } from "@aarc-xyz/fundkit-web-sdk";
import { config } from "./config/aarc";

const queryClient = new QueryClient();
const aarcModal = new AarcFundKitModal(config);

function App({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AarcEthWalletConnector aarcWebClient={aarcModal}>
        {children}
      </AarcEthWalletConnector>
    </QueryClientProvider>
  );
}

export default App;
```

### 5. Use the Widget

Implement the widget in your components:

```tsx
function HomePage() {
  return (
    <div>
      <button onClick={() => aarcModal?.openModal()}>
        Open Fund Kit Widget
      </button>
    </div>
  );
}

export default HomePage;
```

## 📚 Documentation

For detailed information about the Fund Kit Widget and its capabilities, visit our comprehensive documentation:

- [Getting Started Guide](https://docs.aarc.xyz/developer-docs/developers/widget)
- [Widget Configuration](https://docs.aarc.xyz/developer-docs/fund-kit/fund-kit-widget/config)
- [API Reference](https://docs.aarc.xyz/developer-docs/developers/api)
- [Integration Examples](https://docs.aarc.xyz/developer-docs/developers/cookbook)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- Join our [Discord community](https://discord.com/invite/XubvAjtpM7)
- Report issues on [GitHub](https://github.dev/aarc-xyz/aarc-react-widget-demo/issues)
- Read our [documentation](https://docs.aarc.xyz)

---

<div align="center">
Built with ❤️ by the <a href="https://aarc.xyz/">Aarc</a> team
</div>