# Consensus Capital 


<p align="center">
  <img src="https://img.shields.io/badge/McHacks%2013%20Winner-Auth0%20Prize-gold?style=for-the-badge" />
  <img src="https://img.shields.io/badge/McHacks%2013%20Winner-%231%20Best%20Project%20Using%20Gumloop-blueviolet?style=for-the-badge" />
</p>


## Built With

<p align="center">
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Java-6DB33F?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Gumloop-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Gemini-blue?style=for-the-badge" />  
  <img src="https://img.shields.io/badge/Auth0-black?style=for-the-badge" />
</p>
<br>

**Consensus Capital** bridges traditional financial analysis with real-time prediction market probabilities to reveal hidden macro risks and non-obvious correlations in investment portfolios.

By combining **Polymarket prediction data**, **semantic vector search**, and **AI-driven workflows**, Consensus Capital gives traders a probabilistic edge that charts and earnings reports alone can’t provide.



## 🏆 Hackathon Wins

- 🥇 **McHacks 13 — Auth0 Prize Winner**
- 🥇 **McHacks 13 — Best Project Using Gumloop**



##  Inspiration

During our brainstorming sessions, we kept coming back to one phenomenon: **Polymarket**.

In recent years, prediction markets have consistently forecasted major global events with higher accuracy than traditional news sources. Yet, despite this predictive power, stock traders largely ignore these signals.

We realized that traders are operating with **incomplete data**. While markets obsess over technical indicators and earnings, they miss the *probabilistic expectations* that drive sentiment and volatility.

In an era of peak uncertainty, the real edge isn’t just getting the news first — it’s **connecting macro probabilities directly to your portfolio**. Consensus Capital was built to unlock that missing dimension.



##  What It Does

Consensus Capital connects **real-time prediction markets** with **traditional asset data** to stress-test portfolios against macro-level risks.

### 🔍 Key Capabilities
- Ingests the **top 50 most active markets** from Polymarket
- Runs a multi-stage **AI workflow** using Gumloop
- Analyzes portfolios against **geopolitical, regulatory, and economic events**
- Uses **cosine similarity** to uncover *non-obvious correlations*

Instead of reacting to headlines, users gain a **360-degree view of portfolio exposure** that traditional tools miss.



##  Architecture Overview

###  Frontend — React & TypeScript
- Modular, responsive dashboard
- Strong type safety for AI-generated nested JSON
- Clean visualizations for similarity scores and risk alerts

###  Backend — Java Spring Boot
- Scalable REST API
- Enterprise-grade session management
- **Auth0 integration** with:
  - Passwordless login
  - MFA
  - Biometric Passkeys (FaceID / TouchID)
- MongoDB for flexible portfolio storage

###  Data Science Engine — Java & Python
- Dedicated microservice for:
  - Polymarket & Yahoo Finance ingestion
  - Embedding generation
  - Cosine similarity computation

###  AI Orchestration — Gumloop
- Automated workflows acting as the system’s brain
- Stock classification
- Noise filtering (sports betting, irrelevant markets)
- Natural-language insight generation



##  Challenges

- **Bridging deterministic prices with probabilistic events**
- Keyword matching failed to capture real relevance
- Pivoted to **semantic analysis using vector embeddings**
- Required careful API design between Java and Python services



##  What We’re Proud Of

-  **Enterprise Auth in 24 Hours**  
  Full Auth0 integration with MFA and biometrics without hurting UX.

-  **Smart Caching Layer**  
  Prevents API rate limits and delivers instant insights.

-  **Semantic Relevance Engine**  
  Understands that a *Taiwan blockade* is relevant to *Nvidia* — even without keyword overlap.

-  **Seamless Multi-Stack Integration**  
  React, Spring Boot, Python, and Gumloop working together cleanly.



##  What We Learned

- **LLMs Need Guardrails**  
  Clean, parsable JSON requires strict prompting and validation.

- **Meaning > Text**  
  Semantic similarity dramatically outperforms keyword matching.

- **Hybrid Stacks Are Hard (But Worth It)**  
  Java + Python forced disciplined API design and data contracts.

- **Rapidly Learning New AI Platforms**  
  Gumloop’s learning curve paid off with powerful orchestration.



##  What’s Next

- Deeper, more actionable insights
- Expanded *what-if* scenario modeling
- Custom Auth0 refresh tokens
- Transparent explanations behind every correlation



##  License

MIT
