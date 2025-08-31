# Salary Calculator

This project is a web-based tool for calculating salary rates in an emergency department. It computes a zone coefficient based on patient load and triage levels, then applies it to base hourly wages for any number of staff roles to produce final pay rates.

You can also enter shift length and total monthly hours to see estimated earnings per shift or per month.

## Run Locally

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.
3. Fill in the form to see calculated coefficients and final rates.

## Testing

Install dependencies and run the Jest test suite:

```bash
npm install
npm test
```

## Custom Roles

Role definitions are editable and persisted in your browser's `localStorage`. Use the **+ Pridėti rolę** button to add positions or remove existing ones. Base rate templates save and load values for all defined roles.

## CSV Export and Import

Downloading results as CSV will include a set of columns for every defined role:
`base_rate_<role>`, `final_rate_<role>`, `shift_salary_<role>` and
`month_salary_<role>`. The parser reconstructs the role list from these
columns, allowing data to round‑trip through the CSV format even as roles are added or removed.

## Adjusting Bonus Thresholds

The calculator allows customizing the occupancy (V) and acuity (A) bonus thresholds. Click **Redaguoti priedus** in the interface to open a modal where you can edit the `V_BONUS` and `A_BONUS` arrays in JSON form. Saved thresholds persist in your browser's `localStorage` under the key `ED_THRESHOLDS`.

## GitHub Pages

To deploy the calculator online using GitHub Pages:

1. Push the repository to GitHub.
2. On GitHub, open **Settings → Pages**. Under **Build and deployment**, choose *Deploy from a branch*, then select the `main` branch and the `/` (root) folder.
3. (Optional) The workflow in `.github/workflows/pages.yml` will publish the site automatically on each push to `main`.
4. Access the live page at `https://<your-github-username>.github.io/Salary-calculator/`.

Replace `<your-github-username>` with your GitHub username.
