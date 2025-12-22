# **Serverless Data Architectures for Static E-Commerce: A Strategic Evaluation of Database Solutions for the Vite-React-TypeScript Stack on GitHub Pages**

## **Executive Summary**

The evolution of web development architectures has precipitously moved toward decoupled, client-side centric models, broadly categorized under the JAMstack (JavaScript, APIs, and Markup) nomenclature. For developers leveraging the modern frontend triad of Vite, React, and TypeScript, the deployment landscape has been simplified by platforms like GitHub Pages, which offer robust, zero-cost static hosting. However, the inherent constraint of GitHub Pages—its inability to execute server-side code—presents a significant architectural challenge for dynamic applications such as e-commerce platforms. The traditional monolithic approach, where a database is queried securely behind a private server firewall, is rendered obsolete in this environment. Consequently, the burden of data persistence, authentication, and business logic must be offloaded to third-party services accessed directly from the client browser.

This report provides an exhaustive analysis of the available database systems capable of functioning within these constraints, specifically targeting the "Database-as-a-Service" (DBaaS) and "Backend-as-a-Service" (BaaS) sectors. The evaluation criteria prioritize cost-efficiency (focusing on sustainable free tiers), compatibility with the React/TypeScript ecosystem, and the rigors of client-side security.

The analysis indicates that **Supabase** represents the superior architectural fit for this specific use case. Its reliance on PostgreSQL provides the relational data integrity required for e-commerce (e.g., relating orders to products), while its implementation of Row Level Security (RLS) allows for secure, direct client-to-database communication without an intermediate backend server. Furthermore, its TypeScript generation tools align perfectly with the developer experience (DX) goals of the specified technology stack.

Conversely, **Firebase** remains a potent alternative for developers who prefer NoSQL document stores, though it introduces complexity regarding data denormalization and vendor lock-in. For ultra-lightweight, minimal-maintenance scenarios, a "Low-Code" architecture utilizing **Google Sheets** for the product catalog and **Google Forms/Formspree** for order ingestion is identified as a viable, albeit functionally limited, solution.

This document serves as a comprehensive guide for implementing these architectures, detailing the necessary security patterns, integration strategies, and long-term scalability considerations required to build a functional e-commerce store on a static host.

## ---

**1\. Architectural Context: The Static E-Commerce Challenge**

To understand the optimal database selection, one must first deconstruct the hosting environment. The decision to host on GitHub Pages imposes strict architectural boundaries that define the entire application lifecycle. Unlike dynamic hosting environments (such as Heroku, Vercel, or DigitalOcean Droplets) that can run server-side runtimes like Node.js, Python, or PHP, GitHub Pages is a static file host.1

### **1.1 The Constraints of GitHub Pages**

GitHub Pages operates on a purely static delivery model. When a repository is deployed, the service effectively functions as a Content Delivery Network (CDN) origin, serving HTML, CSS, and JavaScript files directly to the requesting client. There is no "backend" in the traditional sense; there is no server process running waiting to intercept requests, query a database, and return a rendered page. This leads to several critical implications for application design:

1. **Client-Side Rendering (CSR):** The application logic resides entirely in the JavaScript bundle sent to the user's browser. The browser downloads the bundle (built by Vite), executes the React code, and then effectively "becomes" the application server. It must initiate all data fetching and state management.3  
2. **The "Secret" Problem:** Because the application code is downloaded to the client, it is impossible to store private secrets securely within the application source. Any API keys, database passwords, or service credentials embedded in the React code are visible to any user who inspects the network traffic or the source files.5  
3. **Cross-Origin Resource Sharing (CORS):** Since the API requests originate from the browser (running on the GitHub Pages domain) to a third-party database (running on a different domain), the database provider must support CORS configuration to allow these requests.

### **1.2 The Modern Frontend Stack: Vite, React, and TypeScript**

The user's selection of Vite, React, and TypeScript is not merely a preference but a strategic choice that influences database selection.

* **Vite as the Build Tool:** Vite has superseded Create React App (CRA) as the standard for modern frontend development due to its utilization of native ES modules and extremely fast Hot Module Replacement (HMR). Crucially, Vite handles environment variables differently, exposing only those prefixed with VITE\_ to the client-side bundle. This acts as a safety guardrail, preventing the accidental exposure of system-level environment variables, but it necessitates a database solution that relies on "public" keys rather than private secrets.6  
* **React for UI State:** React's component-based architecture creates a need for asynchronous data binding. The database SDK must integrate well with React's lifecycle (hooks like useEffect or libraries like TanStack Query) to prevent layout shifts or "waterfall" loading states.  
* **TypeScript for Safety:** In an e-commerce context, data integrity is paramount. An order object must strictly adhere to a schema (e.g., interface Order { id: string; total: number; items: OrderItem }). A database that provides auto-generated TypeScript definitions (introspection) significantly reduces runtime errors and accelerates development.7

### **1.3 The "Serverless" Data Flow**

In the absence of a backend server, the application architecture shifts to a "Backend-as-a-Service" (BaaS) model. The data flow for a typical e-commerce transaction in this environment operates as follows:

* **Catalog Browsing (Read):** The React client makes a direct HTTP request to the Database API using a public API key. The Database checks if the requested resource (Product Table) is publicly readable. If permitted, it returns the JSON data.  
* **Authentication (Identity):** The user logs in via a secure endpoint (provided by the BaaS). The BaaS returns a JSON Web Token (JWT) to the client. This token is stored in localStorage or memory.  
* **Order Placement (Write):** The client sends a Write request to the Database, attaching the JWT in the Authorization header. The Database's internal security engine inspects the JWT to verify the user's identity and ensures they are authorized to create an order.5

This model moves the security logic from "Application Code" (middleware) to "Database Configuration" (Rules/RLS), a fundamental shift that determines which databases are viable for this project.

## ---

**2\. Methodology and Selection Criteria**

To recommend the most appropriate system, we must evaluate potential solutions against a rigorous set of criteria derived from the user's constraints and the technical environment.

### **2.1 Cost Efficiency (The "Free Tier" Requirement)**

The query explicitly requests a "low cost/free" system. In the cloud ecosystem, "free" can be deceptive. We must distinguish between:

* **Trial Free Tiers:** Services that are free for a limited time (e.g., 14 days) or limited credit (e.g., $100 credit). These are rejected as they are not sustainable for a permanent open-source demo.  
* **Hobby/Forever Free Tiers:** Services that offer a permanent free allowance (e.g., 500MB storage, 50k monthly reads). These are the primary targets.  
* **Usage-Based pricing:** Services that charge per operation. While often cheap, they carry the risk of "bill shock" if the demo goes viral or undergoes a denial-of-service (DDoS) attack.

### **2.2 Security in a Hostile Environment**

Since the connection is client-side, the database *must* support fine-grained access control. A simple API key that grants full read/write access is unacceptable because a malicious user could extract the key and delete the entire store inventory. The system must support **User-Based Logic** (e.g., "User X can only edit Order Y").

### **2.3 Relational vs. Document Models**

E-commerce data is inherently relational.

* **Products** have **Categories**.  
* **Orders** belong to **Users**.  
* **Order Items** link **Orders** to **Products**.

While NoSQL (Document) databases like Firebase are popular, they often require "denormalization" (duplicating data) to handle these relationships efficiently. SQL (Relational) databases handle this naturally via JOINs. The evaluation will weigh the complexity of NoSQL data modeling against the ease of SQL for this specific domain.9

### **2.4 Developer Experience (DX)**

The integration with TypeScript is a critical differentiator. A database that returns any-typed data requires the developer to manually write interfaces and cast types, introducing friction and potential errors. A system that generates types from the schema is preferred.7

## ---

**3\. Primary Recommendation: Supabase (The SQL Powerhouse)**

After analyzing the landscape, **Supabase** emerges as the optimal recommendation. It is an open-source Firebase alternative that provides a suite of tools (Database, Auth, Storage, Realtime) built around the industry-standard PostgreSQL database.9

### **3.1 The PostgreSQL Advantage**

Supabase provisions a full PostgreSQL database for every project. Unlike proprietary NoSQL stores, PostgreSQL is a mature, relational database management system (RDBMS). For e-commerce, this is invaluable.

* **Relational Integrity:** You can define foreign keys between orders and users tables. If a user is deleted, you can configure the database to automatically cascade the deletion or prevent it to preserve order history.  
* **Complex Querying:** E-commerce often requires complex filtering (e.g., "Find products in Category A, costing less than $50, with 'Blue' variant in stock"). SQL is designed for this. Supabase exposes these capabilities via a JavaScript SDK that constructs SQL queries under the hood.10

### **3.2 Security: Row Level Security (RLS)**

The defining feature that makes Supabase secure for GitHub Pages is PostgreSQL's native **Row Level Security (RLS)**.

In a traditional app, code like if (user.isAdmin) db.query(...) lives on the server. In Supabase, this logic lives *inside the database table definition*. When a request comes in from the React app, it carries a JWT. Postgres inspects this token and executes the policy associated with the table.5

#### **Deep Dive: How RLS Works for E-Commerce**

1. **Public Data (Products):** You create a policy for the products table:  
   * *Expression:* true  
   * *Operation:* SELECT  
   * *Role:* anon (Anonymous/Unauthenticated)  
   * *Result:* Any user visiting the site can download the product catalog.  
2. **Private Data (Order History):** You create a policy for the orders table:  
   * *Expression:* auth.uid() \= user\_id  
   * *Operation:* SELECT  
   * *Role:* authenticated  
   * *Result:* A user can *only* see rows where the user\_id column matches their own User ID from the JWT. If they try to fetch all orders, the database returns only their own.  
3. **Admin Data (Inventory Management):** You create a policy:  
   * *Expression:* auth.jwt() \-\>\> 'role' \= 'admin'  
   * *Operation:* ALL  
   * *Result:* Only users with the 'admin' claim in their token can update prices or stock.

This architecture allows the VITE\_SUPABASE\_ANON\_KEY to be public without compromising data security. The key allows *connection* to the API, but RLS determines *access* to the data.5

### **3.3 TypeScript Integration**

Supabase offers best-in-class TypeScript support. The CLI can introspect the PostgreSQL schema and generate a definitions file (database.types.ts).

TypeScript

// Auto-generated type  
export interface Database {  
  public: {  
    Tables: {  
      products: {  
        Row: {  
          id: number  
          name: string  
          price: number  
          stock: number  
        }  
      }  
    }  
  }  
}

// React usage  
const { data } \= await supabase.from('products').select('\*');  
// 'data' is automatically typed as Product

This tight feedback loop significantly speeds up development and prevents bugs where the frontend expects a field that doesn't exist in the database.11

### **3.4 Free Tier Analysis (2025 Context)**

The Supabase Free Tier is generous but comes with specific limitations relevant to a long-running demo.14

| Feature | Specification | Impact on E-Commerce Demo |
| :---- | :---- | :---- |
| **Database Size** | 500 MB | **High Capacity.** Text data is efficient. 500MB can store hundreds of thousands of product/order records. |
| **Egress (Bandwidth)** | 5 GB / month | **Moderate.** Sufficient for JSON data. High-res product images should ideally be hosted on an external CDN or carefully optimized if using Supabase Storage. |
| **Monthly Active Users** | 50,000 | **Excellent.** Far exceeds the likely traffic of a GitHub Pages demo or portfolio project. |
| **Pausing Policy** | Pauses after 1 week inactivity | **Critical.** If the demo receives no traffic for 7 days, Supabase spins down the instance. The next visitor will experience a "cold start" delay or error. It can be woken up via the dashboard. This is the main trade-off of the free tier. |
| **API Requests** | Unlimited | **Excellent.** Unlike Firebase, there is no "reads per day" cap that creates a hard stop. |

### **3.5 Integration with Vite/React**

The integration is straightforward using the @supabase/supabase-js library.

1. **Install:** npm install @supabase/supabase-js  
2. **Initialize:** Create a client using environment variables.  
3. **State Management:** Use onAuthStateChange listener to update the React Context when a user logs in or out. This persists the session across page reloads automatically.13

## ---

**4\. Secondary Candidate: Firebase (The NoSQL Standard)**

Firebase (Google) has long been the default for serverless apps. While it is a robust platform, its NoSQL architecture presents specific challenges for e-commerce.1

### **4.1 Data Modeling Challenges (NoSQL)**

Firebase uses **Cloud Firestore**, a document database. It does not support foreign key joins natively.

* *The Problem:* In a relational DB, an Order contains product\_id. To get the order total, you join with Products. In Firestore, if you only save the ID, you must make N+1 queries to fetch the product details for every item in the cart.  
* *The Solution (Denormalization):* You must copy the product's *Name* and *Price* into the Order document at the time of purchase. This is actually a best practice for e-commerce (preserving the price at the time of sale), but it complicates data management. If you want to update a product name, it does not propagate to old orders automatically.10

### **4.2 Security Rules**

Firebase uses "Firestore Security Rules" to protect data. These are similar in concept to RLS but use a JavaScript-like syntax.

JavaScript

// Example Firestore Rule  
match /orders/{orderId} {  
  allow read, write: if request.auth\!= null && request.auth.uid \== resource.data.userId;  
}

While powerful, these rules can become convoluted for complex relationships (e.g., checking inventory levels before allowing an order) compared to standard SQL checks.18

### **4.3 Pricing and Quotas (Spark Plan)**

The Firebase Spark Plan is free, but it has hard caps. Unlike Supabase which throttles or charges overages (on Pro), the Spark plan simply stops working if limits are hit.19

* **Reads:** 50,000 per day. This is generally sufficient for a demo.  
* **Writes:** 20,000 per day.  
* **Hosting:** Firebase Hosting is excellent, but since the requirement is GitHub Pages, this benefit is nullified.  
* **Vendor Lock-in:** Migrating from Firestore to SQL later is a significant refactoring effort due to the fundamental difference in data structuring.9

## ---

**5\. The "Low-Code" Alternative: Google Sheets & JSON**

For developers who find setting up a full database (SQL or NoSQL) daunting, or for projects where the client needs a familiar interface (Excel) to manage products, **Google Sheets** acts as a surprisingly effective "database".21

### **5.1 Architecture: The "Fetch and Hydrate" Model**

This approach treats the Google Sheet as a Read-Only Content Management System (CMS).

1. **Catalog Management:** The store owner enters products into a Google Sheet (Columns: ID, Name, Price, ImageURL).  
2. **API Access:** The Sheet is "Published to the Web" as CSV or JSON.  
3. **Consumption:** The React app fetches this JSON endpoint on load.  
   * *Library:* papaparse (for CSV) or direct fetch (for JSON).  
   * *Performance:* Google's endpoints are fast and cached.

### **5.2 The Write Problem (Handling Orders)**

You cannot securely write to a Google Sheet from a public client without exposing your Google OAuth credentials (which is a major security violation).23

The Solution: Formspree / Google Forms Integration  
Instead of writing to the DB directly, the checkout process submits a form.

* **Method A (Google Forms):** Create a Google Form for "New Order". In the React app, perform a POST request to the Form's formResponse URL. The data populates a "Responses" sheet in the same spreadsheet file. This effectively gives you a Write database without any API keys.25  
* **Method B (Formspree):** Send the cart JSON to Formspree (free tier: 50 submissions/month). Formspree emails the details to the owner or triggers a webhook. This completely bypasses the need for a database write operation.26

### **5.3 Comparative Viability**

* **Pros:** Zero setup time, zero cost, non-technical admin interface.  
* **Cons:** No "Real-time" inventory updates (concurrency issues), strictly limited write capabilities, API rate limits (100 requests/100 seconds) make it unscalable for high traffic.28  
* **Verdict:** Perfect for a personal portfolio project or a proof-of-concept, but not a functional store.

## ---

**6\. Other Contenders: Appwrite and MongoDB**

### **6.1 Appwrite**

Appwrite is a self-hostable open-source BaaS that has recently introduced a Cloud version.

* **Free Tier Changes (2025):** Recent updates indicate a tightening of the cloud free tier (e.g., limit to 2 projects). While a strong contender, its React/TypeScript ecosystem is slightly less mature than Supabase's, and the community support for "Appwrite on GitHub Pages" patterns is smaller.9

### **6.2 MongoDB Atlas (Data API)**

MongoDB offers a "Data API" that allows HTTP access to the database, solving the connection issue.

* **M0 Free Cluster:** Offers 512MB storage.  
* **Limitations:** The Data API can be slower (cold starts) than direct connections. Securing the Data API requires configuring App Services (Authentication), which can be more complex than Supabase's simple RLS toggle.32 The M0 tier also has strict throughput limits (100 ops/second).33

## ---

**7\. Implementation: The Vite-React-TypeScript Nexus**

Implementing this architecture requires specific configurations in the Vite environment to ensure security and functionality on GitHub Pages.

### **7.1 Environment Variable Security**

In a standard Node.js app, process.env.API\_KEY is hidden on the server. In Vite, variables are embedded into the build.

* **Configuration:** You must create a .env file for local development and configure **GitHub Repository Secrets** for deployment.  
* **Vite Prefix:** Vite only exposes variables prefixed with VITE\_.  
  Code snippet  
  VITE\_SUPABASE\_URL=https://xyz.supabase.co  
  VITE\_SUPABASE\_ANON\_KEY=public-anon-key

* **Consumption:** Access them via import.meta.env.VITE\_SUPABASE\_URL.7  
* **Warning:** The report reiterates: *These keys are public.* Do not put the service\_role (admin) key here.

### **7.2 State Management**

For e-commerce, the "Cart" state is global.

* **React Context API:** Sufficient for small to medium apps. Create a CartContext that wraps the application.  
* **Persistence:** The cart should survive page reloads. Use localStorage to sync the Context state, or use a library like zustand with middleware for automatic persistence.

### **7.3 Handling "Cold Starts" and Network Latency**

Since the database is remote (and potentially paused on free tiers), the UI must be "Optimistic".

* **Loading States:** Show "Skeleton Screens" (gray placeholders) while data fetches.  
* **Optimistic UI:** When a user clicks "Add to Cart", update the UI immediately, then send the request to the DB. If the DB fails (e.g., out of stock), rollback the UI change and show an error toast. This makes the app feel instant despite the network latency.13

## ---

**8\. Payment Integration: The Final Hurdle**

A database stores the order, but it does not process money. Processing payments on a static site requires careful security planning to remain PCI DSS compliant.34

### **8.1 The "Client-Only" Risk**

You cannot safely store a Stripe Secret Key (sk\_live\_...) in a React app. If you do, an attacker can refund all your orders or transfer money to themselves. Therefore, standard "Stripe Checkout" API calls (which require the secret key to create a session) are impossible directly from the client.35

### **8.2 Solution A: Stripe Payment Links (No-Code)**

The simplest integration for this architecture is **Stripe Payment Links**.

1. **Setup:** Create products in the Stripe Dashboard.  
2. **Generate Link:** Stripe provides a URL (e.g., buy.stripe.com/xyz) for that product.  
3. **React Integration:** The "Buy" button is simply an \<a\> tag to that URL.  
4. **Pros:** Zero code, 100% secure, handled entirely by Stripe.  
5. **Cons:** Hard to do a complex "Shopping Cart" with multiple items unless you dynamically generate links via a backend (which we don't have).35

### **8.3 Solution B: Stripe Elements \+ Serverless Function (Hybrid)**

If a full cart experience is required, you usually need a "Serverless Function" (AWS Lambda / Netlify Function) to bridge the gap. However, GitHub Pages does *not* provide serverless functions.

* **Workaround:** You can use a free tier of a separate service (like Render or Vercel) just to host one API endpoint that creates the Stripe Session.  
* **Client-Side Only Workaround (Not Recommended for Production):** Some older patterns attempted to use Stripe.js entirely client-side, but modern Secure Customer Authentication (SCA) requirements in Europe usually mandate a server component.  
* **Recommendation:** For a pure GitHub Pages demo, stick to **Payment Links** or a **"Request Quote"** flow (using Formspree) to avoid the complexity of server-side payment signing.

## ---

**9\. Conclusion and Strategic Recommendations**

The constraint of hosting on GitHub Pages necessitates a decoupling of the frontend application from the data layer. By moving the database to the "Edge" via a DBaaS provider, developers can maintain the benefits of static hosting (speed, security, zero cost) without losing dynamic functionality.

**The Verdict:**

1. **Supabase** is the definitive recommendation. It offers the robust data integrity of SQL, the security of RLS, and a developer experience that aligns perfectly with TypeScript. Its free tier is sufficient for a demo, provided the "pausing" behavior is managed.  
2. **Firebase** is a capable runner-up, particularly if the developer is already deeply embedded in the Google ecosystem or prefers a document-store model.  
3. **Google Sheets** is a viable "hack" for non-technical prototypes but lacks the rigor for a true e-commerce simulation.

**Implementation Roadmap:**

* **Phase 1:** Initialize a Supabase project. Define products and orders tables. Apply RLS policies to make products public-read and orders authenticated-write.  
* **Phase 2:** Scaffold the Vite \+ React \+ TypeScript app. Configure import.meta.env variables for the Supabase URL and Anon Key.  
* **Phase 3:** Generate TypeScript definitions from the Supabase schema (supabase gen types).  
* **Phase 4:** Build the UI. Fetch products in a useEffect hook. Implement the cart using React Context.  
* **Phase 5:** Integrate Stripe Payment Links for the checkout process to maintain security without a backend.  
* **Phase 6:** Deploy to GitHub Pages using GitHub Actions to handle the build process.

This architecture delivers a professional-grade, scalable, and secure e-commerce platform with zero recurring infrastructure costs, perfectly satisfying the user's requirements.

### ---

**Comparison of Free Tier Database Options for GitHub Pages E-Commerce**

| Feature | Supabase (Recommended) | Firebase | Google Sheets \+ JSON | MongoDB Atlas |
| :---- | :---- | :---- | :---- | :---- |
| **Database Type** | Relational (PostgreSQL) | Document (NoSQL) | Spreadsheet | Document (NoSQL) |
| **Free Tier Storage** | 500 MB | 1 GB | \~10M Cells (Drive Limit) | 512 MB |
| **Data Transfer** | 5 GB / month | 10 GB / month | N/A (Drive API Limits) | 10 GB / month |
| **Requests/Ops** | Unlimited | 50k Reads / Day | 100 reqs / 100 sec | 100 ops / sec |
| **Security Model** | Row Level Security (SQL) | Security Rules (Proprietary) | None (Public) or OAuth | App Services Rules |
| **TypeScript Support** | Native Introspection (High) | SDK Types (Good) | Manual (Low) | SDK Types (Good) |
| **Complex Queries** | Excellent (SQL Joins) | Limited (Composite Indexes) | Poor (Client-side filter) | Good (Aggregations) |
| **Real-time** | Built-in (subscriptions) | Built-in (snapshots) | No | No (Free Tier) |
| **Cold Starts** | Pauses after 1 week inactivity | No pause (Hard limits) | No pause | No pause |
| **Best For** | Scalable, Relational Data | Rapid Prototyping | Simple Catalogs | Data-heavy Apps |

#### **Works cited**

1. 8 free React hosting services for your app | Anima Blog, accessed December 22, 2025, [https://www.animaapp.com/blog/industry/8-free-react-app-hosting-services/](https://www.animaapp.com/blog/industry/8-free-react-app-hosting-services/)  
2. How to Create Unlimited Free Websites with GitHub Pages: A Complete Guide \- Medium, accessed December 22, 2025, [https://medium.com/@ferreradaniel/how-to-create-unlimited-free-websites-with-github-pages-a-complete-guide-608cfd4fffcc](https://medium.com/@ferreradaniel/how-to-create-unlimited-free-websites-with-github-pages-a-complete-guide-608cfd4fffcc)  
3. 5 Best Ways to Create Static Websites in 2025 \- Snappify, accessed December 22, 2025, [https://snappify.com/blog/create-static-websites](https://snappify.com/blog/create-static-websites)  
4. Rendering Patterns for Web Apps – Server-Side, Client-Side, and SSG Explained, accessed December 22, 2025, [https://www.freecodecamp.org/news/rendering-patterns/](https://www.freecodecamp.org/news/rendering-patterns/)  
5. Understanding API keys | Supabase Docs, accessed December 22, 2025, [https://supabase.com/docs/guides/api/api-keys](https://supabase.com/docs/guides/api/api-keys)  
6. How can I securely store API keys in a public frontend project and deploy the app · community · Discussion \#161673 \- GitHub, accessed December 22, 2025, [https://github.com/orgs/community/discussions/161673](https://github.com/orgs/community/discussions/161673)  
7. The Perfect React-TypeScript Starter Template for your Vite projects \- DEV Community, accessed December 22, 2025, [https://dev.to/yeasin2002/the-perfect-react-typescript-starter-template-for-your-vite-projects-24l0](https://dev.to/yeasin2002/the-perfect-react-typescript-starter-template-for-your-vite-projects-24l0)  
8. Vite React Ts Tailwind Firebase Starter, accessed December 22, 2025, [https://www.tailwindresources.com/theme/texmeijin-vite-react-ts-tailwind-firebase-starter/](https://www.tailwindresources.com/theme/texmeijin-vite-react-ts-tailwind-firebase-starter/)  
9. Appwrite vs Supabase vs Firebase: Choosing the Right Backend in 2025 | UI Bakery Blog, accessed December 22, 2025, [https://uibakery.io/blog/appwrite-vs-supabase-vs-firebase](https://uibakery.io/blog/appwrite-vs-supabase-vs-firebase)  
10. Supabase vs Firebase 2025 Guide for Mobile Apps \- Netclues Technologies, accessed December 22, 2025, [https://www.netclues.com/blog/supabase-vs-firebase-baas-comparison-guide](https://www.netclues.com/blog/supabase-vs-firebase-baas-comparison-guide)  
11. Use Supabase with React, accessed December 22, 2025, [https://supabase.com/docs/guides/getting-started/quickstarts/reactjs](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)  
12. Firebase vs Supabase in 2025: Which one actually scales with you? \- DEV Community, accessed December 22, 2025, [https://dev.to/dev\_tips/firebase-vs-supabase-in-2025-which-one-actually-scales-with-you-2374](https://dev.to/dev_tips/firebase-vs-supabase-in-2025-which-one-actually-scales-with-you-2374)  
13. Build a Supabase Project with React and TypeScript Tutorial \- Mobisoft Infotech, accessed December 22, 2025, [https://mobisoftinfotech.com/resources/blog/app-development/supabase-react-typescript-tutorial](https://mobisoftinfotech.com/resources/blog/app-development/supabase-react-typescript-tutorial)  
14. Pricing & Fees \- Supabase, accessed December 22, 2025, [https://supabase.com/pricing](https://supabase.com/pricing)  
15. About billing on Supabase, accessed December 22, 2025, [https://supabase.com/docs/guides/platform/billing-on-supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)  
16. Supabase Pricing 2025: Free, Pro & Enterprise Costs | MetaCTO, accessed December 22, 2025, [https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)  
17. Build a User Management App with React | Supabase Docs, accessed December 22, 2025, [https://supabase.com/docs/guides/getting-started/tutorials/with-react](https://supabase.com/docs/guides/getting-started/tutorials/with-react)  
18. Usage and limits | Firestore \- Firebase \- Google, accessed December 22, 2025, [https://firebase.google.com/docs/firestore/quotas](https://firebase.google.com/docs/firestore/quotas)  
19. \[Spark Plan\] What happens if my Firestore reads exceed 50k a day? : r/Firebase \- Reddit, accessed December 22, 2025, [https://www.reddit.com/r/Firebase/comments/1p26h27/spark\_plan\_what\_happens\_if\_my\_firestore\_reads/](https://www.reddit.com/r/Firebase/comments/1p26h27/spark_plan_what_happens_if_my_firestore_reads/)  
20. Firebase Pricing \- Google, accessed December 22, 2025, [https://firebase.google.com/pricing](https://firebase.google.com/pricing)  
21. The easiest way to use Google Sheets as a database \- Retool, accessed December 22, 2025, [https://retool.com/use-case/google-sheets-database](https://retool.com/use-case/google-sheets-database)  
22. Using Google Sheets as database \- codecentric AG, accessed December 22, 2025, [https://www.codecentric.de/en/knowledge-hub/blog/using-google-sheets-as-database](https://www.codecentric.de/en/knowledge-hub/blog/using-google-sheets-as-database)  
23. Write to a Google spreadsheet from JavaScript using the Public API access (no OAuth), accessed December 22, 2025, [https://stackoverflow.com/questions/29332794/write-to-a-google-spreadsheet-from-javascript-using-the-public-api-access-no-oa](https://stackoverflow.com/questions/29332794/write-to-a-google-spreadsheet-from-javascript-using-the-public-api-access-no-oa)  
24. Distribute Program with Sheets API Credentials \- Information Security Stack Exchange, accessed December 22, 2025, [https://security.stackexchange.com/questions/211572/distribute-program-with-sheets-api-credentials](https://security.stackexchange.com/questions/211572/distribute-program-with-sheets-api-credentials)  
25. How to use Google Forms without iframe? \- javascript \- Stack Overflow, accessed December 22, 2025, [https://stackoverflow.com/questions/40560853/how-to-use-google-forms-without-iframe](https://stackoverflow.com/questions/40560853/how-to-use-google-forms-without-iframe)  
26. Submit JSON vs Formspree: which should you choose in 2025?, accessed December 22, 2025, [https://www.submitjson.com/compare/submit-json-vs-formspree](https://www.submitjson.com/compare/submit-json-vs-formspree)  
27. Formspree vs FormBold – Best Form Backend for 2025, accessed December 22, 2025, [https://formbold.com/alternatives/formspree](https://formbold.com/alternatives/formspree)  
28. Limits \- SheetDB API documentation, accessed December 22, 2025, [https://docs.sheetdb.io/limits](https://docs.sheetdb.io/limits)  
29. Usage limits | Google Sheets, accessed December 22, 2025, [https://developers.google.com/workspace/sheets/api/limits](https://developers.google.com/workspace/sheets/api/limits)  
30. Pricing update to Appwrite's Free plan \- Changelog, accessed December 22, 2025, [https://appwrite.io/changelog/entry/2025-07-23](https://appwrite.io/changelog/entry/2025-07-23)  
31. Free plan will be limited to two projects per organization : r/appwrite \- Reddit, accessed December 22, 2025, [https://www.reddit.com/r/appwrite/comments/1m76awm/free\_plan\_will\_be\_limited\_to\_two\_projects\_per/](https://www.reddit.com/r/appwrite/comments/1m76awm/free_plan_will_be_limited_to_two_projects_per/)  
32. What is MongoDB Data API and How does it Work? \- GeoPITS, accessed December 22, 2025, [https://www.geopits.com/blog/mangodb-data-api](https://www.geopits.com/blog/mangodb-data-api)  
33. Atlas M0 (Free Cluster) Limits \- Atlas \- MongoDB Docs, accessed December 22, 2025, [https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)  
34. What is PCI DSS compliance? \- Stripe, accessed December 22, 2025, [https://stripe.com/guides/pci-compliance](https://stripe.com/guides/pci-compliance)  
35. Stripe Payment Links | Simple Links to Accept Payments, accessed December 22, 2025, [https://stripe.com/payments/payment-links](https://stripe.com/payments/payment-links)  
36. Build an advanced integration \- Stripe Documentation, accessed December 22, 2025, [https://docs.stripe.com/payments/quickstart](https://docs.stripe.com/payments/quickstart)