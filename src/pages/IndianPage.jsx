import React from "react";
import { useNavigate } from "react-router-dom";
import MovieRow from "../components/MovieRow";

function IndianPage() {
  const navigate = useNavigate();

  // Base TMDB filters for Indian content (covers major Indian languages)
  const indianParams = {
    with_original_language: "hi|ta|te|ml|kn", // Hindi, Tamil, Telugu, Malayalam, Kannada
    region: "IN",
  };

  const handleCardClick = (item) => {
    const path = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(path);
  };

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  // Year cutoff for currently airing or upcoming
  const yearCutoff = "2025-01-01";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20">
      {/* 🥇 Top Rated Indian Movies */}
      <MovieRow
        title="Top Rated Indian Movies"
        discoverParams={{
          ...indianParams,
          sort_by: "vote_average.desc",
          "vote_count.gte": "200",
        }}
        mediaType="movie"
        onCardClick={handleCardClick}
      />

      {/* 🔥 Popular Indian Movies */}
      <MovieRow
        title="Popular Indian Movies"
        discoverParams={{
          ...indianParams,
          sort_by: "popularity.desc",
        }}
        mediaType="movie"
        onCardClick={handleCardClick}
      />

      {/* 📺 Popular Indian Series */}
      <MovieRow
        title="Popular Indian Series"
        discoverParams={{
          ...indianParams,
          sort_by: "popularity.desc",
        }}
        mediaType="tv"
        onCardClick={handleCardClick}
      />

      {/* 🕒 Currently Airing / Upcoming (2025 and beyond) */}
      <MovieRow
        title="Currently Airing / Upcoming Indian Shows"
        discoverParams={{
          ...indianParams,
          sort_by: "first_air_date.desc",
          "first_air_date.gte": yearCutoff,
        }}
        mediaType="tv"
        onCardClick={handleCardClick}
      />

      {/* 🎬 Upcoming Indian Movies (future releases) */}
      <MovieRow
        title="Upcoming Indian Movies"
        discoverParams={{
          ...indianParams,
          sort_by: "primary_release_date.desc",
          "primary_release_date.gte": today,
        }}
        mediaType="movie"
        onCardClick={handleCardClick}
      />
    </div>
  );
}

export default IndianPage;
