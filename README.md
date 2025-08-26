# belIOT BLE Device Dashboard

belIOT is a Web Bluetooth dashboard for discovering, connecting, and visualizing data from nearby Bluetooth Low Energy (BLE) devices. It is built with [Next.js](https://nextjs.org/) and provides a modular widget system for displaying device data.

## Features
- **Device scanning & management** – use the Device Manager to scan for BLE devices, connect or disconnect them, and rename devices for easy identification.
- **Customizable widgets** – add widgets that read GATT characteristic values and display live data from connected devices on the dashboard.
- **Real-time updates** – device data is polled periodically so widgets stay current as values change.

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the development server**
   ```bash
   npm run dev
   ```
   Open <http://localhost:9002> in a Web Bluetooth–capable browser to use the dashboard.
3. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Key Source Files
- [`src/app/page.tsx`](src/app/page.tsx) – main dashboard page that composes the layout, device manager, and widgets.
- [`src/components/device-manager.tsx`](src/components/device-manager.tsx) – interface for scanning, connecting, and renaming devices.
- [`src/components/dashboard.tsx`](src/components/dashboard.tsx) – renders widgets and displays device data.
- [`src/hooks/use-bluetooth.ts`](src/hooks/use-bluetooth.ts) – hook that implements BLE scanning, connections, and characteristic reads.

