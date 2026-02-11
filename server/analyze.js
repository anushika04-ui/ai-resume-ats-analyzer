const express = require("express");
const router = express.Router();

/* ==============================
   KEYWORDS & CONSTANTS
================================ */
const TECH_SKILLS = [
  "javascript", "react", "node", "node.js", "express", "mongodb", "mysql",
  "html", "css", "python", "java", "c", "c++", "sql", "aws"
];

const SOFT_SKILLS = [
  "communication", "teamwork", "leadership", "problem solving", "time management"
];

const DEGREE_KEYWORDS = [
  "b.tech", "btech", "be", "b.e", "mca", "mba", "diploma", "bachelor", "master"
];

const ACTION_VERBS = [
  "developed", "built", "designed", "implemented", "optimized",
  "created", "managed", "improved", "analyzed"
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ==============================
   ANALYZE ROUTE (NO DB)
================================ */
router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: "resumeText required"
      });
    }

    const text = resumeText.toLowerCase();
    const lines = resumeText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    /* -------- EDUCATION -------- */
    const education = { degrees: [], institutions: [] };
    DEGREE_KEYWORDS.forEach(deg => {
      if (new RegExp(`\\b${escapeRegex(deg)}\\b`, "i").test(text)) {
        education.degrees.push(deg);
      }
    });

    /* -------- SKILLS -------- */
    const skills = { technical: [], soft: [] };
    TECH_SKILLS.forEach(skill => {
      if (new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(text)) {
        skills.technical.push(skill);
      }
    });
    SOFT_SKILLS.forEach(skill => {
      if (new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(text)) {
        skills.soft.push(skill);
      }
    });

    /* -------- EXPERIENCE -------- */
    const experience = [];
    const roleKeywords = [
      "intern", "developer", "engineer", "analyst",
      "software", "frontend", "backend", "full stack"
    ];

    lines.forEach(line => {
      if (
        roleKeywords.some(k => line.toLowerCase().includes(k)) &&
        line.toLowerCase().includes(" at ")
      ) {
        const parts = line.split(/ at /i);
        experience.push({
          role: parts[0] || "Unknown",
          company: parts[1] || "Unknown"
        });
      }
    });

    /* -------- PROJECTS -------- */
    const projects = [];
    lines.forEach(line => {
      const techUsed = TECH_SKILLS.filter(skill =>
        new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(line)
      );
      if (techUsed.length > 0 && line.length > 8) {
        projects.push({
          title: line,
          techStack: [...new Set(techUsed)]
        });
      }
    });

    /* -------- SCORING -------- */
    let formatScore = 0;
    if (text.includes("education")) formatScore += 10;
    if (text.includes("skills")) formatScore += 10;
    if (resumeText.match(/•|-|\*/g)) formatScore += 10;
    if (formatScore > 30) formatScore = 30;

    let impactScore = 0;
    ACTION_VERBS.forEach(v => {
      if (text.includes(v)) impactScore += 3;
    });
    if (impactScore > 30) impactScore = 30;

    let contentScore = 0;
    if (education.degrees.length > 0) contentScore += 15;
    contentScore += skills.technical.length * 3;
    if (contentScore > 40) contentScore = 40;

    const finalAtsScore = Math.round(contentScore + formatScore + impactScore);

    let resumeLevel = "Fresher";
    if (experience.length >= 1) resumeLevel = "Entry-Level";

    /* -------- JD MATCH -------- */
    const jdText = (jobDescription || "").toLowerCase();

    const jdSkills = TECH_SKILLS.filter(skill =>
      new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(jdText)
    );

    const matchedSkills = jdSkills.filter(skill =>
      skills.technical.includes(skill)
    );

    const missingSkills = jdSkills.filter(skill =>
      !skills.technical.includes(skill)
    );

    const jdMatchPercentage = jdSkills.length
      ? Math.round((matchedSkills.length / jdSkills.length) * 100)
      : 0;

    /* -------- RESPONSE -------- */
    return res.json({
      success: true,
      summary: {
        finalAtsScore,
        resumeLevel,
        formatScore,
        impactScore,
        contentScore
      },
      extractedData: {
        education,
        skills,
        experience,
        projects
      },
      jdAnalysis: {
        jdMatchPercentage,
        matchedSkills,
        missingSkills
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Analysis failed"
    });
  }
});

module.exports = router;
