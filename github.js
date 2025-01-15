import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

async function deployToGitHub() {
  const { token, repoName, repoDescription, deployPath } =
    await inquirer.prompt([
      {
        type: "input",
        name: "token",
        message: "Enter your GitHub token:",
        default: "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",
      },
      {
        type: "input",
        name: "repoName",
        message: "Enter the repository name:",
      },
      {
        type: "input",
        name: "repoDescription",
        message: "Enter the repository description:",
      },
      {
        type: "input",
        name: "deployPath",
        message: "Enter the path where you want to deploy:",
        default: process.cwd(), // Default to current working directory
      },
    ]);

  const octokit = new Octokit({ auth: token });
  const git = simpleGit(deployPath);

  try {
    // Install gh-pages
    await execPromise("npm install gh-pages --save-dev", { cwd: deployPath });

    // Create a new repository on GitHub
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: repoDescription,
    });
    const repoUrl = response.data.clone_url;

    // Initialize a local git repository
    await git.init();
    await writeReadmeFile(deployPath, repoName, repoDescription);

    // Modify package.json to include necessary scripts and dependencies
    await updatePackageJson(deployPath, response.data.owner.login, repoName);

    await git.add(".");
    await git.commit("Initial commit");

    const remotes = await git.getRemotes(true);
    const hasOrigin = remotes.some((remote) => remote.name === "origin");

    if (hasOrigin) {
      await git.remote(["set-url", "origin", repoUrl]);
    } else {
      await git.addRemote("origin", repoUrl);
    }
    await git.push("origin", "master");

    // Enable GitHub Pages
    await octokit.repos.update({
      owner: response.data.owner.login,
      repo: repoName,
      name: repoName,
      description: repoDescription,
      homepage: `https://${response.data.owner.login}.github.io/${repoName}`,
    });

    // Deploy to GitHub Pages
    await execPromise("npm run deploy", { cwd: deployPath });

    console.log(
      `Repository created, GitHub Pages enabled, and files deployed: ${response.data.html_url}`
    );
  } catch (error) {
    console.error("Error deploying to GitHub:", error);
  }
}

async function writeReadmeFile(deployPath, repoName, repoDescription) {
  const readmeContent = `# ${repoName}\n\n${repoDescription}`;
  await fs.writeFile(path.join(deployPath, "README.md"), readmeContent);
}

async function updatePackageJson(deployPath, username, repoName) {
  const packageJsonPath = path.join(deployPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Add homepage field
  packageJson.homepage = `https://${username}.github.io/${repoName}`;

  // Add predeploy and deploy scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.predeploy = "npm run build";
  packageJson.scripts.deploy = "gh-pages -d build";

  // Add gh-pages as a dev dependency

  // Write modified package.json back to file
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

export { deployToGitHub };
