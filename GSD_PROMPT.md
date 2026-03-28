# GSD PROMPT — Copy and paste this exactly

---

## PROMPT TO PASTE INTO GSD (Section 0 first):

```
You are building a production-ready web tools site called aawebtools.com.

Before writing any code, read ALL of these files completely:
- PRD.md (full product requirements — 13 sections)
- DESIGN.md (visual design specifications — exact values only)
- STACK.md (technology constraints — locked, no deviations)
- TODO.md (build tracker — check off each item as you complete it)
- .env.example (all environment variables you need to reference)

Rules:
1. Build ONLY Section 0 from PRD.md in this session
2. Follow DESIGN.md and STACK.md exactly — no creative interpretation
3. Do not proceed to Section 1 until I confirm Section 0 is complete
4. After completing Section 0, update CHANGELOG.md with what you built
5. Check off completed items in TODO.md
6. If anything in the PRD is unclear, ask before assuming

Start by confirming you have read all 5 files, then build Section 0.
Report every file you create or modify when done.
```

---

## PROMPT FOR SUBSEQUENT SECTIONS:

After you confirm Section N is working in Docker, paste this for Section N+1:

```
Section [N] is confirmed working in Docker.
Please read PRD.md Section [N+1] and build it now.
Follow all rules from DESIGN.md and STACK.md.
Update CHANGELOG.md and TODO.md when done.
Report every file created or modified.
```

---

## IMPORTANT NOTES

- Always test in Docker locally before moving to next section
- If GSD deviates from DESIGN.md or STACK.md, correct it immediately
- Never skip a section — each one depends on the previous
- The PRD is the authority — if GSD and PRD conflict, PRD wins
