# **Product Requirements Document (PRD)**

**Product Name:** AbsenV7

**Document Status:** Draft / Iteration 4

**Product Type:** Cross-Platform Mobile & Web Application (Mobile-first architecture, compiled for Android and Apple via frameworks like Capacitor/React Native).

## **1\. Product Vision & Objective**

**Vision:** To provide a unified, offline-capable, cross-platform mobile application that seamlessly combines daily employee attendance tracking, managerial oversight, and highly specialized mathematical/engineering utilities into a single workflow.

**Objective:** Equip field technicians, engineers, and office staff with a responsive tool accessible across all devices (Smartphones, Tablets, Desktops) to log attendance with strict time constraints, read announcements, and execute complex O\&G engineering formulas (e.g., API 1952, Waterdraw) on-site.

## **2\. System Architecture & Cross-Platform Strategy**

The application is built with a **Mobile-First Responsive Design**, ensuring UI/UX consistency across screen sizes. To fulfill the requirement of compiling into native Android and Apple (iOS) applications, the architecture will utilize hybrid mobile technologies (e.g., React.js/Vue.js wrapped in Ionic or Capacitor).

**Core Structure Navigation:**

* Absensi  
* Notifikasi  
* Managerial  
  * Manajemen Karyawan  
  * Analisa Kehadiran  
    * Harian  
    * Bulanan  
  * Pergerakan  
    * Pengumuman  
    * Tersampaikan  
* Toolbox  
  * General Calculator  
  * Unit Converter  
    * Length  
    * Volume  
    * Weight  
    * Flowrate  
    * Temperature  
    * Pressure  
    * Density  
  * Linear Interpolation  
  * Waterdraw Calculator  
    * Displacer Calculator  
    * Master Vs Bejana  
  * API (CTL CPL) 1952  
* Notepad  
* Tutup

## **3\. Detailed Component Specifications**

### **3.1. Absensi (Attendance Form)**

A strictly time-gated form for daily attendance logging. All fields are mandatory. Unfilled sections will be visually highlighted upon submission attempt. One device can submit multiple initials, but cannot submit the same initial more than once per day.

**Form Fields:**

* **Inisial \- Nama Lengkap:** Dropdown list dynamically populated from "Manajemen Karyawan".  
* **Lokasi Kerja:** Dropdown (Kantor Ciwastra, Kantor Tebet, Kantor Balikpapan, Ditmet Bandung, Tempat Tinggal, Lainnya). Selecting 'Lainnya' triggers a new long-text input box.  
* **Kondisi Kesehatan:** Radio buttons:  
  * ‘Sehat, dan tidak ada gejala’  
  * ‘Ada gejala, belum periksa tenaga medis’  
  * ‘Sakit, sudah periksa tenaga medis’  
* **Laporan pekerjaan hari sebelumnya:** Long Text input.  
* **Pekerjaan hari ini:** Long Text input.  
* **Agenda besok:** Long Text input.  
* **Saran dan/atau Laporan:** Long Text input.

**Time-Gated Logic & Database Submission (with Timestamp):**

* **\< 05:00 AM:** Submission blocked. Shows popup: *"Belum waktunya absen 🤨, tunggu setelah jam 05:00 sampai 10:00"*. Data is NOT sent to the database.  
* **05:00 AM – 10:00 AM:** Normal submission (status: 'ontime'). Shows popup: *"Berhasil Absen. Jangan Lupa untuk Absen hari berikutnya ☺️"*. Data sent to database.  
* **10:01 AM – 5:00 PM:** Late submission (status: 'late'). Shows popup: *"Telat absen hari ini 🤨"*. Data is marked as "Telat" and is SUCCESSFULLY sent to the database.  
* **\> 5:00 PM:** Invalid submission (status: 'invalid'). Attendance record is rejected and NOT saved to database.

### **3.2. Notifikasi**

* Receives announcements generated from the managerial "Pengumuman" module.  
* **First-time Access:** Prompts the user to enter their name upon first click.  
* **Acknowledge Feature:** Users must acknowledge/read notifications. Once read, the read status syncs to the "Tersampaikan" tracking module.

### **3.3. Managerial**

Protected managerial suite. Accessing this module requires a hardcoded PIN/Password: **7777**.

#### **3.3.1. Manajemen Karyawan**

Database-synced employee registry with CRUD (Create, Read, Update, Delete) capabilities.

* **Inisial \- Nama Lengkap:** Linked directly to the Absensi dropdown.  
* **Kontak Darurat:** Captures Nama, Status (Relationship), and No. HP.  
* **MCU Terakhir (Medical Check-Up):** Date picker. Includes an automated alarm/warning if the selected MCU date is 11 months old.  
* **Safety Certificate:** Supports multiple certificates per individual. Users can manually determine/input the expiration period for each certificate.

#### **3.3.2. Analisa Kehadiran**

* **Harian (Daily):** \* Displays two distinct sections: Employees who *have* submitted attendance, and employees who *have not*.  
* Employee data is displayed on cards showing only "Inisial – Nama Lengkap". Clicking the card expands to show the full Absensi form data submitted by that person.  
* **Color-Coded Flashing Indicators:**  
* Flashing Green: 'Sehat, dan tidak ada gejala'  
* Flashing Orange: 'Ada gejala, belum periksa tenaga medis'  
* Flashing Red: 'Sakit, sudah periksa tenaga medis'  
* Flashing Purple: Marked as “Telat” (\> 10:00 AM submission).  
* **Bulanan (Monthly):** \* Calculates monthly attendance performance per employee (Monday-Friday only).  
* Cards display: "Inisial – Nama Lengkap", "Telat \=  
* $$x$$  
* hari", "Tidak Absen \=  
* $$x$$  
* hari". Clicking the card reveals specific dates missed or late.  
* **Custom Holiday Management:** Users can define custom holidays (single-day or multi-day) synced across all devices via Firebase Realtime Database. Holidays are excluded from monthly attendance calculations.

#### **3.3.3. Pergerakan**

* **Pengumuman:** Interface for managers to compose and broadcast announcements to all devices (appears in "Notifikasi").  
* **Tersampaikan:** Read-receipt list showing exactly which employees have acknowledged the notifications.

### **3.4. Toolbox (Engineering & Math Assistant)**

A suite of specialized Oil & Gas (O\&G) and engineering calculators.

#### **3.4.1. General Calculator**

Full-featured scientific calculator with standard operators, memory, and a history log.

#### **3.4.2. Unit Converter**

Real-time conversion for Length, Volume, Weight, Flowrate, Temperature, Pressure, and Density.

*Constraint:* Must include O\&G industry-specific units (e.g., standard "Barrel Petroleum" equivalent to 42 US gallons).

#### **3.4.3. Linear Interpolation**

Tool to find unknown values between two known data points (for tank charts/engineering tables).

*Inputs:* X1, Y1, X2, Y2. *Target:* Unknown X or Y.

#### **3.4.4. Waterdraw Calculator**

**A. Displacer Calculator (Prover's Displacer Size)**

* **Inputs:**  
* Nominal Diameter (Number, toggle: inch/mm)  
* Wall Thickness (Number, toggle: inch/mm)  
* Inside Diameter (Auto-calculated: Nominal Diameter in mm \- (Wall Thickness in mm \* 2))  
* Value (Number, toggle: mm or %)  
* **Outputs:**  
* If Value is in mm: Output \= ((Value/pi) / Inside Diameter) \* 100  
* If Value is in %: Output \= (Value/100) \* Inside Diameter

**B. Master Vs Bejana**

* **Section 1: Specification (Inputs):**  
* *Master Meter:* K-Factor (pulse/liter)  
* *Bejana:* Nominal Volume (liter), Corrected Nominal (liter), Main Scale (mL), Corrected Scale (mL), Thermal Coefficient (/°C).  
* **Section 2: Field Data (Calibration Runs):** Exactly 5 fixed rows capturing: Pulse, Pressure (psi), Reading (mL), Temperature (°C).  
* **Core Formulas (Auto-calculates on change):**  
1. CPL \= 1 / (1 \- (0.0000032 \* Pressure))  
2. CTL \= 1 \+ Thermal\_Coefficient \* (Temperature \- 15.6) (Fallback to 1 if Thermal Coeff is empty).  
3. Master Volume \= (Pulse / K-Factor) \* CPL (Fallback to 0 if K-factor is missing/0).  
4. Real Volume Bejana \= Reading Volume \+ (Corrected Nominal \* CTL) *where Reading Volume \= (Reading \* (Corrected Scale / Main Scale)) / 1000*  
5. Meter Factor (MF) \= Real Volume Bejana / Master Volume (Calculates only if row \+ Sec 1 inputs are complete).  
* **Results Panel:** Triggers when at least 2 valid MF values exist.  
* Max & Min MF identification.  
* Repeatability \= (Max MF \- Min MF) \* 100  
* Largest Difference Indicator (e.g., *"Between Run 2 (max) and Run 4 (min)"*).

#### **3.4.5. API (CTL CPL) 1952**

Strict historical API MPMS calculation for Correction for Temperature (CTL) and Pressure (CPL) on Liquid.

* **Inputs:** Table selection (54 or 6), API Gravity @60°F or Density @15°C, Temperature (°F/°C), Pressure (psi), Equilibrium Pressure, API 11.2.1 Rounding toggle.  
* **Outputs & Formulas:**  
* **CPL** \= 1 / (1 \- (0.0000032 \* Pressure))  
* **CTL (Table 54):** \* CTL \= exp(-alpha \* (T \- 15\) \* (1 \+ 0.8 \* alpha \* (T \- 15)))  
* alpha \= (K0 \+ (K1 \* Density15)) / (Density15^2)  
* *Constants:* LPG (K0=1144.3, K1=0.0), Gasoline (K0=346.4228, K1=0.4388), Jet/Kerosene (K0=594.5418, K1=0.0), Diesel (K0=186.9696, K1=0.4862), Lube Oils (K0=0.0, K1=0.6278).  
* **VCF/CTL (Table 6):**  
* If specific gravity (SG) is provided instead of API Gravity: API Gravity \= (141.5 / SG) \- 131.5  
* VCF \= 1 / (1 \+ (Alpha \* (T \- 60)) \+ (0.8 \* Alpha^2 \* (T \- 60)^2))  
* Alpha \= (K0 / (Rho^2)) \+ (K1 / Rho) *(Rho \= Density at 60°F)*

### **3.5. Notepad**

A general text editor stored in Firebase Realtime Database with cross-device sync. Notes can be created, edited, and deleted. Export functionality exports notes as CSV files.

### **3.6. Tutup**

A global "Quit" or exit button to safely close the application interface.

## **4\. UI/UX Design & Styling Guidelines**

The application must follow a **Minimalistic, Clean, and Professional** design language, ensuring high legibility for field workers under harsh lighting, while providing a modern app experience.

### **4.1. Visual Theme**

* **Palette:** Neutral base colors (whites, off-whites, and deep grays for dark mode) to reduce eye strain. Use a strong, trustworthy primary color (e.g., Deep Azure Blue or Teal) for primary actions and active states.  
* **Typography:** Clean, highly legible sans-serif fonts (e.g., Inter, Roboto, or system defaults like San Francisco). Ensure large enough touch targets (minimum 44x44pt) and readable font sizes for mobile devices.  
* **Cards & Layout:** Use card-based layouts with subtle borders or very soft drop shadows (box-shadow: 0 4px 6px rgba(0,0,0,0.05)) to separate content logically without clutter. Fully rounded corners (e.g., border-radius: 12px or 16px) for a friendly, modern feel.

### **4.2. Subtle Animations & Micro-Interactions**

Animations should be purposeful and not delay the user's workflow.

* **Page Transitions:** Gentle fade-ins and subtle slide-ups when navigating between core modules.  
* **Button States:** Active states (when pressed) should have a slight scale-down effect (e.g., transform: scale(0.97)) and opacity change to provide tactile feedback.  
* **Form Validations:** Unfilled mandatory sections should draw attention with a soft "shake" animation and a smooth transition to a highlighted border color.  
* **Card Expansions:** Expanding cards (e.g., in Analisa Kehadiran) must slide down smoothly (accordion effect) rather than snapping open.  
* **Status Indicators (Managerial):** As specified in Section 3.3.2, use smooth pulsing/flashing animations for the color-coded attendance cards (Green, Orange, Red, Purple) to draw managerial attention quickly without being visually aggressive.

## **5\. AI IDE Development Guidelines (System Prompts)**

*When using an AI-assisted IDE, inject the following prompt into the AI's system instructions or .rules file to ensure high-quality, maintainable output.*

