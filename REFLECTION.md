

# REFLECTION.md

### *FuelEU Maritime Compliance Platform — Developer Reflection*

**Student: MNIT P.A.**

---

## **1. Introduction**

This project involved building a full-stack FuelEU Maritime compliance platform using **Node.js, TypeScript, Prisma, PostgreSQL, React, and Hexagonal Architecture**.
Throughout development, I used multiple AI tools—primarily **ChatGPT**, with assistance from **GitHub Copilot** and **Cursor's inline agent**—to accelerate coding, debugging, and architectural decision-making.

This reflection summarises what I learned, how AI influenced my workflow, and what I would do differently in future iterations.

---

## **2. What I Learned**

### **2.1 Architectural Thinking**

Implementing a Hexagonal Architecture forced me to think clearly about separation of concerns:

* *Domain layer* should have zero dependencies
* *Use cases* orchestrate logic
* *HTTP & Prisma adapters* connect external systems
* *Infrastructure* only deals with frameworks, servers, DB clients

This exercise made me appreciate why large-scale systems prioritize modularity and testability.

### **2.2 Complex Business Logic (Banking & Pooling)**

FuelEU Maritime Articles 20–21 require careful modelling:

* Banking rules prevent invalid surplus/deficit transfers
* Pooling requires a *greedy* but *non-harmful* redistribution
* Route comparison requires baseline + percentage deviation logic

Working through these sharpened my ability to convert legal/technical specifications into functional algorithms.

### **2.3 Debugging ESM + TypeScript + Prisma**

This project required solving several real-world issues:

* `.js` import extensions in ESM mode
* Prisma path resolution and missing client
* TypeScript runtime vs compile-time errors
* Frontend handling of `undefined` vs numeric fields

These practical challenges improved my debugging skills more than any tutorial would.

---

## **3. How AI Improved My Efficiency**

### **3.1 Faster Code Generation**

AI greatly reduced time spent on:

* Repetitive boilerplate
* Writing React components
* Creating Express route handlers
* Generating Prisma repository files

Tasks that typically take hours were reduced to minutes.

### **3.2 Rapid Debugging**

ChatGPT helped decode cryptic errors:

* ESM import errors
* Missing modules
* Prisma schema mismatches
* Frontend rendering crashes

Often, AI identified root causes in seconds.

### **3.3 Architecture Validation**

AI acted as a real-time reviewer:

* Suggesting cleaner separation of layers
* Refactoring large files
* Ensuring consistency across backend modules

This improved maintainability and readability.

---

## **4. Limitations of AI in This Project**

### **4.1 Occasional Hallucinations**

AI sometimes:

* Assumed files existed when they did not
* Invented method names (`createPool`) that weren’t implemented
* Gave Tailwind v4 instructions while I used v3
* Produced TypeScript imports incompatible with ESM runtime

Every AI-generated change had to be reviewed manually.

### **4.2 Lack of Context Persistence**

The AI occasionally lost prior architectural context, requiring me to restate the folder structure or design intent.

### **4.3 Over-simplified Solutions**

Some outputs were technically correct but did not match real project constraints, e.g.:

* Returning plain JSON instead of domain objects
* Adding unnecessary abstractions
* Ignoring edge cases

Human oversight was essential.

---

## **5. My Improvements During This Project**

### **5.1 Better Prompt Engineering**

I learned to:

* Provide full file paths
* Paste exact errors
* Request “full corrected file” instead of snippets
* Ask for replacements line-by-line when necessary

Clear prompts produced higher-quality output.

### **5.2 Validation & Testing Discipline**

Each AI-generated suggestion was tested immediately:

* Start backend
* Run frontend
* Check DB via Prisma Studio
* Make API calls
* Observe browser logs

This prevented large debugging cycles later.

### **5.3 Understanding AI as a Co-Developer**

Instead of treating AI as an oracle, I treated it as:

* A fast junior developer
* A debugging assistant
* A documentation writer

Ultimately, I took responsibility for correctness and system design.

---

## **6. What I Would Improve Next Time**

1. **Write unit tests earlier**
   AI can generate test files, but I relied on manual testing until late in development.

2. **Automate more with scripts**
   Seed scripts, migrate scripts, and watch-mode builds could be streamlined.

3. **Better CI pipeline**
   GitHub Actions for linting, type-checking, and running prisma validation would prevent regressions.

4. **More explicit documentation**
   Although AI generated large parts of the documentation, integrating it earlier would save time.

---

## **7. Final Thoughts**

This project taught me that **AI is most powerful when used as a collaborator, not a replacement**.
It accelerated development dramatically, but only because I actively guided and validated it.
The combination of:

* Solid architecture
* Real business logic
* AI-augmented development
* Incremental validation

resulted in a robust, fully functional FuelEU Maritime compliance platform.

AI amplified my productivity — but understanding, design thinking, debugging, and decision-making still depended on me.

---

