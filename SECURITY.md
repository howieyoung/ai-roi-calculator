# Security and Privacy

## Local data model

The calculator is designed to process company data locally:

- No backend is included.
- No telemetry or analytics is included.
- No user input is transmitted by the application.
- State is stored in browser `localStorage`.
- PDF export uses the browser's local print workflow. No report data is sent to
  a PDF service or application backend.

External links in scenario sources are opened only after user interaction.

## Sensitive data guidance

Even with local processing:

- Use an internally hosted copy for confidential data.
- Review browser extensions and device security.
- Clear site data after using a shared device.
- Treat exported PDF reports as confidential company material.
- Do not commit real internal scenarios to a public fork.

## Reporting a vulnerability

Please use GitHub's private security advisory workflow when available. Do not open a public issue for an undisclosed vulnerability involving data exposure or code execution.

Include:

- Affected file and version
- Reproduction steps
- Expected and observed behavior
- Potential impact
- Suggested remediation, if known
