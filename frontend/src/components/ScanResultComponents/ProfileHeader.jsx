export default function ProfileHeader({ data }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <img
        src={data.avatarUrl}
        alt=""
        className="w-16 h-16 rounded-full border-2 border-brown-700 shadow-eggsm"
      />

      <div className="flex-1 min-w-0">
        <h2 className="font-display font-bold text-xl text-brown-700 truncate">
          {data.name || data.username}
        </h2>

        <a
          href={`https://github.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brown-400 hover:text-brown-600 font-medium"
        >
          @{data.username} ↗
        </a>

        {data.bio && (
          <p className="text-sm text-brown-500 mt-1 line-clamp-2">
            {data.bio}
          </p>
        )}
      </div>
    </div>
  )
}
