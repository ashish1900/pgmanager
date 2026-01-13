# PG Manager – Smart PG Management System

This project is built to replace traditional paper-based PG management.
It enables PG owners to digitally handle guest records, payments,
notices, and verification tasks in a simple and organized way.


The system handles owner and guest login, verification,
registration, dashboard access, guest management,
ID verification, notices, and payment workflows,
providing a clean, secure, and role-based experience.

##  Demo Login (Quick Project Review)

To make evaluation easy, demo credentials are provided directly
on the login pages.
https://ashish1900.github.io/pgmanager/
### Owner Demo Login
- Mobile: 9999999999
- OTP: 123456

### Guest Demo Login
- Mobile: 8888888888
- OTP: 123456

##  Features
###  Welcome Screen – Role-Based Entry

This is the initial landing page of the PG Manager application.
Users begin by selecting their role as **PG Owner** or **Guest**.

Based on the selected role, the system redirects users to
their respective login and dashboard flow, ensuring a
clear and role-based user experience from the beginning.
<img width="1920" height="1019" alt="Screenshot (775)" src="https://github.com/user-attachments/assets/8a06a98f-126a-4c76-b7d5-8ed1a167a50c" />


###  Owner Login via Mobile OTP

This screen appears when a user selects **PG Owner** on the welcome page.  
It allows PG owners to log in securely using their **mobile number and OTP**.

- The owner enters a registered mobile number.
- On clicking **Next**, the system checks whether the owner already exists.
- Existing owners are redirected to OTP verification.
- New owners are redirected to the registration flow.

simple and secure authentication experience for PG owners.
<img width="1920" height="973" alt="Screenshot (777)" src="https://github.com/user-attachments/assets/4da1e763-ae4e-423c-87e5-e36d91fea950" />




###  PG Owner Registration

This screen is displayed when a mobile number is not found during the owner login process.  
It allows a new **PG Owner** to register their details in the system.

<img width="1920" height="1019" alt="Screenshot (782)" src="https://github.com/user-attachments/assets/d6a6fc72-eef4-4af7-9b34-047da2b1ba82" />


- The mobile number is pre-filled from the login step.
- The owner provides basic information such as **full name, city, PG name, and address**.
- A document or image can be uploaded for initial verification.
- On submitting the form, an OTP is sent to verify the registration.

This registration process ensures that PG owner details are captured  
in a structured and digital format, replacing traditional paper-based records.
<img width="1920" height="1015" alt="Screenshot (778)" src="https://github.com/user-attachments/assets/a3ed6c63-5a6d-4cc4-91cf-098046bab2a5" />


##  Owner Dashboard (After OTP Verification)

After successful **Owner Registration and OTP Verification**, the PG Owner is automatically redirected to the **Owner Dashboard**.  
This dashboard acts as the **central control panel** for managing PG operations efficiently.


###  Owner Information Section
- Displays owner profile image
- Owner name and role (Owner)
- PG name and address
- Contact details (mobile number)

---

###  Dashboard Overview Cards
The dashboard provides quick insights through summary cards:

- **Active Guests** – Number of currently staying guests  
- **Total Guests** – Total registered guests  
- **Stay Requests** – Pending stay requests  
- **Checkout Requests** – Pending checkout approvals  
- **Monthly Payment** – Total rent collected for the selected month  
- **Payment Verification** – Pending payment verification requests  
- **Notices** – Active notices shared with guests  
- **Help & Support** – Support requests raised

---

###  Monthly Payment Trends
- Displays a monthly bar chart of rent collection
- Year-wise filter (e.g., 2026 by default)
- Helps track:
  - Monthly revenue
  - Payment consistency
  - Business performance

---

###  Sidebar Navigation
- My Profile (View and update Owner profile)
- Police Verification
- ID Verification (Aadhaar / PAN)
- Subscription
- Settings
- Help

---

### 🚪 Logout & Security
- Secure logout option
- Session/JWT-based authentication
- Unauthorized users cannot access the dashboard directly

