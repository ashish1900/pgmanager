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

### 🔐 Owner Login via Mobile OTP

This screen appears when a user selects **PG Owner** on the welcome page.  
It allows PG owners to log in securely using their **mobile number and OTP**.

- The owner enters a registered mobile number.
- On clicking **Next**, the system checks whether the owner already exists.
- Existing owners are redirected to OTP verification.
- New owners are redirected to the registration flow.

This OTP-based login removes the need for passwords and provides a  
simple and secure authentication experience for PG owners.
<img width="1920" height="973" alt="Screenshot (777)" src="https://github.com/user-attachments/assets/4da1e763-ae4e-423c-87e5-e36d91fea950" />


📝 PG Owner Registration

This screen is displayed when a mobile number is not found during the owner login process.
It allows a new PG Owner to register their details in the system.

The mobile number is pre-filled from the login step.

The owner provides basic information such as full name, city, PG name, and address.

A document or image can be uploaded for initial verification.

On submitting the form, an OTP is sent to verify the registration.

This registration process ensures that PG owner details are collected
in a structured and digital format, replacing traditional paper-based records.
<img width="1920" height="1015" alt="Screenshot (778)" src="https://github.com/user-attachments/assets/a3ed6c63-5a6d-4cc4-91cf-098046bab2a5" />

