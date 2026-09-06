const params = new URLSearchParams(location.search);
const videoId = params.get("video") || "";
const title = params.get("title") || "";
const player = document.querySelector("#video");

if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
  player.remove();
  const message = document.createElement("p");
  message.textContent = "Invalid YouTube video.";
  document.body.append(message);
} else {
  document.title = title ? `${title} - YouTube Shelf` : "YouTube Shelf video";
  player.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}
