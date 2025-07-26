import React from 'react';
import { FaGithub } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-5">
      <div className="d-flex justify-content-center align-items-center flex-column gap-2">
        <a href="https://github.com/danutama/ReactJS-AES-Encryption" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark">
          <FaGithub size={30} />
        </a>

        <small className="text-secondary">©{currentYear} Made with love by Danu Pratama</small>
      </div>
    </footer>
  );
}

export default Footer;
