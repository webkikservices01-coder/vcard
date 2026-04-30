import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-['Inter']">
    <h1 className="text-8xl font-black text-black mb-4">404</h1>
    <p className="text-lg text-gray-600 mb-8 text-center">
      The page you were looking for could not be found.
    </p>
    <Link
      to="/"
      className="inline-flex items-center space-x-2 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
    >
      Go Back Home
    </Link>
  </div>
);

export default NotFound;
