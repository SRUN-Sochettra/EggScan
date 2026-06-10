export default function RepoItem({ repo }) {
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
