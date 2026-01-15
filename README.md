# PG Manager – Smart PG Management System

This project is built to replace traditional paper-based PG management.
It enables PG owners to digitally handle guest records, payments,
notices, and verification tasks in a simple and organized way.


The system handles owner and guest login, verification,
registration, dashboard access, guest management,
ID verification, notices, and payment workflows,
providing a clean, secure, and role-based experience.

-------

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
----
##  Features
## 1.  Welcome Screen – Role-Based Entry

This is the initial landing page of the PG Manager application.
Users begin by selecting their role as **PG Owner** or **Guest**. Based on the selected role, the system redirects users to their respective login and dashboard flow, ensuring a clear and role-based user experience from the beginning.

<img width="1920" height="1019" alt="Screenshot (775)" src="https://github.com/user-attachments/assets/8a06a98f-126a-4c76-b7d5-8ed1a167a50c" />

--- 
<br>

## 2. Owner Login via Mobile OTP

This screen appears when a user selects **PG Owner** on the welcome page. It allows PG owners to log in securely using their **mobile number and OTP**.

<img width="1920" height="973" alt="Screenshot (777)" src="https://github.com/user-attachments/assets/4da1e763-ae4e-423c-87e5-e36d91fea950" />

- The owner enters a registered mobile number.
- On clicking **Next**, the system checks whether the owner already exists.
- Existing owners are redirected to OTP verification.
- New owners are redirected to the registration flow.

simple and secure authentication experience for PG owners.

----
<br>

## 3. PG Owner Registration

This screen is displayed when a mobile number is not found during the owner login process. It allows a new **PG Owner** to register their details in the system. <br>

<img width="1920" height="1015" alt="Screenshot (778)" src="https://github.com/user-attachments/assets/a3ed6c63-5a6d-4cc4-91cf-098046bab2a5" />


- The mobile number is pre-filled from the login step.
- The owner provides basic information such as **full name, city, PG name, and address**.
- A document or image can be uploaded for initial verification.
- On submitting the form, an OTP is sent to verify the registration.

This registration process ensures that PG owner details are captured in a structured and digital format, replacing traditional paper-based records.

----

<br>

##  4. Owner Dashboard (After OTP Verification)

After successful **Owner Registration and OTP Verification**, the PG Owner is automatically redirected to the **Owner Dashboard**. This dashboard acts as the **central control panel** for managing PG operations efficiently.

<img width="1920" height="1019" alt="Screenshot (782)" src="https://github.com/user-attachments/assets/8f35bf74-8947-4772-9da9-4c6a256b2433" />

###  Owner Information Section

This section is displayed at the top of the **Owner Dashboard** and provides a quick summary of the logged-in PG owner. It helps clearly identify the owner and the associated PG at a glance.

- **Profile Image** – Displays the owner’s profile picture for easy identification.
- **Owner Name & Role** – Shows the owner’s full name along with the role as **PG Owner**.
- **PG Name & Address** – Displays the registered PG name and complete address.
- **Contact Details** – Shows the registered mobile number used for login and communication.

<br>


###  Sidebar Navigation
- My Profile (View and update Owner profile)
- Police Verification
- ID Verification (Aadhaar / PAN)
- Subscription
- Settings
- Help

---


###  Monthly Payment Trends
- Displays a monthly bar chart of rent collection
- Year-wise filter (e.g., 2026 by default)
- Helps track:
  - Monthly revenue
  - Payment consistency
  - Business performance

---

###  Logout & Security
- Secure logout option
- Session/JWT-based authentication
- Unauthorized users cannot access the dashboard directly
  
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








###  Guest Stay Requests & Verification

Before joining the PG, a **guest first submits a stay request** through the system.
This screen allows the **PG owner/admin to review and approve those requests**.
<img width="1920" height="1013" alt="Screenshot (793)" src="https://github.com/user-attachments/assets/1ea59ab1-8671-4152-a52c-c58308e840e4" />

#### How it works:
- A guest submits a **stay request** along with basic details and ID proof.
- From the **Dashboard**, clicking on the **Stay Request** card opens this pending requests page.
- Each request displays:
  - Guest name and mobile number
  - Temporary and permanent address
  - Request date and time

####  Verification & Approval Flow:

<img width="1920" height="1017" alt="Screenshot (794)" src="https://github.com/user-attachments/assets/81fa27ab-a19c-43ee-bc60-17fdcd5133a3" />

- Clicking **View & Verify** opens a verification modal.
- The owner/admin reviews the uploaded **government ID proof**.
- Based on verification:
  - **Accept & Verify** → Guest is approved and moved to the **Active Guest list**.
  - **ID Mismatch** → Request is rejected to prevent unauthorized stays.

####  Security & Onboarding Control:
- Guests cannot directly join the PG without approval.
- Ensures only **verified guests** are allowed to stay.
- Provides full control to the PG owner over guest onboarding and security.








### 🚪 Guest Check-out Requests

When a guest decides to **leave the PG**, they send a **check-out request** from their side.
This screen allows the **PG owner to review, verify, and approve those requests**.
<img width="1920" height="1004" alt="Screenshot (797)" src="https://github.com/user-attachments/assets/5db11b15-feb7-4d29-b31c-0b863476e236" />

#### How it works:
- A guest submits a **check-out (leave) request**.
- From the **Dashboard**, clicking on the **Check-out Requests** card opens this page.
- Each request displays:
  - Guest name and profile photo
  - Check-out request date and time
  - Original joining date

#### 🔍 View Guest Details:
- The owner can click the **See** button to view **complete guest details**, including:
  - Room and stay information
  - ID and verification details
  - Personal and contact information
- This helps the owner review all necessary details before approval.

#### ✅ Approval Flow:
- After reviewing the details, the owner clicks **Accept**.
- Once accepted:
  - Guest status is updated to **Checked Out**
  - Guest is removed from the active guest list
  - All records remain available for future reference and payment history

#### 🔐 Control & Record Management:
- Ensures guests cannot leave without owner acknowledgment.
- Maintains accurate occupancy, stay duration, and exit records.
- Provides full control to the PG owner during the check-out process.






###  Owner Payment Dashboard & Analytics

This screen provides a **complete payment overview** for the PG owner.
It opens when the owner clicks on the **Payment** card from the dashboard.

<img width="1920" height="1022" alt="Screenshot (798)" src="https://github.com/user-attachments/assets/bd3c9a02-05f9-496f-9794-1b6c7009ed51" />


#### Key Highlights:
- Displays **current month’s total collection** for each payment type:
  - Room Rent
  - Advance
  - Electricity
  - Water
  - Security
- Each payment type is shown as a quick summary card for instant insights.

####  Yearly Payment Trends:
- Shows a **month-wise graph** for the selected year.
- Helps the owner analyze **total collection trends across the entire year**.
- Useful for understanding seasonal patterns and revenue flow.

####  Interactive Payment Filters:
- The owner can click on any payment type (Room Rent, Advance, etc.).
- The graph dynamically updates to show data **only for the selected payment category**.
- Makes it easy to review and compare different types of income.

####  Owner Benefits:
- Quick visibility of monthly and yearly collections.
- Better financial planning and tracking.
- Centralized view of all PG-related payments in one place.









###  Room Rent Payment History & UPI / QR Management

This screen opens when the owner clicks on **Room Rent** from the payment dashboard.
It provides complete control over **room rent payments, verification, and UPI management**.

<img width="1920" height="1022" alt="Screenshot (799)" src="https://github.com/user-attachments/assets/84aba0dd-e514-4bb5-923a-80a332bd36a5" />



####  UPI ID & QR Code Management:
- Displays the **currently active UPI ID and QR code** for room rent payments.
- The owner can **update the UPI ID or QR code directly from this page**.
- Each payment type (Room Rent, Electricity, Water, Advance, Security) can have a **separate UPI ID / QR code**.
- This enables **payment-type-wise tracking and settlement**.

####  Room Rent Payment History Table:
- Lists all room rent payments submitted by guests.
- Each entry includes:
  - Guest name (with **See** button to view full guest details)
  - Amount paid
  - Payment date and time
  - Verification date
  - Payment status (Verified / Rejected)
  - Uploaded receipt for verification

####  Filters & Status Tabs:
- Quick filters are available:
  - **All Payments**
  - **Verified Payments**
  - **Rejected Payments**
- Helps the owner quickly review specific payment statuses.

####  Verification Workflow:
- The owner verifies payments by reviewing the uploaded receipt.
- Based on verification, payments are marked as **Verified** or **Rejected**.
- All records are preserved for auditing and reference.

####  Other Payment Types:
- **Electricity, Water, Advance, and Security** payment screens follow the **same structure and workflow**.
- Each payment type has:
  - Its own UPI / QR code
  - Dedicated payment history
  - Independent verification and filtering

####  Owner Benefits:
- Centralized and organized payment management
- Flexible UPI/QR configuration per payment category
- Clear visibility and control over all guest payments








###  Payment Verification (Owner Panel)

This screen opens when the owner clicks on **Payment Verification** from the dashboard.
It allows the owner to **review, verify, or reject payments** submitted by guests.

<img width="1920" height="1011" alt="Screenshot (800)" src="https://github.com/user-attachments/assets/b61900ad-4ff7-4e1a-947a-cdfe096ac17e" />


#### How it works:
- Guests make payments using the provided **UPI / QR code**.
- After payment, guests upload the **payment receipt**.
- These payments appear here with **PENDING** status.

####  Pending Payments List:
- Displays all unverified payments with:
  - Guest name (with **See** button to view full guest details)
  - Payment type (Room Rent, Advance, etc.)
  - Amount paid
  - Payment date and time
  - Current status (Pending)

####  Receipt Verification:
- Clicking **View & Verify** opens the uploaded receipt in a modal.
- The owner can carefully match:
  - Amount
  - Payment type
  - Date and transaction details
<img width="1920" height="1029" alt="Screenshot (801)" src="https://github.com/user-attachments/assets/05da2513-43f6-427a-926f-8b9f5c4e7011" />

####  Verification Actions:
- **Verify** → Marks the payment as verified and updates all related records.
- **Reject** → Rejects the payment in case of mismatch or invalid receipt.
- Status changes are reflected instantly across payment history and dashboards.

####  Security & Transparency:
- Prevents fake or duplicate payment entries.
- Ensures only verified payments are counted in revenue and analytics.
- Maintains a clear audit trail for every transaction.




### 📢 Notices & Announcements

This screen opens when the owner clicks on the **Notice** card from the dashboard.
It allows the PG owner to **send important notices and announcements to all guests** from a single place.
<img width="1920" height="1022" alt="Screenshot (802)" src="https://github.com/user-attachments/assets/22a86181-6e24-4408-9bff-7d0b5dc29e1d" />

#### How it works:
- The owner can write a notice in the text area and click **Add Notice**.
- The notice is instantly visible to all guests.
- Each notice is saved with its **date and time** for reference.

####  Notice Management:
- The owner can:
  - **Add** new notices
  - **Update** existing notices
  - **Delete** outdated or incorrect notices
- Helps keep communication clear and up to date.

####  Owner & Guest Benefits:
- Centralized communication for the entire PG
- No need for WhatsApp or manual messages
- Guests always stay informed about important updates







###  Guest Dashboard
<img width="1920" height="1033" alt="Screenshot (804)" src="https://github.com/user-attachments/assets/957b93e7-899a-4699-bba9-26d529975256" />

This dashboard opens when a user starts the application from the **Welcome / Home page**
by selecting the **“As a Guest”** option and successfully completes **registration or login**.
(The welcome page provides separate entry options for **Guest** and **Owner**.)

This is the **main control panel for guests**, giving them full visibility over their stay,
payments, and communication with the PG owner.

####  Guest Profile Section:
- Displays guest profile photo and name.
- Options to:
  - **See More** → View complete guest details
  - **Update Profile** → Update personal information
- Shows assigned PG name and location.
- **See Owner** button allows guests to view PG owner details.

####  Room Details:
- Displays assigned room information:
  - Room number
  - Floor number
  - Building number
  - Room address
- Helps guests clearly understand their accommodation allocation.

####  Action Cards:


- **Request to Join PG**  
  - Guests can send a **stay request** to the PG owner.
  - Joining is possible only after owner approval.
<img width="1920" height="1020" alt="Screenshot (808)" src="https://github.com/user-attachments/assets/3bb24187-51af-4488-9ec6-e401af689780" />

This flow starts when a guest clicks on **“Request to Join PG”** from the **Guest Dashboard**.
It helps guests find a suitable PG and securely send a stay request to the owner.

#### Step-by-Step Flow:

#### 1 Select City
- Guest clicks on **Select City**.
- After choosing a city, all available PGs in that city are listed.
- Each PG card shows:
  - PG name
  - Address
  - Owner name
<img width="1920" height="1033" alt="Screenshot (806)" src="https://github.com/user-attachments/assets/c2ddfa67-c50d-4cf8-81e5-5a67005b61fb" />

#### 2 Choose PG & Send Request
- Guest selects the PG where they want to stay.
- On clicking **Send Request**, the system asks the guest to complete **ID verification** before proceeding.

#### 3 ID Upload & Address Verification
<img width="1920" height="1028" alt="Screenshot (807)" src="https://github.com/user-attachments/assets/c4e54733-589b-4cf4-92d3-7a628ccbc91a" />

- Guest must:
  - Select **ID type** (Aadhaar, PAN, Driving License, Voter ID, Passport, etc.)
  - Upload **front and back images** of the ID
  - Enter **temporary address**
- This ensures security and proper verification before joining the PG.

#### 4 Request Submission
- After submitting ID details, the **stay request is sent to the PG owner**.
- The request status is shown as **PENDING**.

#### 5 Pending Approval State
<img width="1920" height="1019" alt="Screenshot (811)" src="https://github.com/user-attachments/assets/5e559ff0-fe0f-4094-bd05-d5cc5b07edf1" />

- Until the owner reviews and accepts the request:
  - The request remains in **Pending** status
  - Guest can view uploaded ID details
  - Guest can also **cancel the request** if needed

#### 6 Owner Approval
<img width="1920" height="1022" alt="Screenshot (812)" src="https://github.com/user-attachments/assets/ede79b16-173f-460c-bd98-1e7c177773c9" />

- Once the owner **accepts the request**, the guest is officially allowed to join the PG.
- The guest then appears in the owner’s active guest list.

####  Security & Transparency:
- Guests cannot join any PG directly without owner approval.
- Mandatory ID verification ensures safety and compliance.
- Both guest and owner can track the request status at every step.







- **Make Payment**  

This screen opens when a guest clicks on **Make Payment** from the **Guest Dashboard**.
It allows guests to easily submit payments and upload receipts for owner verification.
<img width="1920" height="1026" alt="Screenshot (813)" src="https://github.com/user-attachments/assets/624c740c-361e-421b-92a2-1253def650f6" />

#### How it works:
- Guest selects the **payment type** (Room Rent, Advance, Electricity, etc.).
- The system displays the **owner’s UPI ID and QR code** for the selected payment type.
- Guest enters the **payment amount** and uploads the **payment screenshot/receipt**.
- Clicking **Upload & Submit** sends the payment for owner verification.

#### Key Features:
- Supports multiple payment types.
- Payment is securely linked to the selected PG.
- All submitted payments remain **Pending** until verified by the owner.
- Guests can view verification status later from **Payment History**.

#### Transparency & Control:
- Prevents payment confusion by showing correct UPI/QR per payment type.
- Ensures every payment is recorded with proof.



###  Payment History (Guest Side)

This screen opens when a guest clicks on **Payment History** from the **Guest Dashboard**.
It shows a complete record of all payments made by the guest across PGs.
<img width="1920" height="1024" alt="Screenshot (814)" src="https://github.com/user-attachments/assets/7281e5be-818e-4a7f-8551-8e860abf50b3" />

#### Key Details Displayed:
- PG name for which the payment was made
- Payment type (Room Rent, Advance Money, Electricity, Water, Security)
- Amount paid
- Payment date and time
- Verification date
- Current payment status:
  - **Pending** – waiting for owner verification
  - **Verified** – approved by the owner

####  Smart Filters:
- Guests can filter payment records by type:
  - All
  - Room Rent
  - Advance Money
  - Electricity Bill
  - Water Bill
  - Security Money
- Helps guests quickly find specific payments.

####  Receipt Access:
- Each payment includes a **View** button to see the uploaded receipt.
- Ensures transparency and proof of payment.

####  Guest Benefits:
- Clear visibility of payment status
- Easy tracking of verified and pending payments
- No confusion regarding dues or completed payments





###  My Stay History (Guest Side)

This screen opens when a guest clicks on **My Stay History** from the **Guest Dashboard**.
It provides a clear **timeline view of the guest’s stay** in a PG.
<img width="1914" height="1020" alt="Screenshot 2026-01-15 123637" src="https://github.com/user-attachments/assets/6923b127-c600-42d7-a689-36cb1c0d5ab8" />

#### What it shows:
- PG name and city
- Owner details and contact number
- Current stay status (Active / Checked Out)
- **Check-in date and time**
- **Check-out request date** (if initiated)
- **Check-out approval date** (after owner confirmation)

####  ID & Verification Details:
- Displays the **ID type** submitted during the join request
- Shows uploaded **ID proof images** for reference

####  Guest Benefits:
- Transparent record of the entire stay lifecycle
- Easy tracking of check-in and check-out status
- Quick access to verification details at any time






### 🚪 Send Check-out Request (Guest Side)

This screen opens when a guest clicks on **Send Check-out Request** from the **Guest Dashboard**.
It allows guests to formally request leaving the PG.
<img width="1919" height="1021" alt="Screenshot 2026-01-15 124241" src="https://github.com/user-attachments/assets/b9344141-c1aa-4708-82d9-fc5d879cde34" />


#### How it works:
- Guest clicks on **Send Leave Request**.
- A check-out request is sent to the PG owner.
- Until the owner reviews and accepts the request:
  - The request remains in **Pending** state
  - The guest continues to appear as an active guest

#### Approval Flow:
- The owner reviews the request from their dashboard.
- Once approved:
  - Guest status is updated to **Checked Out**
  - The stay timeline is updated in **My Stay History**

#### 🎯 Guest Benefits:
- Simple and transparent check-out process
- No manual coordination required
- Clear visibility of request and approval status


- **Help & Support**  
  - Provides assistance or support-related information.

####  Recent Notices:
- Displays the latest notices posted by the PG owner.
- Keeps guests informed about important updates such as maintenance, timings, or rules.




## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Java, Spring Boot (REST API)
- Database: MySQL
- Authentication: OTP based login
- Deployment: GitHub Pages (Frontend), Railway / Docker (Backend)


## 🔮 Future Enhancements

- Mobile app (Android / iOS)
- Online payment gateway integration
- Admin panel for multi-PG management
- Subscription plans for PG owners
- Police verification API integration


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


