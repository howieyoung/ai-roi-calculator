# Security and Privacy

## Local data model

The calculator is designed to process company data locally:

- No application backend or account system is included.
- Model calculations run in the browser, and company scenario inputs are not
  intentionally transmitted by the calculator.
- State is stored in browser `localStorage`.
- PDF export uses the browser's local print workflow. No report data is sent to
  a PDF service or application backend.
- The hosted `all4.ai` deployment is delivered through Cloudflare Pages and
  loads the Protico frame service for product guidance and user support.
- The hosted site uses Google Analytics to understand whether the site meets
  visitor needs. The application must not send calculator input values,
  scenario outputs, or custom field-level events to Google Analytics.
- These services may receive standard browser request metadata and content a
  user chooses to share through them.

External links in scenario sources are opened only after user interaction.

## Sensitive data guidance

Even with local processing:

- Use an internally hosted copy for confidential data.
- Remove or block the Protico frame and Google Analytics scripts for fully
  offline or highly confidential internal use.
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
