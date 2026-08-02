# Submission Form Answers

Replace every bracketed value before submitting.

1. **Full Name:** Anower Hossain
2. **Email Address:** [YOUR EMAIL]
3. **Phone / WhatsApp Number:** [YOUR PHONE]
4. **GitHub Repository URL:** [GITHUB REPOSITORY URL]
5. **Live Application URL (Optional):** [LIVE URL OR N/A]
6. **Demo Video URL:** [LOOM / YOUTUBE / DRIVE URL]
7. **Frontend framework:** React.js with Vite
8. **Database Used:** SQLite
9. **Bonus Features Implemented:** JWT authentication; recruiter/candidate role-based authorization; job ownership protection; duplicate-application database constraint; optional cover letters; applicant counts; candidate pipeline with five statuses; responsive dashboard; demo seed command; automated API tests.
10. **Architecture Overview:** React single-page frontend communicates with a Django REST Framework API using JSON and JWT authentication. The backend separates models, serializers, role permissions, and views. Relational SQLite models represent users, recruiter-owned jobs, and candidate applications. Querysets are scoped by role and ownership, while database constraints protect application integrity.
11. **Most Challenging Part:** Designing a single clear API for two roles while preventing cross-account access. I solved this with role permission classes, ownership-filtered querysets, explicit object checks, and automated permission tests. I also enforced one application per candidate and job at both API and database levels.
12. **Question:** [THE FORM DOES NOT SHOW THE QUESTION TEXT — ENTER N/A IF IT IS ONLY A PLACEHOLDER]
13. **Declaration:** I confirm this submission is my own work and I can explain all implementation details during the interview.

