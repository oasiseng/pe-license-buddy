# **PE License Buddy**

> **An open-source tool to track PE licenses, firm registrations, and continuing education requirements with reminders, automation, and intelligent client responses.**

---

## **Overview**
PE License Buddy helps engineering firms **simplify compliance management** by centralizing license and registration data, automating renewal reminders, and providing a dashboard for tracking continuing education (CEU) requirements.

This project is designed to:
- Manage PE licenses across multiple states.
- Track firm registrations and renewal deadlines.
- Automate expiration notifications via Slack, email, or Trello.
- Provide structured data for AI-driven client responses.
- Be **open source and fork-friendly** for other engineering firms.

---

## **Features**
- **License Tracking:** Store individual PE licenses and firm registrations in one place.
- **Automated Reminders:** Get alerts for upcoming renewals or CEU deadlines.
- **Training & CEU Tracking:** Record completed CEUs vs. required totals by state.
- **Client Response API:** Generate verified, consistent license verification replies.
- **Airtable/CSV Backend:** Simple, portable data model to start quickly.
- **Future Proof:** Pluggable architecture for SQL or API integrations.

---

## **Tech Stack**
| Layer        | Technology Options |
|--------------|-------------------|
| **Frontend** | React, Next.js |
| **Backend**  | Node.js/Express (or Supabase/Firebase MVP) |
| **Database** | Airtable or CSV (initial) |
| **Notifications** | Slack, Email, Trello via webhooks/Zapier |
| **Hosting** | GitHub Pages or Vercel |

---

## **Getting Started**

### **1. Clone the Repository**
```bash
git clone https://github.com/your-org/pe-license-buddy.git
cd pe-license-buddy

```
### 2. Install Dependencies
If using Node.js:
```bash
npm install

### 3. Set Up Environment Variables
Create a .env file in the root folder:

ini
AIRTABLE_API_KEY=your_api_key
SLACK_WEBHOOK_URL=your_webhook_url
Note: Never commit .env files to the repo.
.env is already included in .gitignore.
```
### 4. Data Model
Start with either:

schemas/licenses.csv for CSV-based tracking
schemas/airtable.md for Airtable setup

Sample fields:

<img width="490" height="296" alt="image" src="https://github.com/user-attachments/assets/d68bfe8a-04d0-4aa7-8d90-eed69bf92069" />

### Folder Structure
```bash
pe-license-buddy/
│
├── .github/               # Issues, PR templates, GitHub Actions
│   └── workflows/
│
├── docs/                  # Project documentation
│
├── schemas/               # Data schemas
│   ├── licenses.csv
│   └── airtable.md
│
├── templates/             # Prebuilt response templates
│   ├── responses.md
│   └── reminders.md
│
├── src/                    # Application source code
│   ├── api/                # REST API endpoints
│   ├── dashboard/          # Frontend UI components
│   └── reminders/          # Reminder engine
│
└── tests/                  # Unit and integration tests
```
## Roadmap
 License dashboard MVP
 Airtable & CSV integrations
 Automated Slack/email reminders
 CEU tracking module
 REST API for external integrations
 GitHub Pages demo site
 AI-powered client verification agent

## Contributing
We welcome contributions!
Please read CONTRIBUTING.md for:
Code style guide
PR workflow
Issue reporting guidelines

## License
This project is licensed under the MIT License.
See the LICENSE file for details.

## Contact
Project Lead: Enrique Lairet, PE
Website: OasisEngineering.com
Support Email: info@oasisengineering.com
