// run by doing `node update-contributors.js` in this dir
// requires node18
// optionally set GITHUB_TOKEN environment variable or create access_token.txt file to avoid rate limits

(async () => {
    const fileSystem = require("fs");
    const path = require("path");

    const headers = {};
    let token = process.env.GITHUB_TOKEN;

    // Try to read token from file if not in environment
    if (!token) {
        const tokenFilePath = path.join(__dirname, 'access_token.txt');
        if (fileSystem.existsSync(tokenFilePath)) {
            token = fileSystem.readFileSync(tokenFilePath, 'utf8').trim();
            console.log("Using GitHub token from access_token.txt");
        }
    }

    if (token) {
        headers['Authorization'] = `token ${token}`;
    } else {
        console.log("No GitHub token found. You may hit rate limits.");
        console.log("To avoid this:");
        console.log("1. Create a token at https://github.com/settings/tokens");
        console.log("2. Save it to _data/access_token.txt");
        console.log("   OR set it as: export GITHUB_TOKEN=your_token_here");
    }

    const reposResponse = await fetch("https://api.github.com/orgs/javalin/repos", { headers });

    if (!reposResponse.ok) {
        const errorData = await reposResponse.json();
        console.error("Error fetching repos:", errorData);
        console.error("Response status:", reposResponse.status);
        if (reposResponse.status === 403 || errorData.message?.includes('rate limit')) {
            console.error("\nRate limit exceeded! Please set a GitHub token:");
            console.error("1. Create a token at https://github.com/settings/tokens");
            console.error("2. Save it to _data/access_token.txt");
            console.error("   OR set it as: export GITHUB_TOKEN=your_token_here");
        }
        return;
    }

    const reposData = await reposResponse.json();

    if (!Array.isArray(reposData)) {
        console.error("Unexpected response format - expected an array of repos");
        console.error("Received:", reposData);
        return;
    }

    let repos = reposData
        .filter(it => it.fork !== true) // we only care about sources/transferred repos
        .map(it => it.name)
        .filter(it => it !== ".github"); // this one isn't all that interesting, it's just meta info for the org

    let contributions = new Map();
    let avatars = new Map();

    for (let repo of repos) {
        console.log(`Getting contributors for ${repo} ...`);
        const response = await fetch(`https://api.github.com/repos/javalin/${repo}/contributors`, { headers });
        const repoContributors = await response.json();
        console.log(`${repo} has ${repoContributors.length} contributors ...`);
        for (let user of repoContributors) {
            console.log(`Adding contributions of ${user.login} ...`);
            avatars.set(user.login, user.avatar_url);
            if (contributions.has(user.login)) {
                contributions.set(user.login, contributions.get(user.login) + user.contributions);
            } else {
                contributions.set(user.login, user.contributions);
            }
        }
        console.log("------------------------------------------------------")
    }

    let contributorArray = Array.from(contributions.keys()).map(user => ({
        username: user,
        contributions: contributions.get(user),
        avatar: avatars.get(user),
    }));

    let sortedContributorArray = contributorArray
        .sort((a, b) => b.contributions - a.contributions)
        .filter(it => it.username !== "dependabot[bot]")
        .slice(0, 15);

    fileSystem.writeFileSync("contributors.json", JSON.stringify(sortedContributorArray, null, 2));
})();
