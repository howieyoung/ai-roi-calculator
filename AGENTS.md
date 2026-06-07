# Repository Instructions for Agents

Read [docs/AGENT_GUIDE.md](./docs/AGENT_GUIDE.md) before editing this project.

The calculator is local-first. Do not add network transmission of company
inputs, remote AI calls, or third-party PDF generation. The hosted site may use
disclosed delivery, support, and aggregate web analytics services, but do not
send calculator input values, scenario outputs, or custom field-level events to
those services.

Run before completion:

```bash
npm test
npm run check
```

Equation changes require matching tests and an update to `docs/MODEL.md`.
