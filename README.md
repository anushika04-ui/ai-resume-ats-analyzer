# Resume ATS Analyzer

A beginner-friendly full-stack project that analyzes resume text (or a PDF resume) and optionally compares it with a Job Description to show:
- ATS-style score
- Resume level (Fresher / Entry-Level)
- Matched & missing keywords (based on JD)

## Features
- Paste resume text and get an ATS score
- Paste job description for keyword matching
- Upload a resume PDF (extracts text and fills the resume textbox)
- Clean UI with one-click Analyze & Clear
- Works without MongoDB (no database required)

## Tech Stack
- Frontend: React, Axios
- Backend: Node.js, Express
- PDF Text Extraction: Multer + pdf-parse

## Project Structure
