import React, { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaFileCode } from 'react-icons/fa';

function GitHub() {
  const [repoCount, setRepoCount] = useState(0);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/users/danutama/repos')
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const repoCount = data.length;
          const username = data[0].owner.login;

          setRepoCount(repoCount);
          setUsername(username);
        }
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
      });
  }, []);

  return (
    <div>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="github-repo">
          <a href="https://github.com/danutama" target="_blank" title="GitHub Repo" rel="noopener noreferrer">
            <span id="username">
              <FaGithub className="github-icon" /> {username}
            </span>
            <span id="repoCount">
              <FaFileCode className="github-icon" /> {repoCount}
            </span>
          </a>
        </div>
      )}
    </div>
  );
}

export default GitHub;
