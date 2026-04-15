# 🚇 MetroMesh

![MetroMesh Prototype](https://img.shields.io/badge/Status-Prototype-blue)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Leaflet-success)

**MetroMesh** is a local-first, offline crowd intelligence system. It simulates peer-to-peer (P2P) communication between nearby devices to estimate, map, and predict crowd density without relying on centralized servers or active internet connections.

This repository serves as a functional prototype and interactive presentation tool to demonstrate how decentralized mesh networks can be used for privacy-preserving crowd analytics.

---

## 📖 Overview

In crowded environments like underground transit stations, music festivals, or disaster zones, traditional cellular networks often fail or become congested. MetroMesh explores a solution: what if our devices communicated directly with each other using local protocols (like Bluetooth Low Energy or Wi-Fi Direct) to share anonymized density metrics?

This web application simulates that exact environment. It visualizes "handshakes" between nearby peer nodes, aggregates their observed density data, and maps it in real-time.

## ✨ Key Features

*   **📡 Radar View:** A dynamic, animated radar interface that visualizes incoming P2P handshakes from nearby simulated devices.
*   **🗺️ Map View:** A geographic visualization of crowd density across different zones, built with Leaflet.
*   **📊 Live Data Fusion:** Aggregates data from multiple peer nodes to calculate overall zone density and trigger automated alerts when areas become dangerously crowded.
*   **💻 Developer Console:** A real-time log of all system events, handshakes, and payload data.

---

## 🎭 Demo Mode vs. 📍 Real-Time Live Mode

To make this project easy to present and test, the Map interface features two distinct operating modes:

### 1. Demo Mode (London Transit)
By default, the application boots into **Demo Mode**. 
*   **How it works:** The map locks to a simulated high-traffic environment (London St Pancras / Euston area). 
*   **Purpose:** This allows you to reliably demonstrate the core functionality—zone density calculations, peer node spawning, and automated alerts—without needing to move around in the real world or grant location permissions.

### 2. Live Location Mode
With the click of a button, the app switches to **Live Location Mode**.
*   **How it works:** The app hooks into the browser's native HTML5 `navigator.geolocation` API to fetch your exact, real-time GPS coordinates. 
*   **What happens:** The map instantly flies to your real-world location. The system then begins spawning simulated peer nodes *around your actual physical location*. It displays a Google Maps-style blue dot with an accuracy radius ring.
*   **Smart Fallback:** If the browser blocks precise GPS (e.g., when running inside a secure iframe preview), the app automatically falls back to an IP-based location API to ensure the demo continues seamlessly, while prompting the user to open the app in a new tab for street-level precision.

---

## 🔮 Future Implications & Real-World Applications

While this repository is a simulation, the underlying concepts have massive real-world potential:

1.  **Privacy-Preserving Crowd Control:** Because data is exchanged locally and aggregated via mesh, no central server needs to track individual user locations. Users remain anonymous while still contributing to public safety metrics.
2.  **Underground & Subway Safety:** Transit authorities can monitor platform crowding in deep underground stations where GPS and cellular signals cannot reach, relying entirely on device-to-device communication.
3.  **Disaster Recovery:** In the event of an earthquake or severe storm that knocks out cell towers, a MetroMesh-style app could allow first responders to locate dense clusters of people needing rescue via local mesh pings.
4.  **Smart City Infrastructure:** Integration with digital signage to automatically redirect foot traffic away from bottlenecks in real-time.

---

## 🚀 Getting Started

To run this project locally on your machine:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/metromesh.git
    cd metromesh
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to `http://localhost:3000` (or the port provided in your terminal).

---

## 🛠️ Tech Stack

*   **Framework:** React 18 with Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Mapping:** Leaflet & React-Leaflet
*   **Animations:** Framer Motion (motion/react)
*   **Icons:** Lucide React

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
