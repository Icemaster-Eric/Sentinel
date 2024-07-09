const repositoryInput = document.getElementById("repository-input");
const ghTokenInput = document.getElementById("github-token");
const resultsElem = document.getElementById("results");
const errorMsgElem = document.getElementById("error");

let repoLink = null;
let ghToken = localStorage.getItem("gh-token");
let repoUsername = null;
let repo = null;
// automatically sets gh token if it is stored already
if (ghToken) ghTokenInput.value = ghToken;
repositoryInput.addEventListener("input", () => {
  repoLink = repositoryInput.value.trim();
  let commitInfo = /^(?:https:\/\/)?github\.com\/([\w\-]+)\/([\w\-]+)/
    .exec(repoLink)
    ?.slice?.(1);
  if (!commitInfo) {
    [repoUsername, repo] = [null, null];
    showError(
      "Repository URL has invalid format. It must follow the format https://github.com/USERNAME/REPOSITORY"
    );
    return;
  }
  [repoUsername, repo] = commitInfo;
  tryStart();
});
ghTokenInput.addEventListener("input", () => {
  ghToken = ghTokenInput.value.trim();
  localStorage.setItem("input", ghToken);
  tryStart();
});
const ghHeaders = new Headers();
ghHeaders.append("Accept", "application/vnd.github+json");
ghHeaders.append("X-GitHub-Api-Version", "2022-11-28");
function tryStart() {
  // don't start unless theres both a repo link and a token
  if (!(repoUsername && repo && repoLink && ghToken)) {
    showError("Both the GitHub token and the repository link must be present and valid.");
	return;
  }
  ghHeaders.set("Authorization", "Bearer " + ghToken);
  getRepositoryCommits();
}

async function getRepositoryCommits() {
	// we most likely only need 100 commits to catch someone
  const response = await fetch(
    `https://api.github.com/repos/${repoUsername}/${repo}/commits?per_page=100`,
    {
      headers: ghHeaders,
    }
  );
  if (!response.ok) {
    showError(
      "Could not access GitHub repository: " + JSON.stringify(response)
    );
    return;
  }
  const commits = await response.json();
  for (const commit of commits) {
	getCommitFiles(commit.sha);
  }
}
async function getCommitFiles(commitRef) {
  const response = await fetch(
    `https://api.github.com/repos/${repoUsername}/${repo}/commits/${commitRef}`,
    {
      headers: ghHeaders,
    }
  );
  if (!response.ok) {
	showError("Could not access GitHub commit: " + JSON.stringify(response));
	return;
  };
  const { files } = await response.json();
  for (const { additions, deletions, changes } of files) {
	console.log(additions, deletions, changes)
  }
}

function showError(errorMsg) {
  errorMsgElem.textContent = errorMsg;
}
