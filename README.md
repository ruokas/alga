# Salary Calculator

This project is a web-based tool for calculating salary rates in an emergency department. It computes a zone coefficient based on patient load and triage levels, then applies it to base hourly wages for doctors, nurses and assistants to produce final pay rates.

## Run Locally

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.
3. Fill in the form to see calculated coefficients and final rates.

## GitHub Pages

To deploy the calculator online using GitHub Pages:

1. Push the repository to GitHub.
2. On GitHub, open **Settings → Pages**. Under **Build and deployment**, choose *Deploy from a branch*, then select the `main` branch and the `/` (root) folder.
3. (Optional) The workflow in `.github/workflows/pages.yml` will publish the site automatically on each push to `main`.
4. Access the live page at `https://<your-github-username>.github.io/Salary-calculator/`.

Replace `<your-github-username>` with your GitHub username.
