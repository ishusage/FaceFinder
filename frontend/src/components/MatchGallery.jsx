<div className="gallery">
  {matches.map((img) => (
    <div className="match-card">
      <img src={img} />

      <div className="match-info">
        <span>Match Found</span>
      </div>
    </div>
  ))}
</div>