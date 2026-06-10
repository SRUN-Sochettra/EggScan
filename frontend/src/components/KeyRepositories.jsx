export default function KeyRepositories({ data }) {
  return (
    <div className="card p-5 rotate-1">
      <div className="flex items-center gap-3 mb-4">
         <h3 className="font-display text-lg font-bold text-brown-700">
           Key Repositories
         </h3>
      </div>
      <div className="space-y-4">
        {data.stats?.pinnedRepos?.length > 0 ? (
          data.stats.pinnedRepos.map((repo, i) => <RepoItem key={i} repo={repo} />)
        ) : (
          data.rawData?.repos?.slice(0, 3).map((repo, i) => (
            <RepoItem key={i} repo={{
              name: repo.name,
              description: repo.description,
              primaryLanguage: repo.language,
              stars: repo.stargazers_count
            }} />
          ))
        )}
      </div>
    </div>
  )
}

export function RepoItem({ repo }) {
  return (
    <div className="border-b border-brown-200 last:border-0 pb-3 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-brown-700 break-all">{repo.name}</span>
        <div className="flex items-center gap-2 text-xs font-semibold text-brown-500 whitespace-nowrap ml-2">
          {repo.primaryLanguage && <span>{repo.primaryLanguage}</span>}
          <span className="flex items-center gap-0.5">★ {repo.stars}</span>
        </div>
      </div>
      {repo.description && <p className="text-sm text-brown-500 line-clamp-2">{repo.description}</p>}
    </div>
  )
}
