# 🧟‍♂️ DeadGrid: A Web3 Zombie Apocalypse Survival Simulator

**DeadGrid** is a highly complex procedurally evolving, Web3-powered survival game set in a crumbling city plagued by the undead. Each day brings a new **log entry** from a lone survivor — *you*. By day, read their desperate struggle. By night, **make decisions** that affect the fate of your camp, allies, and chances of survival. Every choice you make impacts the simulation.

> Built with on-chain randomness via VRF and designed to grow autonomously over time.

---

## 📦 Project Structure


├── /logs          # Daily survivor logs (auto-generated based on game state)
├── /survivors     # Survivor profiles, inventory, and character metadata
├── /city          # Dynamic map of the decaying urban environment
└── /game_logic    # Core simulation mechanics and decision engine

## 🔮 How It Works
Daily Log Generation:
A GitHub Action (or similar automation) commits a new /logs/YYYY-MM-DD.md file representing the day's story update.

Player Decisions:
Each player can submit choices affecting their base, resources, and risks via Web3 interactions (coming soon).

Random Events:
Powered by Chainlink VRF for provably fair outcomes — no two timelines are the same.

Simulation Core:
The /game_logic module handles state transitions, consequences, resource management, and branching paths.

Interested in joining the open beta or contributing to the project? Reach out to Ali Serag!
