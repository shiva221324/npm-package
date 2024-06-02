import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import path from "path";

async function deployToGitHub() {
  const { token, repoName, repoDescription } = await inquirer.prompt([
    { type: "input", name: "token", message: "Enter your GitHub token:" },
    { type: "input", name: "repoName", message: "Enter the repository name:" },
    {
      type: "input",
      name: "repoDescription",
      message: "Enter the repository description:",
    },
  ]);

  const octokit = new Octokit({ auth: token });
  const git = simpleGit(path.resolve(process.cwd())); // Use current directory

  try {
    // Create a new repository on GitHub
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: repoDescription,
    });
    const repoUrl = response.data.clone_url;

    // Initialize a local git repository
    await git.init();
    await git.add(".");
    await git.commit("Initial commit");
    await git.addRemote("origin", repoUrl);
    await git.push("origin", "master");

    console.log(
      `Repository created and files deployed: ${response.data.html_url}`
    );
  } catch (error) {
    console.error("Error deploying to GitHub:", error);
  }
}

export { deployToGitHub };
