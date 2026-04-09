# Ceduverse Platform

## Overview
Ceduverse is an innovative EdTech platform for the Latin American market, integrating AI-powered tutoring, Web3 blockchain for verifiable certificates, and a cooperative enterprise sponsorship model. It offers localized, interactive learning experiences, aiming to lead the professional education sector in the region. Key capabilities include a NotebookLM-style virtual classroom, 3D achievement badges, and seamless Web3 wallet integration. The platform's vision is to revolutionize professional education through advanced technology and strategic partnerships, addressing the unique needs of the Latin American market.

## User Preferences
I want to be communicated with in clear, concise language. Prioritize iterative development, focusing on one feature or fix at a time. Before making any significant changes or architectural decisions, please ask for confirmation. For any UI/UX related tasks, ensure the implementation aligns with the provided brand colors and typography.

## System Architecture
The platform is built with React 19, TypeScript, Tailwind CSS, and Framer Motion for the frontend, and Express.js with Drizzle ORM and PostgreSQL for the backend.

**Key Architectural Patterns & Design Decisions:**

*   **Multilingual & Localized UI:** Fully localized for Latin American Spanish.
*   **Dynamic Onboarding & RBAC:** Personalized onboarding and a unified 8-role taxonomy with role-based access control.
*   **Global Config System:** A dynamic configuration system for managing features and platform settings via an admin UI.
*   **Virtual Classroom (Aula Virtual STPS):** Features multimedia content, integrated evaluations, listening validation, and an "Infographic View."
*   **3D Achievement Badges:** Visually rich, collectible badges for course and quiz completion.
*   **Web3 Integration:** Utilizes `ethers.js v6` for Web3 wallet creation and blockchain-based certificate issuance (Digital Diplomas, Constancia DC-3 STPS, Certificado SEP).
*   **Enterprise Sponsorship Model:** Supports organizations sponsoring employee education with team management and progress tracking.
*   **Tutor IA (AI Studio):** AI-personalized courses with multiple viewing modes and interactive chat, powered by OpenAI GPT-4o and TTS-1-HD.
*   **Hardware Store (Tienda):** E-commerce platform for selling hardware wallets (Vault Kit, Tangem) with light Ceduverse theme (cedu-cream, cedu-blue, cedu-orange), multi-step checkout, referral validation, shipping quotes (Envia.com), MercadoPago integration, and informational sections (Seguridad, Bóveda Blockchain, FAQs) with tab navigation.
*   **Digital vCards:** Database-driven public contact pages with user customization, QR code downloads, and automatic synchronization with profile changes.
*   **Legal Pages & Mandatory Terms Acceptance:** Versioned legal documents with mandatory acceptance tracking using SHA-256 hashes.
*   **Partner and Admin Dashboards:** Comprehensive dashboards for commercial partners and administrators to manage referrals, organizations, commissions, sales, and financial models.
*   **DENUE Commercial Intelligence Pipeline:** System for identifying, scoring, and managing business prospects using INEGI's DENUE data, with lead scoring, enrichment, and admin UI.
*   **Bulk Employee Management:** Features for bulk employee onboarding and monthly SAM requests via Excel uploads.
*   **Employee Invitation Registration Flow:** Streamlined registration for invited employees with token validation and automatic team linking.
*   **Facturación CFDI 4.0:** Integrated invoicing system using Facturapi.
*   **Adhesión Cooperativa:** Cooperative membership enrollment with sequential numbering and NFT-style certificates.
*   **Instructor Accreditation & Onboarding:** Two-path accreditation system (DC-5 and Internal) with quizzes, legal acceptance, and payment processing, followed by a 5-slide onboarding wizard.
*   **HeyGen Digital Twin:** In-browser recording and creation of AI Digital Twins for instructors using HeyGen API, with custom avatar preferences and video generation.
*   **LiveAvatar (Tutor IA en Vivo):** Real-time AI avatar interactions for students using HeyGen Streaming API and Claude for intelligent responses.
*   **Private Sessions:** Live video call sessions between instructors and students via Daily.co.

## External Dependencies
*   **PostgreSQL:** Primary database.
*   **Ceducap.academy:** External academy platform (live API sync every 6 hours, 988+ courses, fallback to DB cache if API unavailable).
*   **ethers.js v6:** Web3 interactions.
*   **Vite:** Frontend build tool.
*   **Tailwind CSS:** CSS framework.
*   **Framer Motion:** Animation library.
*   **shadcn/ui:** UI component library.
*   **OpenAI GPT-4o:** AI content generation and chat.
*   **OpenAI TTS-1-HD:** Text-to-speech.
*   **Resend:** Email delivery.
*   **pdfkit:** Server-side PDF generation.
*   **Facturapi:** Mexican electronic invoicing API.
*   **exceljs:** Excel file generation and parsing.
*   **HeyGen API:** Digital Twin avatar video generation and LiveAvatar streaming.
*   **Daily.co API:** Embedded video call rooms for private sessions.
*   **Anthropic Claude:** AI tutor responses for LiveAvatar.
*   **MercadoPago:** Payment processing for the Ceduverse Store.
*   **Envia.com:** Shipping rate quotes and label generation for the Ceduverse Store.