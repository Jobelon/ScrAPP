# ScrAPP verification

Verified with TypeScript, Vite production build, and agent-browser against the local app.

| Flow | Result |
| --- | --- |
| Desktop welcome and demo entry | Rendered successfully |
| Marketplace at desktop and 390 × 844 mobile size | Rendered; no horizontal overflow |
| Item details | Opened with seller, quantity, description, and actions |
| Delivery checkout | Demo order placed at ₱180 + ₱75 delivery = ₱255 |
| Order tracking | Confirmed order appeared in Orders |
| Completion | Status changed to Completed and rating controls appeared |
| Selling | Image upload → listing preview → publication passed |
| Published listing | Appeared in My listings and Explore; marketplace count changed from 6 to 7 |
| Chat | Sent message and received simulated seller reply |
| Student role | Selling navigation and listing management hidden |
| Company role | Selling navigation visible; buyer actions absent on other sellers' items |
| Browser errors | None reported |
| Logo transparency | PNG corner alpha verified as 0 |

Mobile scroll clearance was added so form controls can scroll above fixed bottom navigation. Temporary browser test activity was reset after verification.

Authentication, Google sign-in, email verification, payment, delivery, and seller replies are simulations. There is no backend or production identity verification. Data is local to the browser. Material photos are generated and stored locally; fonts use an online resource with system fallbacks.
