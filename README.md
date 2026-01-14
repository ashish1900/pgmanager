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
<img width="1920" height="1019" alt="Screenshot (782)" src="https://github.com/user-attachments/assets/8f35bf74-8947-4772-9da9-4c6a256b2433" />


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

###  Logout & Security
- Secure logout option
- Session/JWT-based authentication
- Unauthorized users cannot access the dashboard directly


##  Active Guests Management

From the **Owner Dashboard**, clicking on the **Active Guests** card redirects the owner to the **Active Guests page**.  
This page displays a detailed list of all guests who are currently staying in the PG.

---

<img width="1920" height="1010" alt="Screenshot (783)" src="https://github.com/user-attachments/assets/e0f54dcb-a9d0-4a83-bb43-ed1c51b4cd2b" />

---

###  Active Guests List Features
Each row in the table represents a guest and includes the following details:

- **Guest Photo** – Profile image of the guest  
- **Guest Name** – Full name with quick view option  
- **Stay Status** – Current stay status (Active)  
- **Joining Date** – Date and time when the guest joined the PG  
- **Month Cycle Indicator** – Visual indicator showing remaining days in the current billing cycle  
- **Payment History** – Button to view complete payment records of the guest  

---

### 📊 Payment Cycle Indicator
- Circular progress indicator shows:
  - Remaining days in the billing cycle
  - Late payments highlighted in red
- Helps owner quickly identify:
  - Guests nearing payment due date
  - Overdue payments

---

###  Filter & Quick Actions
- **All** – Shows all active guests  
- **Paid** – Filters guests with completed payments  
- **Due** – Filters guests with pending or overdue payments  

---



###  Use Case Benefits
- Quick overview of active residents
- Easy payment tracking per guest
- Reduced manual follow-ups
- Better financial control for PG owners

---

###  Guest Details View (See Button)
On the **Active Guests** page, clicking the **“See”** button opens a detailed **Guest Details modal**.  
This modal provides a complete overview of the selected guest without navigating away from the page.

<img width="1920" height="1024" alt="Screenshot (784)" src="https://github.com/user-attachments/assets/6a7a7cfc-baf5-4631-88fc-716604c33100" />







###  Guest-wise Payment History

This screen shows complete payment history of an individual guest in a clear and structured manner.



####  How it works:
- From **Active Guest List**, clicking on the **Payment History** button opens the guest-specific payment page.
- All payments are displayed **month-wise** with a defined **billing cycle**.

- <img width="1920" height="1016" alt="Screenshot (790)" src="https://github.com/user-attachments/assets/c9751928-c8cf-417a-b40f-27fabd512636" />

## Key Feature

####  Installment Handling :
- A guest can pay rent in **multiple installments within the same month**.
- Each installment is recorded separately with:
  - Paid Amount
  - Payment Date & Time
  - Verification Date
  - Payment Status
  - Uploaded Receipt
- The system automatically maintains the **total monthly rent** and tracks **partial vs completed payments**.

####  Smart Filters:
- Payments can be filtered by type:
  - Room Rent
  - Electricity Bill
  - Water Bill
  - Advance Money
  - Security Money
- This makes it easy for PG owners to quickly audit specific payment categories.

####  Verification & Transparency:
- Every payment includes a **receipt preview**.
- Once verified by the owner/admin, the status is updated to **Verified**.
- Ensures transparency and prevents payment disputes.

####  Guest Overview Panel:
- Displays guest profile photo
- Mobile number
- Stay status (Active)
- Joining date and time






### 👥 All Guests Overview
<img width="1920" height="1020" alt="Screenshot (791)" src="https://github.com/user-attachments/assets/8cf70e6d-be2c-4469-b2a8-e772f316638e" />

This screen provides a consolidated view of **all guests** in the PG, including **Active** and **Checked-out** guests.

#### Key Highlights:
- Displays total guests with quick filters:
  - Total Guests
  - Active Guests
  - Check-out Guests
- Shows real-time **stay status** (Active / Checked Out).
- Visual **month cycle indicator** highlights:
  - Remaining days for active guests
  - Late payment cycles for overdue guests
- Check-out request and acceptance timestamps are clearly visible.
- Each guest has quick access to **guest profile** and **payment history**.

This view helps PG owners efficiently track guest status, stay duration, and payment cycles from a single dashboard.

