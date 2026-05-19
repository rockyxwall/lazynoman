import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'rockyxwall';
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/anilist.json');

const QUERY = `
query {
  Viewer {
    name
    statistics {
      anime {
        count
        episodesWatched
        minutesWatched
        meanScore
        scores {
          score
          count
        }
        statuses {
          status
          count
        }
        genres {
          genre
          count
        }
        formats {
          format
          count
        }
        releaseYears {
          releaseYear
          count
        }
      }
      manga {
        count
        chaptersRead
        volumesRead
        meanScore
        scores {
          score
          count
        }
        statuses {
          status
          count
        }
        genres {
          genre
          count
        }
        formats {
          format
          count
        }
        releaseYears {
          releaseYear
          count
        }
      }
    }
  }
}
`;

async function fetchStats() {
  const token = (process.env as any).ANILIST_TOKEN;
  
  if (!token) {
    console.error('Error: ANILIST_TOKEN is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Fetching authenticated AniList stats for the current viewer...');
  
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: QUERY
      })
    });

    const data: any = await response.json();

    if (data.errors) {
      console.error('Error fetching AniList stats:', data.errors);
      process.exit(1);
    }

    const viewer = data.data.Viewer;
    if (!viewer) {
      console.error('Error: Viewer not found. Check if the token is valid.');
      process.exit(1);
    }

    const stats = viewer.statistics;
    const result = {
      lastUpdated: new Date().toISOString(),
      username: viewer.name,
      anime: stats.anime,
      manga: stats.manga
    };

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`Successfully saved stats to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Failed to sync AniList stats:', error);
    process.exit(1);
  }
}

fetchStats();
