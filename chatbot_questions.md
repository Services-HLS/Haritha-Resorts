# 🤖 HMS AI Assistant: Questions & Answers Guide

This guide provides the official list of questions you can ask the HMS AI Assistant, organized by user role.

---

## 🔐 The Two Types of Logins
| Role | Example Email | Access Level |
| :--- | :--- | :--- |
| **Super Admin** | `admin@hms.gov.in` | Global Network & All Properties |
| **Resort User** | `araku@hms.gov.in` | **Strictly** their assigned Resort only |

---

## 📊 1. Super Admin Level (Global Data)
Admins log in and can ask for data aggregating **every** resort in the Haritha network, or mention a specific resort.

| Question | Bot Answer Pattern |
| :--- | :--- |
| "What is the global revenue?" | "Global Network Revenue of all-time is ₹X,XX,XXX." |
| "Total bookings across all resorts" | "There are XX total bookings across the entire network of all-time." |
| "Network summary" | "Network Summary: XX Resorts, XXX Rooms, XX Bookings, and ₹X,XX,XXX Revenue." |
| "Revenue for **Rushikonda**" | "The revenue for Rushikonda Beach Resort of all-time is ₹X,XX,XXX." |

---

## 🏨 2. Resort Level (Manager Data)
Resort users see only their own data. They don't need to specify their resort name, the bot knows who they are.

| Question | Bot Answer Pattern |
| :--- | :--- |
| "What is my revenue?" | "Your resort's revenue of all-time is ₹X,XX,XXX." |
| "How many bookings do I have?" | "You have XX total bookings of all-time." |
| "Are there any rooms under maintenance?"| "You currently have X rooms under maintenance/blocked." |
| "What is my room capacity?" | "Your property manages X rooms." |

---

## 📅 3. Date-Specific Queries (Both Roles)
You can override "All-time" data by adding dates to your questions.

| Question | Effect |
| :--- | :--- |
| "Revenue for **today**" | Filters data for the current date only. |
| "Bookings for **yesterday**" | Filters data for the previous day. |
| "Revenue between **2024-01-01** and **2024-03-31**" | Filters data for the specific date range. |

---

## 🚫 4. Access Denied (Security Examples)
The bot enforces strict isolation for Resort Users.

| Scenario | Result |
| :--- | :--- |
| **Araku User** asks: "Revenue for Rushikonda" | **Access Denied**: "You cannot see others' data. You only have access to view details for ARAKU VALLEY HARITHA." |
| **Rushikonda User** asks: "Global revenue" | **Access Denied**: "Only Administrators can access global network data." |

---

## 💡 Pro-Tip
If you don't mention a date, the bot automatically checks if you have a filter applied on your Dashboard. If no filter is active, it provides the **All-Time Total** for maximum accuracy.
