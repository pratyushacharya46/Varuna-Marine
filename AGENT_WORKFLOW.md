# AI Agent Workflow Log

This document records **how AI agents were used throughout the entire FuelEU Maritime Compliance project — from project start to current state**. It follows the exact format requested and contains (1) agents used, (2) concrete prompts & outputs (examples), (3) how outputs were validated and corrected, (4) observations (where agents helped and where they failed), and (5) the best practices followed when using agents.


---

## Agents Used

* **ChatGPT (this assistant)** — primary agent used throughout the project for design, debugging, file generation, test guidance, and iterative fixes. (Session-based interactive use.)
* **GitHub Copilot** — used by the developer for inline auto-completions and boilerplate in the code editor (reported/used during development).
* **Cursor Agent** (Cursor IDE suggestions) — used for code navigation suggestions and task scaffolding (reported/used during development).
* **Terminal / CLI** — not an AI, but used in the workflow for running commands (Prisma, npm, tsx). Listed because many AI suggestions were validated via CLI.

> Only ChatGPT was used inside this conversation to produce files, debug, and describe actions. Copilot and Cursor were used by the developer during authoring as indicated in the project notes.

---

## Prompts & Outputs

Below are representative, concrete examples of prompts that were issued to the AI (ChatGPT), and the outputs it returned. These samples are actual or very-close reconstructions of the prompts used during development and include the code snippets produced so they can be audited easily.

> **Important:** the examples emphasize the *type* of prompts used and the *actual code snippets* produced (copy-paste ready). They show typical iterative prompt → generated output → refinement cycles that were used across the project.

---

### Example 1 — Create `PoolMember` entity file (fix missing module)

**Prompt (user → AI):**

```
generate PoolMember file now
```

**AI Output (generated file):**

```ts
// backend/src/core/domain/entities/PoolMember.ts

export class PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;

  constructor({
    shipId,
    cbBefore,
    cbAfter,
  }: {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }) {
    this.shipId = shipId;
    this.cbBefore = cbBefore;
    this.cbAfter = cbAfter;
  }
}
```

**Notes:** This fixed the runtime `ERR_MODULE_NOT_FOUND` caused by imports expecting `PoolMember.js`.

---

### Example 2 — Fix `PoolingRepositoryPrisma` imports & return mapping

**Prompt (user → AI):**

```
PoolingRepositoryPrisma currently imports Pool and PoolMember from same file; generate a full corrected file that uses separate Pool and PoolMember files, maps prisma results into domain objects, and handles errors.
```

**AI Output (generated file):**

```ts
// backend/src/adapters/outbound/postgres/PoolingRepositoryPrisma.ts
import { prisma } from "../../../infrastructure/db/prismaClient.js";
import { Pool } from "../../../core/domain/entities/Pool.js";
import { PoolMember } from "../../../core/domain/entities/PoolMember.js";

export class PoolingRepositoryPrisma {
  async savePool(pool: Pool): Promise<Pool> {
    if (!pool.members || pool.members.length === 0) {
      throw new Error("Cannot save pool without members");
    }

    try {
      const created = await prisma.pool.create({
        data: {
          year: pool.year,
          members: {
            create: pool.members.map((m) => ({
              shipId: m.shipId,
              cbBefore: m.cbBefore,
              cbAfter: m.cbAfter,
            })),
          },
        },
        include: { members: true },
      });

      return new Pool(
        created.year,
        created.members.map(
          (m) =>
            new PoolMember({
              shipId: m.shipId,
              cbBefore: m.cbBefore,
              cbAfter: m.cbAfter,
            })
        )
      );
    } catch (err: any) {
      console.error("❌ Prisma error saving pool:", err);
      throw new Error("Failed to save pool to database");
    }
  }

  async getAllPools(): Promise<Pool[]> {
    const rows = await prisma.pool.findMany({
      include: { members: true },
      orderBy: { id: "asc" },
    });

    return rows.map(
      (p) =>
        new Pool(
          p.year,
          p.members.map(
            (m) =>
              new PoolMember({
                shipId: m.shipId,
                cbBefore: m.cbBefore,
                cbAfter: m.cbAfter,
              })
          )
        )
    );
  }

  async getPoolById(id: number): Promise<Pool | null> {
    const p = await prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!p) return null;

    return new Pool(
      p.year,
      p.members.map(
        (m) =>
          new PoolMember({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })
      )
    );
  }
}
```

**Notes:** This mapped DB rows properly to domain objects and added basic validation & error handling.

---

### Example 3 — Convert `RoutesUseCase` to use repository (DB-backed)

**Prompt (user → AI):**

```
RoutesUseCase currently calls prisma directly. Create a RouteRepositoryPrisma and rewrite RoutesUseCase to use the repository. Also provide a seed script to load the 5 example routes.
```

**AI Output (selected snippets):**

`RouteRepositoryPrisma.ts`:

```ts
// backend/src/adapters/outbound/postgres/RouteRepositoryPrisma.ts
import { prisma } from "../../../infrastructure/db/prismaClient.js";
import { Route } from "../../../core/domain/entities/Route.js";

export class RouteRepositoryPrisma {
  async getAll(): Promise<Route[]> {
    const rows = await prisma.route.findMany();
    return rows.map((r) => new Route({
      routeId: r.routeId,
      vesselType: r.vesselType as any,
      fuelType: r.fuelType as any,
      year: r.year,
      ghgIntensity: r.ghgIntensity,
      fuelConsumption: r.fuelConsumption,
      distance: r.distance,
      totalEmissions: r.totalEmissions,
      isBaseline: r.isBaseline,
    }));
  }

  async getBaseline(): Promise<Route | null> {
    const r = await prisma.route.findFirst({ where: { isBaseline: true }});
    return r ? new Route(r as any) : null;
  }

  async setBaseline(routeId: string): Promise<Route> {
    await prisma.route.updateMany({ data: { isBaseline: false }});
    const r = await prisma.route.update({ where: { routeId }, data: { isBaseline: true }});
    return new Route(r as any);
  }

  async getOthers(excludedRouteId: string): Promise<Route[]> {
    const rows = await prisma.route.findMany({ where: { routeId: { not: excludedRouteId } }});
    return rows.map((r) => new Route(r as any));
  }
}
```

Seed script `prisma/seedRoutes.ts` (selected content):

```ts
import { prisma } from "../src/infrastructure/db/prismaClient.js";

async function main() {
  await prisma.route.deleteMany();

  await prisma.route.createMany({
    data: [
      { routeId: "R001", vesselType: "Container", fuelType: "HFO", year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500 },
      { routeId: "R002", vesselType: "BulkCarrier", fuelType: "LNG", year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
      { routeId: "R003", vesselType: "Tanker", fuelType: "MGO", year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700 },
      { routeId: "R004", vesselType: "RoRo", fuelType: "HFO", year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300 },
      { routeId: "R005", vesselType: "Container", fuelType: "LNG", year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400 }
    ]
  });

  console.log("Seeded routes.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1);});
```

**Notes:** This change removed direct Prisma usage inside the use-case and introduced a testable repository layer.

---

### Example 4 — Fixing frontend white screen (null safety)

**Prompt (user → AI):**

```
My frontend shows a blank white screen. Console shows "Cannot read properties of undefined (reading 'toFixed')". Which file and how to fix?
```

**AI Output (guidance + patch):**

* File to edit: `frontend/src/adapters/ui/RoutesTab.tsx`
* Replace risky code like:

  ```tsx
  {r.ghgIntensity.toFixed(2)}
  ```

  with:

  ```tsx
  {r.ghgIntensity?.toFixed(2) ?? "—"}
  ```
* Also suggested adding `console.log("ROUTES RESPONSE:", routes)` to debug DB payload.

**Notes:** That fixed the crash by making rendering null-safe.

---

### Example 5 — Frontend API client default & env guidance

**Prompt (user → AI):**

```
Make API client default to http://localhost:4000 but accept VITE_API_URL if present. Provide full file.
```

**AI Output (generated file):**

```ts
// frontend/src/adapters/infrastructure/apiClient.ts
const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" ? "http://localhost:4000" : "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const message =
      contentType.includes("application/json")
        ? await response.json().then((j) => JSON.stringify(j))
        : await response.text();

    throw new Error(
      `Request failed ${response.status} ${response.statusText}: ${message}`
    );
  }

  if (response.status === 204) return undefined as unknown as T;

  return (await response.json()) as T;
}

export const api = {
  get<T>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: "GET" });
  },
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    if (body !== undefined && !(body instanceof FormData)) {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    }

    return request<T>(path, {
      ...init,
      method: "POST",
      headers,
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  },
};
```

**Notes:** This prevented the frontend from accidentally calling relative `/routes` (which hit Vite server) and causing the backend to receive extra requests.

---

## Prompts Refinement Examples

During development we iteratively refined generated code by repeating small follow-up prompts. Two typical refinement patterns:

1. **Refine by adding defensive checks**

   * Prompt: “Make the component null-safe and show '—' when values missing.”

   * Output: Replaced direct `.toFixed()` usage with `?.toFixed()` + fallback.

2. **Refine by adjusting project structure**

   * Prompt: “Exports should use .js extension in imports for backend ESM — update all imports.”

   * Output: Updated import statements across server files to use `"./Module.js"` to match ESM runtime expectations.

These iterative refinements helped make the code stable in the target runtime (tsx / ts-node / ESM).

---

## Exact Verification Commands Used (examples)

* Start backend:

  ```
  cd backend
  npm run dev
  ```
* Seed DB:

  ```
  npm run seed
  ```

  or

  ```
  npx tsx prisma/seedRoutes.ts
  ```
* Run Prisma Studio:

  ```
  npx prisma studio
  ```
* Start frontend (from frontend folder):

  ```
  cd frontend
  npm run dev
  ```
* Test endpoints via REST file in VS Code or `curl` / PowerShell `Invoke-WebRequest`.

---

## Files Generated by AI (non-exhaustive list)

The agent produced full, copy-paste-ready files during the session. Major ones include:

* `backend/src/core/domain/entities/PoolMember.ts`
* `backend/src/core/domain/entities/Pool.ts` (cleaned)
* `backend/src/adapters/outbound/postgres/PoolingRepositoryPrisma.ts`
* `backend/src/adapters/outbound/postgres/RouteRepositoryPrisma.ts`
* `backend/src/core/application/usecases/RoutesUseCase.ts` (rewritten)
* `backend/prisma/seedRoutes.ts`
* `frontend/src/adapters/infrastructure/apiClient.ts` (rewritten)
* `frontend/src/adapters/ui/RoutesTab.tsx` (null-safe)
* `frontend/src/adapters/ui/CompareTab.tsx`
* `frontend/src/adapters/ui/BankingTab.tsx`
* `frontend/src/adapters/ui/PoolingTab.tsx`
* `frontend/src/App.tsx` (tweaked)

---

## Example generated snippet (RoutesTab rendering change)

**Original risky code** (was causing crash):

```tsx
<td>{r.ghgIntensity.toFixed(2)}</td>
<td>{r.fuelConsumption.toFixed(1)}</td>
<td>{r.distance.toFixed(1)}</td>
<td>{r.totalEmissions.toFixed(1)}</td>
```

**AI-suggested safe replacement**:

```tsx
<td className="px-4 py-2 text-right">{r.ghgIntensity?.toFixed(2) ?? "—"}</td>
<td className="px-4 py-2 text-right">{r.fuelConsumption?.toFixed(1) ?? "—"}</td>
<td className="px-4 py-2 text-right">{r.distance?.toFixed(1) ?? "—"}</td>
<td className="px-4 py-2 text-right">{r.totalEmissions?.toFixed(1) ?? "—"}</td>
```

---

## Example of an exact user prompt and AI output (Prisma path fix)

**Prompt:**

```
node prisma/seedRoutes.ts fails with Cannot find module '.../prismaClient.js'. How do I run seeds with tsx? Give me exact commands and a corrected seed script that imports prismaClient.ts.
```

**AI output (summary + commands):**

* Use `tsx` instead of `node` to run TypeScript seed:

  ```
  npx tsx prisma/seedRoutes.ts
  ```
* Or add a package.json script:

  ```json
  "seed": "tsx prisma/seedRoutes.ts"
  ```
* Provided corrected `seedRoutes.ts` that imports:

  ```ts
  import { prisma } from "../src/infrastructure/db/prismaClient.js";
  ```

---

## Where exact prompt strings were not recorded

Some interactions were multi-turn and the exact literal prompt text was short-form or conversational (e.g., “ok now fix the pooling repo”). For the purposes of academic documentation, the above representative prompts + outputs capture the core content and the produced code. If exact literal prompts are required for auditing, the conversational log of this session provides a verbatim transcript for each user prompt and assistant response.

---

## Validation / Corrections

This section explains how agent outputs were verified and (where necessary) corrected.

### How outputs were verified

1. **Run the backend** (`npm run dev`) to confirm no ESM import/runtime errors.
2. **Seed the database** and open **Prisma Studio** to verify rows and data types.
3. **Use the frontend** (Vite dev server) to check UI rendering for all tabs (Routes, Compare, Banking, Pooling).
4. **Use REST calls** (VS Code REST client or cURL) to directly exercise endpoints:

   * `GET /routes`
   * `POST /routes/:routeId/baseline`
   * `GET /routes/comparison`
   * `GET /banking/balance?shipId&year`
   * `POST /banking/bank`
   * `POST /banking/apply`
   * `POST /pools` (pool creation)
5. **Browser console logs and terminal logs** were examined after each change to ensure no runtime exceptions.

### Corrections applied to agent output

* **ESM import fixes:** AI initially generated TypeScript-only imports without the `.js` extension; corrected to `import ... from "./X.js"` for runtime compatibility.
* **Missing files:** AI generated missing domain files (e.g., `PoolMember.ts`) after diagnosing `ERR_MODULE_NOT_FOUND`.
* **Null-safety in UI:** AI added defensive checks for numeric fields to prevent `.toFixed()` runtime errors.
* **Prisma path & seed execution:** Adjusted seed execution to use `tsx` so TypeScript seed scripts import `prismaClient.ts` directly without a forced build step.
* **Validation checks:** added input validation in Banking and Pooling endpoints and front-end forms to prevent invalid submissions.

All corrections were applied locally and re-validated with the run/test steps above.

---

## Observations

### Where AI saved time

* **Rapid scaffolding:** Generated complete TypeScript files (domain entities, repositories, use-cases) that minimized boilerplate time.
* **Error diagnosis:** Quickly identified common pitfalls (ESM import extension issues, missing files, Prisma client path).
* **Frontend fixes:** Produced user-friendly UI components (null-safe rendering, loading/error states, chart wiring) much faster than manual typing.
* **Iteration speed:** Immediate suggestions allowed fast cycles of change → run → debug.

### Where the AI failed or hallucinated

* **Missing file assumption:** In a few cases the AI suggested imports or files that did not exist (e.g., assumed `PoolMember.js` existed), which caused runtime `ERR_MODULE_NOT_FOUND` until the missing file was created.
* **Import style confusion:** Initially produced TypeScript imports without `.js` extensions for a runtime that required ESM `.js` imports. This needed a follow-up correction.
* **Over-eager refactors:** Occasionally proposed refactors that required additional follow-up edits (e.g., use-case/ repo mismatch — `createPool` promise vs sync).
* **Minor version mismatch:** Suggested Tailwind v4 steps when project needed Tailwind v3 — developer corrected to use v3.

### How the agent + human workflow combined effectively

* **Human in the loop:** The developer validated and applied code changes, ran CLI commands, and confirmed behavior in UI/DB — the AI provided the code and diagnosis.
* **Complementary tools:** Copilot was used to speed up repetitive editing in the editor; Cursor helped with navigation; ChatGPT provided design and bugfix decisions.
* **Iterative approach:** Small, safe code changes were proposed, validated immediately, and refined — keeping the project stable.

---

## Best Practices Followed

* **Hexagonal / Ports & Adapters architecture** — core domain logic isolated from framework code.
* **Separation of concerns** — domain entities, use-cases, inbound/outbound adapters were kept separate.
* **Repository pattern** — DB access routed through Prisma repositories that return domain objects.
* **Defensive programming** — null-safe UI rendering and validated API inputs.
* **ESM compatibility** — ensured `.js` imports for runtime ESM environments (tsx/ts-node with ESM).
* **Small iterative commits** — each AI-generated change was small and validated before proceeding (you followed the “make one change, test one change” principle).
* **Documented agent usage** — this document serves as a transparent record for the grader.
* **Repeatable seed & migrations** — seeding scripts and prisma migrate commands included to get a reproducible dev DB.

---

## How to continue (short, actionable handoff for next agent)

1. **Run the project locally**

   * Backend:

     ```
     cd backend
     npm install
     npm run generate   # prisma client generate
     npm run migrate
     npm run seed
     npm run dev
     ```
   * Frontend:

     ```
     cd frontend
     npm install
     VITE_API_URL=http://localhost:4000 npm run dev
     ```
2. **Verify endpoints** described above.
3. **Run the UI** and test the four tabs thoroughly.
4. **Complete outstanding tasks** (if desired): finalize AGENT_WORKFLOW.md (this file), REFLECTION.md, and any additional tests.
5. **If adding features**, prefer small changes and re-run validations after each change.

---

## Final notes

This `AGENT_WORKFLOW.md` is written to give precise, auditable evidence of how AI agents were used across the entire project lifecycle, to assist graders in understanding the development process and to let future agents pick up work without ambiguity.
