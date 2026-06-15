# ระบบคำร้องขอจบการศึกษา (Graduation Request System)

## 📋 Project Overview

This is a comprehensive graduation request tracking and approval system for a Thai university (SSKRU). It enables students to submit graduation requests and manages multi-department approval workflows including advisors, registrars, library, language centers, and student activities departments.

**ภาษาไทย:** ระบบนี้เป็นแพลตฟอร์มสำหรับการยื่นคำร้องขอจบการศึกษา ระบบจะติดตามสถานะการตรวจสอบจากหลายส่วนงาน เช่น ที่ปรึกษา ทะเบียน ห้องสมุด ศูนย์ภาษา และฝ่ายกิจกรรม

---

## 🏗️ Architecture Overview

The system uses a **full-stack JavaScript architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  (my-app/) - Vite + React Router + MUI Components      │
├─────────────────────────────────────────────────────────┤
│                   HTTP/REST APIs                        │
├─────────────────────────────────────────────────────────┤
│                   BACKEND (Express.js)                  │
│  (backend/) - Sequelize ORM + SQLite Database          │
└─────────────────────────────────────────────────────────┘
```

### **Frontend (React + Vite)**
- Location: `/my-app`
- UI Framework: Material-UI (MUI) v7.3.5
- Styling: Tailwind CSS + Emotion + Styled Components
- Routing: React Router v7.10.0
- Animation: Framer Motion
- HTTP Client: Axios

### **Backend (Express.js + Node.js)**
- Location: `/backend`
- Database: SQLite (database.sqlite)
- ORM: Sequelize
- Authentication: PBKDF2 password hashing
- File Upload: Multer
- Middleware: CORS, Morgan logging

---

## 🎯 Key Features

### **1. Multi-Role User System**
- **Admin** - System administrator, user management
- **Student** - Submits graduation requests, uploads documents
- **Advisor** - Approves academic/grade checks
- **Office** - Department staff approving specific workflow steps

### **2. Multi-Department Workflow**
The approval process includes these sequential steps:

| Step | Department | English Name |
|------|-----------|--------------|
| file_check | ฝ่ายทะเบียน | File Verification |
| tuition_check | ฝ่ายทะเบียน | Tuition Payment Check |
| grade_check | ที่ปรึกษา | Grade Check |
| internship_fee_check | ฝ่ายทะเบียน | Internship Fee Check |
| library_check | ฝ่ายวิทยบริการและเทคโนโลยี | Library Check |
| digital_exam_check | ฝ่ายวิทยบริการและเทคโนโลยี | Digital Exam Check |
| language_center | ฝ่ายศูนย์ภาษา | Language Center |
| activity_general_check | ฝ่ายกิจกรรม | General Activities |
| activity_faculty_check | ฝ่ายกิจกรรม | Faculty Activities |

### **3. Request Status Management**
- **Pending** - Request not yet submitted
- **In Progress** - At least one step approved/in-progress
- **Completed** - All steps approved
- **Rejected** - Any step rejected by reviewer

### **4. Document Management**
- Students upload required documents (PDF, JPG, PNG)
- Max file size: 5MB
- Document types: general, internship_receipt
- File stored in `/backend/uploads/` with UUID naming

### **5. Notification & Audit System**
- Automated notifications for rejections and completions
- Complete audit logs tracking who performed what action
- Supports real-time status updates

---

## 💻 Technology Stack

### **Frontend**
```
React 19.2.0
React Router DOM 7.10.0
Material-UI (MUI) 7.3.5
Tailwind CSS 4.1.16
Styled Components 6.1.19
Framer Motion 12.23.25
Axios 1.13.3
Vite 7.1.7
```

### **Backend**
```
Express.js (CommonJS)
Sequelize 6.x
SQLite3
Node.js 18+ (ES6)
Multer 1.x (file upload)
CORS, Morgan, dotenv
Crypto (PBKDF2 hashing)
```

---

## 📁 Project Structure

```
fproject/
├── README.md
├── backend/
│   ├── server.js                 # Express app with all routes & models
│   ├── database.sqlite           # SQLite database
│   ├── fix.js                    # Utility script (untracked)
│   ├── uploads/                  # Uploaded documents
│   ├── node_modules/
│   └── package.json
│
└── my-app/
    ├── src/
    │   ├── main.jsx              # React entry point
    │   ├── App.jsx               # Main app router & layout
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Layout.jsx
    │   │   └── FormMessageDialog.jsx
    │   ├── pages/
    │   │   ├── Login.jsx         # Authentication page
    │   │   ├── Profile.jsx       # User profile view
    │   │   ├── Editprofile.jsx   # Edit profile
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx     # User management
    │   │   │   ├── Adminfrom.jsx          # User creation form
    │   │   │   ├── AdvisorForm.jsx
    │   │   │   └── StudentForm.jsx
    │   │   ├── student/
    │   │   │   └── Dashboard.jsx          # Student request management
    │   │   ├── advisor/
    │   │   │   ├── AdvisorDashboard.jsx   # Advisor review list
    │   │   │   └── AdvisorDetail.jsx      # Review single request
    │   │   └── office/
    │   │       ├── OfficeDashboard.jsx    # Office staff view
    │   │       ├── OfficeDetail.jsx       # Approve/review request
    │   │       ├── OfficeRegistration.jsx # Registration dept
    │   │       ├── OfficeLanguage.jsx     # Language center dept
    │   │       ├── OfficeLibrary.jsx      # Library/IT dept
    │   │       └── OfficeEventh.jsx       # Activities dept
    │   ├── services/
    │   │   └── api.js            # Axios API client
    │   └── App.css / index.css
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    └── node_modules/
```

---

## 🗄️ Database Schema

### **User Model**
```javascript
{
  id: String (Primary Key) // e.g., "S1101", "A1101", "admin"
  name: String             // Full name
  email: String (Unique)   // e.g., "s1101@sskru.ac.th"
  password: String         // PBKDF2 hashed
  role: ENUM ['Admin', 'Advisor', 'Office', 'Student']
  faculty: String          // Faculty name (for Advisor/Student)
  branch: String           // Branch/Program name
  deptName: String         // Department (for Office staff)
  phone: String
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### **GraduationRequest Model**
```javascript
{
  id: UUID (Primary Key)
  studentId: String (Foreign Key → User.id)
  academicYear: String     // e.g., "2569" (Buddhist Era)
  semester: String         // "1" or "2"
  status: ENUM ['Pending', 'In Progress', 'Completed', 'Rejected']
  steps: JSON {
    file_check: { status, comment, updatedAt }
    tuition_check: { status, comment, updatedAt }
    grade_check: { status, comment, updatedAt }
    internship_fee_check: { status, comment, updatedAt }
    library_check: { status, comment, updatedAt }
    activity_general_check: { status, comment, updatedAt }
    activity_faculty_check: { status, comment, updatedAt }
    digital_exam_check: { status, comment, updatedAt }
    language_center: { status, comment, updatedAt }
    advisor: { status, comment, updatedAt }
    registration: { status, comment, updatedAt } // Computed alias
    activity_center: { status, comment, updatedAt } // Computed alias
  }
  documents: JSON []       // Array of uploaded documents
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### **Notification Model**
```javascript
{
  id: UUID
  userId: String (Foreign Key)
  message: String          // Thai notification text
  type: String             // e.g., 'GENERAL', 'REJECTED', 'COMPLETED', 'REVIEW_ASSIGNED'
  isRead: Boolean          // default: false
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### **AuditLog Model**
```javascript
{
  id: UUID
  userId: String           // Who performed the action
  action: String           // e.g., 'UPDATE_STEP_STATUS', 'UPLOAD_DOCUMENT', 'SUBMIT_REQUEST_FOR_REVIEW'
  requestId: String        // Graduation request ID
  details: TEXT            // Additional context
  createdAt: Timestamp
}
```

---

## 🔑 User Roles & Permissions

### **Admin**
- Create/read/update/delete users
- Can update any step in graduation requests
- View all requests and audit logs

### **Student**
- Can only view/manage own graduation requests
- Submit request for review
- Upload required documents
- Receive notifications for rejections/completions

### **Advisor**
- Can only update `grade_check` and `advisor` steps
- View requests from students in same faculty+branch
- Leave comments when approving/rejecting

### **Office Staff**
- Can only update steps assigned to their department
  - **ฝ่ายทะเบียน (Registration):** file_check, tuition_check, grade_check, internship_fee_check
  - **ฝ่ายวิทยบริการและเทคโนโลยี (IT/Library):** library_check, digital_exam_check
  - **ฝ่ายศูนย์ภาษา (Language Center):** language_center
  - **ฝ่ายกิจกรรม (Activities):** activity_general_check, activity_faculty_check
- View requests from students in their assigned faculty/branch

---

## 📡 API Endpoints

### **Authentication**
```
POST /api/login
  Request: { email, password }
  Response: { id, name, email, role, faculty, branch, deptName, phone }
```

### **Users Management**
```
GET  /api/users
POST /api/users
PUT  /api/users/:id
DELETE /api/users/:id
```

### **Graduation Requests**
```
GET    /api/requests?userId=X&step=Y&submittedOnly=true
GET    /api/requests/:id?userId=X
POST   /api/requests
POST   /api/requests/:id/submit        # Student submits for review
PATCH  /api/requests/:id/step          # Office/Advisor updates step
POST   /api/requests/:id/documents     # Upload document
```

### **Notifications**
```
GET   /api/notifications/:userId
PATCH /api/notifications/:id/read
```

### **Master Data**
```
GET /api/master-data
  Response: { faculties: [], departments: [] }
```

---

## 🎮 Frontend Routes (React Router)

| Route | Page | Role |
|-------|------|------|
| `/` | Login | All |
| `/admin` | AdminDashboard | Admin |
| `/adminfrom` | AdminForm | Admin |
| `/profile` | Profile | All |
| `/profile/edit` | EditProfile | All |
| `/student` | StudentDashboard | Student |
| `/advisor` | AdvisorDashboard | Advisor |
| `/advisor/:id` | AdvisorDetail | Advisor |
| `/office` | OfficeDashboard | Office |
| `/office/registration` | OfficeRegistration | Office (Registrar) |
| `/office/library` | OfficeLibrary | Office (IT/Library) |
| `/office/language` | OfficeLanguage | Office (Language Center) |
| `/office/eventh` | OfficeEventh | Office (Activities) |
| `/office/information` | OfficeInformation | Office (IT/Library) |
| `/office/:id` | OfficeDetail | Office |

---

## 🛠️ Setup & Installation

### **Prerequisites**
- Node.js 18+ with npm/yarn
- Git

### **Backend Setup**
```bash
cd backend
npm install
# Create .env file (if needed for ALLOWED_ORIGINS)
npm start
# Server runs on http://localhost:3001
```

### **Frontend Setup**
```bash
cd my-app
npm install
npm run dev
# Development server runs on http://localhost:5173 (or assigned port)
```

### **Build for Production**
```bash
# Frontend
cd my-app
npm run build       # Creates dist/

# Backend is production-ready (just run npm start)
```

---

## 👤 Test Credentials

### **Admin Account**
- Email: `admin@sskru.ac.th`
- Password: `admin1234`
- ID: `admin`

### **Advisor Sample**
- Email: `A1101@sskru.ac.th`
- Password: `a1234`
- ID: `A1101`
- Faculty: คณะครุศาสตร์และการพัฒนามนุษย์
- Branch: การประถมศึกษา

### **Student Sample**
- Email: `S1101@sskru.ac.th`
- Password: `s1234`
- ID: `S1101`
- Faculty: คณะครุศาสตร์และการพัฒนามนุษย์
- Branch: การประถมศึกษา

### **Office Staff Sample**
- Email: `office_ฝ่ายทะเบียน@sskru.ac.th`
- Password: `office1234`
- Department: ฝ่ายทะเบียน (Registration)

---

## 🔐 Security Features

✅ **Password Hashing:** PBKDF2 with 120,000 iterations + SHA-512  
✅ **Timing-Safe Comparison:** Prevents timing attacks on password verification  
✅ **File Upload Validation:** Whitelist MIME types (PDF, JPG, PNG), max 5MB  
✅ **CORS Protection:** Configurable allowed origins  
✅ **Authorization Checks:** Role-based access control on all endpoints  
✅ **Audit Logging:** All user actions logged for compliance  
✅ **Input Sanitization:** Payload filtering on sensitive endpoints  

---

## ✨ Recently Completed Features (Phase 1)

### **1. Progress Timeline Component** (✅ COMPLETED)
Visual workflow progression indicator that shows students and reviewers exactly where a graduation request is in the approval process.

**Features:**
- 📋 Vertical timeline displaying all 9 workflow steps
- 🎨 Color-coded status indicators:
  - ⏳ **Waiting** (Amber #FACC15)
  - 🔄 **In Progress** (Blue #3b82f6)
  - ✅ **Approved** (Green #16a34a)
  - ❌ **Rejected** (Red #dc2626)
- 💬 Hover tooltips showing comments and timestamps
- 📊 Summary statistics at the bottom
- 🎭 Two layout variants: "vertical" (detailed) and "compact" (dashboard preview)

**Implementation:**
- **New Component:** `/my-app/src/components/ProgressTimeline.jsx`
- **New Constants:** `/my-app/src/constants/stepConfig.js` - Step labels, colors, status mappings
- **Updated Pages:**
  - `AdvisorDetail.jsx` - Shows timeline when reviewing requests
  - `OfficeDetail.jsx` - Shows timeline with department-specific steps

**Where to See It:**
1. Open Advisor Dashboard → Click on any request → See visual timeline
2. Open Office Dashboard → Click on any request → See filtered timeline based on department

**Usage in Code:**
```jsx
import ProgressTimeline from '../../components/ProgressTimeline';

<ProgressTimeline
  steps={[
    { key: 'file_check', status: 'approved', comment: 'Files verified', updatedAt: '2024-06-14...' },
    { key: 'grade_check', status: 'in_progress', comment: '', updatedAt: null },
    // ... more steps
  ]}
  variant="vertical"
/>
```

**Benefits:**
- ✅ Students know exactly where their request is
- ✅ Advisors/Office staff see clear workflow progression
- ✅ Reduces confusion about which step is pending
- ✅ Shows rejection reasons and timestamps inline
- ✅ Identifies bottlenecks in the approval process

---

### **2. Enhanced Student Request History** (✅ COMPLETED - Phase 2A)
Detailed request view for students showing complete workflow progress with document history.

**Features:**
- 📈 **Detailed Request Modal** - Click "View Details" to see:
  - Full ProgressTimeline component (same as Advisor/Office view)
  - Complete document upload history with dates
  - Organized by document type (general & internship)
  - Download links for all uploaded files
  - Request info sidebar with academic details
  
- 📊 **Improved History Table**:
  - Added Academic Year and Semester columns
  - Cleaner layout with better organization
  - Enhanced filter support

**Implementation:**
- **New Component:** `/my-app/src/components/StudentRequestDetailModal.jsx` - Detail modal with timeline

**Where to See It:**
1. Student Dashboard → "ประวัติการยื่นคำร้อง" section
2. Click "ดูรายละเอียด" (View Details) → Opens modal with full timeline and documents

---

### **3. Smart Search & Filter System** (✅ COMPLETED - Phase 2B)
Reusable search and filter component for request dashboards.

**Features:**
- 🔍 **Search:** Student name or ID (case-insensitive)
- 🎯 **Filter:** Status, academic year, semester
- ⚡ **Sort:** Newest/oldest first
- 🏷️ **Active filters** display with easy clearing

**Implementation:**
- **New Component:** `/my-app/src/components/RequestSearchBar.jsx` - Reusable search/filter bar
- **Updated:** `StudentDashboard.jsx` - Integrated search bar with history table

**Where to See It:**
1. Student Dashboard → History section shows search bar above table
2. Type name or ID to search
3. Use dropdowns to filter by status/year/semester

---

### **Phase 1 + Phase 2 Implementation** ✅ COMPLETED
**New Files Created (Phase 1 + 2):**
- `/my-app/src/components/ProgressTimeline.jsx` - Timeline component (209 lines)
- `/my-app/src/constants/stepConfig.js` - Shared constants (89 lines)
- `/my-app/src/components/StudentRequestDetailModal.jsx` - Detail modal (370 lines)
- `/my-app/src/components/RequestSearchBar.jsx` - Search/filter component (260 lines)

**Modified Files:**
- `/my-app/src/pages/advisor/AdvisorDetail.jsx` - Uses ProgressTimeline
- `/my-app/src/pages/office/OfficeDetail.jsx` - Uses ProgressTimeline
- `/my-app/src/pages/student/Dashboard.jsx` - Integrated modal + search bar
- `/README.md` - Updated with feature documentation

### **Previously Modified (Not yet committed)**
- `/backend/server.js` - Main application logic
- `/my-app/src/pages/office/OfficeEventh.jsx`
- `/my-app/src/pages/office/OfficeInformation.jsx`
- `/my-app/src/pages/office/OfficeLanguage.jsx`
- `/my-app/src/pages/office/OfficeLibrary.jsx`
- `/my-app/src/pages/office/OfficeRegistration.jsx`

### **Untracked Files**
- `/backend/fix.js` - Temporary utility (can be removed)
- `/backend/uploads/*` - User-uploaded documents

---

## 🚀 Next Steps & Development Plan

### **Phase 1 (COMPLETED ✅)**
- [x] **Progress Timeline Component** - Visual workflow progression indicator
- [x] Integration with AdvisorDetail and OfficeDetail pages
- [x] Color-coded status system and Thai labels

### **Phase 2 (COMPLETED ✅)** - Enhanced History & Search/Filter
- [x] **Student Request Detail Modal** - Detailed view with timeline + documents
- [x] **Search & Filter Component** - Reusable for all dashboards
- [x] Integrated into StudentDashboard with history table
- [x] Support for filtering by status, year, semester
- **Time:** 5.5 hours

### **Phase 3 - Real-time Notifications**
- [ ] Implement notification center UI
- [ ] Real-time updates when steps change
- [ ] Email integration for notifications
- **Estimated:** 4-5 hours

### **Phase 4 - Batch Operations**
- [ ] Allow office staff to bulk update statuses
- [ ] Batch approve/reject multiple requests
- **Estimated:** 3-4 hours

### **Phase 5 - Enhanced Features**
- [ ] Comment/discussion thread system
- [ ] PDF certificate generation
- [ ] Mobile responsive improvements
- [ ] Dark mode support
- [ ] Export data to Excel/CSV
- **Estimated:** 6-8 hours

---

## 📝 Development Guidelines

### **Code Style**
- Frontend: React Hooks + Functional Components
- Backend: CommonJS modules
- Both: ES6+ syntax

### **File Naming**
- React components: PascalCase (e.g., `Dashboard.jsx`)
- Routes: lowercase with hyphens (e.g., `/admin-dashboard`)
- Utilities: camelCase (e.g., `formatDate.js`)

### **Best Practices**
- Use MUI components for UI consistency
- Leverage Sequelize ORM for database operations
- Implement error boundaries in React
- Log important actions in AuditLog
- Validate all user inputs server-side

---

## 📞 Support & Troubleshooting

### **Common Issues**

**Q: CORS errors when calling backend?**
- A: Add your frontend URL to `ALLOWED_ORIGINS` environment variable in `.env`
  ```
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
  ```

**Q: Database locked error?**
- A: SQLite issues with concurrent access. Consider migrating to PostgreSQL/MySQL for production.

**Q: Files not uploading?**
- A: Check `/backend/uploads/` directory exists and is writable. Verify file size < 5MB.

**Q: Users can't login?**
- A: Run `npm start` in backend to seed default test users. Check database exists at `/backend/database.sqlite`.

---

## 📄 License

ISC License - See package.json

---

## 👥 Authors & Contributors

- Initial Development: Antigravity AI
- University: Suan Sunandha Rajabhat University (SSKRU)

---

## 📅 Last Updated

June 14, 2026

---

**Ready to deploy? Start with testing all workflows and then create a comprehensive commit!** 🚀
