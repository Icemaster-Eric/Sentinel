const commitInput = document.getElementById("commit-input");
const ghTokenInput = document.getElementById("github-token");

let commitLink = null;
let ghToken = localStorage.getItem("gh-token");
let commitUsername = null;
let commitRepo = null;
let commitRef = null;
if (ghToken) ghTokenInput.value = ghToken;
commitInput.addEventListener("input", () => {
  commitLink = commitInput.value.trim();
  let commitInfo =
    /^(?:https:\/\/)?github\.com\/([\w\-]+)\/([\w\-]+)\/commit\/(\w+)/
      .exec(commitLink)
      ?.slice?.(1);
	  if (!commitInfo) {
		alert("no")
		return;
	  }
  [commitUsername, commitRepo, commitRef] = commitInfo;
});
ghTokenInput.addEventListener("input", () => {
  ghToken = ghTokenInput.value.trim();
  localStorage.setItem("input", ghToken);
});
const ghCommitHeaders = new Headers();
ghCommitHeaders.append("Accept", "application/vnd.github+json");
ghCommitHeaders.append("Authorization", "Bearer " + ghToken);
ghCommitHeaders.append("X-GitHub-Api-Version", "2022-11-28");
async function getCommitChanges() {
  ghCommitHeaders.set("Authorization", "Bearer " + ghToken);
  const response = await fetch(
    `https://api.github.com/repos/${commitUsername}/${commitRepo}/commits/${commitRef}`,
    {
      headers: ghCommitHeaders,
    }
  );
  if (!response.ok) return null;
  const json = await response.json();
  console.log(json);
}
