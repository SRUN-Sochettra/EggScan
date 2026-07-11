import os

def replace_in_file(filepath, search_text, replace_text):
    with open(filepath, 'r') as f:
        content = f.read()
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Success {filepath}")
    else:
        print(f"Skipped {filepath}")

# 1. UX / A11y (Palette)
replace_in_file(
    'frontend/src/components/ScanResultComponents/RepoItem.jsx',
    'aria-label="Close analysis"',
    'aria-label="Close analysis" aria-hidden="false"'
)
replace_in_file(
    'frontend/src/components/ScanForm.jsx',
    'className="btn-primary whitespace-nowrap flex items-center gap-2 justify-center"',
    'className="btn-primary whitespace-nowrap flex items-center gap-2 justify-center focus-visible:ring-2 focus-visible:ring-brown-500 outline-none"'
)
replace_in_file(
    'frontend/src/components/Leaderboard.jsx',
    'className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm border-2 border-brown-700 text-brown-700 font-bold py-2 px-4 rounded-full shadow-eggsm hover:bg-white transition-all z-50 font-display"',
    'className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm border-2 border-brown-700 text-brown-700 font-bold py-2 px-4 rounded-full shadow-eggsm hover:bg-white transition-all z-50 font-display focus-visible:ring-2 focus-visible:ring-brown-500 outline-none"'
)
replace_in_file(
    'frontend/src/components/Leaderboard.jsx',
    'className="text-brown-700 font-bold text-xl hover:scale-110 transition-transform"',
    'className="text-brown-700 font-bold text-xl hover:scale-110 transition-transform focus-visible:ring-2 focus-visible:ring-brown-500 outline-none rounded"'
)
replace_in_file(
    'frontend/src/pages/Home.jsx',
    'className="text-brown-500 font-bold hover:text-brown-700 underline underline-offset-4 transition-colors text-sm"',
    'className="text-brown-500 font-bold hover:text-brown-700 underline underline-offset-4 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-brown-500 outline-none rounded"'
)
replace_in_file(
    'frontend/src/components/BattleResult.jsx',
    'className="btn-secondary flex items-center gap-2"',
    'className="btn-secondary flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brown-500 outline-none"'
)

# 2. Performance (Bolt)
replace_in_file(
    'backend/src/main/java/com/eggscan/service/ScanService.java',
    """    public RepoDeepDiveResponse repoDeepDive(String username, String repoName, String defaultBranch) {
        log.info("Deep diving into repository: {}/{}", username, repoName);

        GitHubTreeResponse tree = gitHubService.fetchRepoTree(username, repoName, defaultBranch);
        List<GitHubCommitResponse> commits = gitHubService.fetchRecentCommits(username, repoName);

        String readme = gitHubService.fetchFileContent(username, repoName, "README.md");
        if (readme == null) {
            readme = gitHubService.fetchFileContent(username, repoName, "readme.md");
        }

        Map<String, String> configFiles = new HashMap<>();""",
    """    public RepoDeepDiveResponse repoDeepDive(String username, String repoName, String defaultBranch) {
        log.info("Deep diving into repository: {}/{}", username, repoName);

        CompletableFuture<GitHubTreeResponse> futureTree = CompletableFuture.supplyAsync(() -> gitHubService.fetchRepoTree(username, repoName, defaultBranch), scanExecutor);
        CompletableFuture<List<GitHubCommitResponse>> futureCommits = CompletableFuture.supplyAsync(() -> gitHubService.fetchRecentCommits(username, repoName), scanExecutor);
        CompletableFuture<String> futureReadme = CompletableFuture.supplyAsync(() -> {
            String readmeContent = gitHubService.fetchFileContent(username, repoName, "README.md");
            if (readmeContent == null) {
                readmeContent = gitHubService.fetchFileContent(username, repoName, "readme.md");
            }
            return readmeContent;
        }, scanExecutor);

        CompletableFuture.allOf(futureTree, futureCommits, futureReadme).join();

        GitHubTreeResponse tree = futureTree.join();
        List<GitHubCommitResponse> commits = futureCommits.join();
        String readme = futureReadme.join();

        Map<String, String> configFiles = new HashMap<>();"""
)

# 3. Security (Sentinel)
replace_in_file(
    'backend/src/main/java/com/eggscan/controller/ScanController.java',
    """    // Repo name: max 100 characters, alphanumeric, hyphens, underscores, dots
    private static final Pattern REPO_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{1,100}$");
    // UUID v4 pattern""",
    """    // Repo name: max 100 characters, alphanumeric, hyphens, underscores, dots
    private static final Pattern REPO_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{1,100}$");
    // Branch name constraint
    private static final Pattern BRANCH_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._/\\\\-]{1,255}$");
    // UUID v4 pattern"""
)
replace_in_file(
    'backend/src/main/java/com/eggscan/controller/ScanController.java',
    """    private boolean isValidRepoName(String repoName) {
        return repoName != null && REPO_NAME_PATTERN.matcher(repoName).matches();
    }""",
    """    private boolean isValidRepoName(String repoName) {
        return repoName != null && REPO_NAME_PATTERN.matcher(repoName).matches();
    }

    private boolean isValidBranchName(String branchName) {
        return branchName != null && BRANCH_NAME_PATTERN.matcher(branchName).matches();
    }"""
)
replace_in_file(
    'backend/src/main/java/com/eggscan/controller/ScanController.java',
    """    public ResponseEntity<?> repoDeepDive(@PathVariable String username, @PathVariable String repoName, @RequestParam(required = false, defaultValue = "main") String defaultBranch) {
        if (!isValidUsername(username)) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid username format"));
        }
        if (!isValidRepoName(repoName)) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid repository name format"));
        }
        try {""",
    """    public ResponseEntity<?> repoDeepDive(@PathVariable String username, @PathVariable String repoName, @RequestParam(required = false, defaultValue = "main") String defaultBranch) {
        if (!isValidUsername(username)) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid username format"));
        }
        if (!isValidRepoName(repoName)) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid repository name format"));
        }
        if (!isValidBranchName(defaultBranch)) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid branch name format"));
        }
        try {"""
)

# Easter egg addition
replace_in_file(
    'backend/src/main/java/com/eggscan/controller/ScanController.java',
    """        if ("torvalds".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("torvalds")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Wait, are you actually Linus? *bows down*")
                    .vibe("Literal God Tier. Creator of Git and Linux.")
                    .skills(java.util.List.of("C", "Kernel", "Git", "Yelling at developers on mailing lists"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }""",
    """        if ("torvalds".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("torvalds")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Wait, are you actually Linus? *bows down*")
                    .vibe("Literal God Tier. Creator of Git and Linux.")
                    .skills(java.util.List.of("C", "Kernel", "Git", "Yelling at developers on mailing lists"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }

        if ("defunkt".equalsIgnoreCase(username)) {
            ScanResponse easterEgg = ScanResponse.builder()
                    .username("defunkt")
                    .eggVerdict("Golden Egg")
                    .eggScore(100)
                    .firstImpression("Oh wow, it's one of the founding fathers of GitHub.")
                    .vibe("Tech Royalty. The literal reason we have this site.")
                    .skills(java.util.List.of("Ruby", "Building empires", "Pioneering the modern web"))
                    .build();
            return ResponseEntity.ok(easterEgg);
        }"""
)

# 4. Config Safeties (Sentinel)
for yml in ['backend/src/main/resources/application.yml', 'backend/src/main/resources/application-prod.yml']:
    replace_in_file(yml, "token: ${GITHUB_TOKEN}", "token: ${GITHUB_TOKEN:}")
    replace_in_file(yml, "api-key: ${GROQ_API_KEY}", "api-key: ${GROQ_API_KEY:}")
