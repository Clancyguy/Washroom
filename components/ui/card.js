import React from 'react';

export function Card({ children }) {
  return <div className="border rounded-lg shadow p-4 bg-white">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
